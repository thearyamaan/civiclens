import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";

const SEVERITY_COLOR = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };
const STATUS_COLOR = { "Open": "#ef4444", "In Progress": "#eab308", "Resolved": "#22c55e" };

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  const filtered = filter === "All" ? issues : issues.filter(i => i.status === filter);
  const critical = issues.filter(i => i.severity === "Critical").length;

  return (
    <div className="page">
      <div className="container">

        {/* Hero */}
        <div style={{
          background: "linear-gradient(135deg, #0f2942 0%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "3rem 2rem",
          marginBottom: "2.5rem",
          border: "1px solid #1e3a5f",
          textAlign: "center"
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            background: "#0f2e20", color: "#4ade80", padding: "0.35rem 0.9rem",
            borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700,
            letterSpacing: "0.05em", marginBottom: "1.25rem"
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 0 3px rgba(74,222,128,0.2)" }} />
            LIVE COMMUNITY PLATFORM
          </div>

          <h1 style={{ fontSize: "2.75rem", fontWeight: 800, marginBottom: "1rem", lineHeight: 1.15 }}>
            <span style={{ color: "#e2e8f0" }}>Your neighbourhood, </span>
            <span style={{ color: "#34d399" }}>fixed faster.</span>
          </h1>

          <p style={{ color: "#94a3b8", fontSize: "1.05rem", maxWidth: "600px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
            CivicLens uses AI to turn citizen photos into prioritized government action.
            Report an issue in under 60 seconds. Track it until it's resolved.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
            <Link to="/report"><button className="btn-primary" style={{ fontSize: "1rem", padding: "0.8rem 2rem", fontWeight: 700 }}>📷 Report an Issue</button></Link>
            <Link to="/leaderboard"><button className="btn-secondary" style={{ fontSize: "1rem", padding: "0.8rem 2rem", fontWeight: 700 }}>🏆 Leaderboard</button></Link>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "AVG. REPORT TIME", value: "4 min" },
              { label: "AUTO-CLASSIFICATION", value: "AI" },
              { label: "TRANSPARENT TRACKING", value: "100%" },
              { label: "RED TAPE", value: "0" },
            ].map(pill => (
              <div key={pill.label} style={{
                background: "#16243a", border: "1px solid #1e3a5f", borderRadius: "10px",
                padding: "0.6rem 1.1rem", display: "flex", alignItems: "center", gap: "0.5rem"
              }}>
                <span style={{ color: "#34d399", fontWeight: 800, fontSize: "1.05rem" }}>{pill.value}</span>
                <span style={{ color: "#64748b", fontSize: "0.72rem", letterSpacing: "0.04em" }}>{pill.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { label: "TOTAL REPORTS", value: issues.length, icon: "📋", color: "#60a5fa" },
            { label: "OPEN ISSUES", value: issues.filter(i => i.status === "Open").length, icon: "🔴", color: "#f87171" },
            { label: "IN PROGRESS", value: issues.filter(i => i.status === "In Progress").length, icon: "🟡", color: "#fbbf24" },
            { label: "RESOLVED", value: issues.filter(i => i.status === "Resolved").length, icon: "✅", color: "#34d399" },
            { label: "CRITICAL", value: critical, icon: "🚨", color: "#f87171" },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center", padding: "1.25rem" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.3rem" }}>{s.icon}</div>
              <div style={{ fontSize: "1.9rem", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: "#64748b", fontSize: "0.72rem", letterSpacing: "0.04em", marginTop: "0.2rem" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h3 style={{ color: "#e2e8f0", fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "1px solid #1e293b", paddingBottom: "0.75rem" }}>
            How it works
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {[
              { step: "01", icon: "📷", title: "Snap a photo", desc: "Take a picture of any community issue you spot — pothole, broken light, garbage pile." },
              { step: "02", icon: "🤖", title: "AI classifies it", desc: "Gemini instantly categorizes the issue, sets severity, and routes it to the right department." },
              { step: "03", icon: "🗳️", title: "Community votes", desc: "Neighbors upvote real problems so the most urgent issues rise to the top." },
              { step: "04", icon: "✅", title: "Authorities act", desc: "Officials see a prioritized dashboard and update status as issues get resolved." },
            ].map(s => (
              <div key={s.step} className="card" style={{ position: "relative" }}>
                <span style={{ position: "absolute", top: "1rem", right: "1rem", color: "#334155", fontWeight: 800, fontSize: "0.85rem" }}>{s.step}</span>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                <h4 style={{ marginBottom: "0.4rem", fontSize: "0.95rem" }}>{s.title}</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Feed */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <h3 style={{ color: "#e2e8f0", fontSize: "1.1rem", margin: 0 }}>Community Feed</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {["All", "Open", "In Progress", "Resolved"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "0.4rem 1rem", borderRadius: "999px", border: "1px solid #334155",
                  background: filter === f ? "#3b82f6" : "#1e293b", color: filter === f ? "white" : "#94a3b8",
                  cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "#94a3b8", padding: "3rem" }}>
            No issues found. Be the first to report one!
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.1rem" }}>
            {filtered.map(issue => (
              <Link to={`/issue/${issue.id}`} key={issue.id}>
                <div className="card" style={{ cursor: "pointer", height: "100%", transition: "transform 0.15s, border-color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  {issue.imageBase64 && (
                    <img src={issue.imageBase64} alt="issue" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", marginBottom: "1rem" }} />
                  )}
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    <span className="badge" style={{ background: SEVERITY_COLOR[issue.severity] + "33", color: SEVERITY_COLOR[issue.severity] }}>{issue.severity}</span>
                    <span className="badge" style={{ background: STATUS_COLOR[issue.status] + "33", color: STATUS_COLOR[issue.status] }}>{issue.status}</span>
                    <span className="badge badge-blue">{issue.category}</span>
                  </div>
                  <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem" }}>{issue.summary}</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.75rem" }}>📍 {issue.location}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.8rem" }}>
                    <span>👍 {issue.votes || 0} votes</span>
                    <span>{issue.department}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}