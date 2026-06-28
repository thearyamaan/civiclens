import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["Pothole", "Streetlight", "Water Leakage", "Garbage", "Sewage", "Road Damage", "Tree Hazard", "Other"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const DEPARTMENTS = ["Public Works", "Electricity Board", "Water Authority", "Sanitation Department", "Parks Department"];
const CATEGORY_ICONS = { Pothole: "🕳️", Streetlight: "💡", "Water Leakage": "💧", Garbage: "🗑️", Sewage: "🚰", "Road Damage": "🛣️", "Tree Hazard": "🌳", Other: "📍" };

function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 600;
        let w = img.width, h = img.height;
        if (w > max) { h = (h * max) / w; w = max; }
        if (h > max) { w = (w * max) / h; h = max; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function analyzeWithGemini(base64Full, description) {
 const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
  const base64Data = base64Full.split(",")[1];
  const prompt = `You are an AI for a civic issue reporting app. Analyze this image and description: "${description}". Respond ONLY with valid JSON:
{"category":"one of Pothole/Streetlight/Water Leakage/Garbage/Sewage/Road Damage/Tree Hazard/Other","severity":"one of Low/Medium/High/Critical","department":"one of Public Works/Electricity Board/Water Authority/Sanitation Department/Parks Department","summary":"one sentence describing the issue","recommendedAction":"one sentence on what should be done"}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64Data } }] }]
      })
    });
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    return null;
  }
}

export default function Report({ user }) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSmall, setImageSmall] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [category, setCategory] = useState("Other");
  const [severity, setSeverity] = useState("Medium");
  const [department, setDepartment] = useState("Public Works");
  const [summary, setSummary] = useState("");
  const [recommendedAction, setRecommendedAction] = useState("");
  const [aiDone, setAiDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAnalyzing(true); setAiDone(false);
    const resized = await resizeImage(file);
    setImagePreview(resized); setImageSmall(resized);
    const result = await analyzeWithGemini(resized, description);
    if (result) {
      setCategory(result.category || "Other");
      setSeverity(result.severity || "Medium");
      setDepartment(result.department || "Public Works");
      setSummary(result.summary || "");
      setRecommendedAction(result.recommendedAction || "");
    }
    setAiDone(true); setAnalyzing(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!location) return setError("Please enter a location");
    setSubmitting(true); setError("");
    try {
      await addDoc(collection(db, "issues"), {
        description, location,
        imageBase64: imageSmall || null,
        category, severity, department,
        summary: summary || description,
        recommendedAction,
        status: "Open", votes: 0, voters: [],
        reportedBy: user.uid,
        reportedByName: user.displayName || user.email,
        createdAt: new Date()
      });
      navigate("/");
    } catch (err) {
      setError("Failed to submit: " + err.message);
    }
    setSubmitting(false);
  }

  const sevColor = { Low: "var(--green)", Medium: "var(--yellow)", High: "var(--orange)", Critical: "var(--red)" };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 660 }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--teal)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>New Report</span>
          </div>
          <h2 className="display" style={{ fontSize: "1.8rem", fontWeight: 700 }}>Report a Community Issue</h2>
          <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginTop: "0.4rem" }}>Upload a photo and our AI will classify it automatically.</p>
        </div>

        {error && (
          <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1.25rem", color: "var(--red)", fontSize: "0.88rem" }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Photo upload */}
          <div className="card">
            <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              📷 Photo
            </label>
            {!imagePreview ? (
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "2px dashed var(--border2)", borderRadius: 12, padding: "2.5rem",
                cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
                background: "var(--surface2)"
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--teal)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border2)"}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📸</div>
                <div style={{ color: "var(--text-dim)", fontWeight: 600, marginBottom: "0.25rem" }}>Click to upload a photo</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>JPG, PNG up to 10MB</div>
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              </label>
            ) : (
              <div style={{ position: "relative" }}>
                <img src={imagePreview} alt="preview" style={{ width: "100%", borderRadius: 10, maxHeight: 240, objectFit: "cover" }} />
                <button type="button" onClick={() => { setImagePreview(null); setImageSmall(null); setAiDone(false); }}
                  style={{ position: "absolute", top: 8, right: 8, background: "#00000088", color: "white", border: "none", borderRadius: 6, padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: "0.8rem" }}>
                  ✕ Remove
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="card">
            <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              📝 Description
            </label>
            <textarea rows={3} placeholder="Describe what you see — the more detail the better..." value={description}
              onChange={e => setDescription(e.target.value)} required
              style={{ resize: "vertical" }} />
          </div>

          {/* Location */}
          <div className="card">
            <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              📍 Location
            </label>
            <input type="text" placeholder="e.g. MG Road, near SBI ATM, Sector 12" value={location}
              onChange={e => setLocation(e.target.value)} required />
          </div>

          {/* AI analyzing */}
          {analyzing && (
            <div className="card" style={{ borderColor: "var(--teal)", background: "var(--teal-dim)", textAlign: "center", padding: "1.5rem" }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🤖</div>
              <div style={{ color: "var(--teal)", fontWeight: 600 }} className="pulse">AI is analyzing your image...</div>
              <div style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginTop: "0.25rem" }}>Gemini Vision is classifying the issue</div>
            </div>
          )}

          {/* AI result */}
          {aiDone && (
            <div className="card card-glow fade-up">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "1.1rem" }}>🤖</span>
                <h3 style={{ color: "var(--teal)", fontWeight: 700, fontSize: "0.95rem" }}>AI Analysis — edit if needed</h3>
              </div>

              {summary && (
                <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.9rem", color: "var(--text-dim)" }}>
                  {summary}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 600, textTransform: "uppercase" }}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 600, textTransform: "uppercase" }}>Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value)}
                    style={{ borderColor: sevColor[severity], color: sevColor[severity] }}>
                    {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 600, textTransform: "uppercase" }}>Routed to Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              {recommendedAction && (
                <div style={{ marginTop: "0.75rem", background: "var(--teal-dim)", border: "1px solid var(--teal-mid)", borderRadius: 10, padding: "0.65rem 1rem" }}>
                  <span style={{ color: "var(--teal)", fontSize: "0.85rem" }}>💡 {recommendedAction}</span>
                </div>
              )}
            </div>
          )}

          {/* Manual classification (no image yet) */}
          {!aiDone && !analyzing && (
            <div className="card">
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", fontWeight: 600, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                📋 Manual Classification
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Severity</label>
                  <select value={severity} onChange={e => setSeverity(e.target.value)}>
                    {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={submitting || analyzing}
            style={{ width: "100%", justifyContent: "center", padding: "0.9rem", fontSize: "1rem", borderRadius: 12 }}>
            {submitting ? "⏳ Submitting..." : "🚀 Submit Report"}
          </button>

        </form>
      </div>
    </div>
  );
}