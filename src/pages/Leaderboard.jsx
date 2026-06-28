import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    return onSnapshot(query(collection(db, "issues")), snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Build leaderboard from issues
  const reporterMap = {};
  issues.forEach(issue => {
    if (!issue.reportedBy) return;
    if (!reporterMap[issue.reportedBy]) {
      reporterMap[issue.reportedBy] = {
        name: issue.reportedByName || "Citizen",
        reports: 0,
        votesReceived: 0,
        resolved: 0,
      };
    }
    reporterMap[issue.reportedBy].reports += 1;
    reporterMap[issue.reportedBy].votesReceived += issue.votes || 0;
    if (issue.status === "Resolved") reporterMap[issue.reportedBy].resolved += 1;
  });

  const leaders = Object.entries(reporterMap)
    .map(([uid, data]) => ({
      uid, ...data,
      points: data.reports * 10 + data.votesReceived * 5 + data.resolved * 20
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ textAlign: "center", padding: "2rem 0 2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🏆</div>
          <h2 className="display" style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Civic Champions
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: "0.95rem" }}>
            Citizens earning points by reporting and resolving community issues
          </p>
        </div>

        {/* How points work */}
        <div className="card" style={{ marginBottom: "1.5rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            ["📢 Report an issue", "+10 pts"],
            ["👍 Receive a vote", "+5 pts"],
            ["✅ Issue resolved", "+20 pts"],
          ].map(([action, pts]) => (
            <div key={action} style={{ textAlign: "center" }}>
              <div style={{ color: "var(--teal)", fontWeight: 700, fontSize: "1.1rem" }}>{pts}</div>
              <div style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginTop: "0.2rem" }}>{action}</div>
            </div>
          ))}
        </div>

        {leaders.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-dim)" }}>
            No reports yet. Be the first civic champion!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {leaders.map((leader, i) => (
              <div key={leader.uid} className="card fade-up" style={{
                display: "flex", alignItems: "center", gap: "1rem",
                animationDelay: `${i * 0.06}s`,
                borderColor: i === 0 ? "#ffd166" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c3b" : "var(--border)"
              }}>
                <div style={{ fontSize: "1.8rem", minWidth: 40, textAlign: "center" }}>
                  {MEDALS[i] || `#${i + 1}`}
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `linear-gradient(135deg, var(--teal-mid), var(--blue-dim))`,
                  border: "1px solid var(--teal)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: "var(--teal)", fontSize: "1rem"
                }}>
                  {leader.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{leader.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.2rem" }}>
                    {leader.reports} reports · {leader.votesReceived} votes received · {leader.resolved} resolved
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="display" style={{ fontSize: "1.4rem", fontWeight: 700, color: i === 0 ? "var(--yellow)" : "var(--teal)" }}>
                    {leader.points}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>points</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}