import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from "firebase/firestore";

const SEV_COLOR = { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium", Low: "badge-low" };
const STATUS_COLOR = { "Open": "badge-open", "In Progress": "badge-progress", "Resolved": "badge-resolved" };
const CATEGORY_ICONS = { Pothole: "🕳️", Streetlight: "💡", "Water Leakage": "💧", Garbage: "🗑️", Sewage: "🚰", "Road Damage": "🛣️", "Tree Hazard": "🌳", Other: "📍" };

export default function IssueDetail({ user }) {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [voting, setVoting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    return onSnapshot(doc(db, "issues", id), snap => {
      if (snap.exists()) setIssue({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  async function handleVote() {
    if (!user) return navigate("/login");
    if (issue.voters?.includes(user.uid)) return;
    setVoting(true);
    await updateDoc(doc(db, "issues", id), {
      votes: increment(1),
      voters: arrayUnion(user.uid)
    });
    setVoting(false);
  }

  if (!issue) return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--teal)" }} className="pulse">Loading issue...</div>
    </div>
  );

  const hasVoted = issue.voters?.includes(user?.uid);
  const progress = issue.status === "Resolved" ? 100 : issue.status === "In Progress" ? 50 : 10;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: "1.5rem", fontSize: "0.85rem" }}>
          ← Back
        </button>

        {issue.imageBase64 && (
          <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: "1.5rem", maxHeight: 360 }}>
            <img src={issue.imageBase64} alt="issue" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <span className={`badge ${SEV_COLOR[issue.severity]}`}>{issue.severity}</span>
            <span className="badge badge-cat">{CATEGORY_ICONS[issue.category]} {issue.category}</span>
            <span className={`badge ${STATUS_COLOR[issue.status]}`}>{issue.status}</span>
          </div>

          <h2 className="display" style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>{issue.summary}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            {[
              ["📍 Location", issue.location],
              ["🏢 Department", issue.department],
              ["👤 Reported by", issue.reportedByName],
              ["📋 Category", issue.category],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "var(--surface2)", borderRadius: 10, padding: "0.75rem 1rem" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{k}</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          {issue.description && (
            <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1rem" }}>{issue.description}</p>
          )}

          {issue.recommendedAction && (
            <div style={{ background: "var(--teal-dim)", border: "1px solid var(--teal-mid)", borderRadius: 10, padding: "0.75rem 1rem" }}>
              <span style={{ color: "var(--teal)", fontSize: "0.85rem" }}>💡 <strong>AI Recommendation:</strong> {issue.recommendedAction}</span>
            </div>
          )}
        </div>

        {/* Resolution progress */}
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Resolution Progress</span>
            <span style={{ color: "var(--teal)", fontSize: "0.85rem", fontWeight: 600 }}>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.75rem" }}>
            {["Reported", "In Progress", "Resolved"].map((s, i) => (
              <span key={s} style={{
                fontSize: "0.75rem",
                color: progress >= (i + 1) * 33 ? "var(--teal)" : "var(--text-muted)",
                fontWeight: progress >= (i + 1) * 33 ? 600 : 400
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Vote */}
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--teal)", fontFamily: "'Space Grotesk', sans-serif" }}>
              {issue.votes || 0}
            </div>
            <div style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>community votes</div>
          </div>
          <button
            className={`btn ${hasVoted ? "btn-secondary" : "btn-primary"}`}
            onClick={handleVote}
            disabled={voting || hasVoted}
            style={{ fontSize: "0.9rem" }}
          >
            {hasVoted ? "✓ Voted" : voting ? "Voting..." : "👍 Upvote this issue"}
          </button>
        </div>
      </div>
    </div>
  );
}