import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { generatePredictiveInsights } from "../gemini";

export default function Dashboard({ user, role }) {
  const [issues, setIssues] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const isAuthority = role === "authority";

  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  async function getInsights() {
    setLoadingInsights(true);
    const result = await generatePredictiveInsights(issues);
    setInsights(result);
    setLoadingInsights(false);
  }

  async function updateStatus(id, status) {
    if (!isAuthority) return;
    await updateDoc(doc(db, "issues", id), { status });
  }

  const sorted = [...issues].sort((a, b) => {
    const sev = { Critical: 4, High: 3, Medium: 2, Low: 1 };
    return (sev[b.severity] || 0) - (sev[a.severity] || 0);
  });

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ color: "#60a5fa", margin: 0 }}>Community Issue Dashboard</h2>
            <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
              Everyone can view progress. {isAuthority ? "You can update issue status." : "Only authorities can change issue status."}
            </p>
          </div>
          {isAuthority && (
            <button className="btn-primary" onClick={getInsights} disabled={loadingInsights}>
              {loadingInsights ? "Analyzing..." : "🤖 Get AI Insights"}
            </button>
          )}
        </div>

        {insights && (
          <div className="card" style={{ margin: "1.5rem 0", borderColor: "#3b82f6" }}>
            <h3 style={{ color: "#60a5fa", marginBottom: "1rem" }}>🔮 Predictive Insights</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              <div><div style={{ color: "#64748b", fontSize: "0.8rem" }}>Hotspot Area</div><div style={{ fontWeight: 600 }}>{insights.hotspot}</div></div>
              <div><div style={{ color: "#64748b", fontSize: "0.8rem" }}>Top Issue</div><div style={{ fontWeight: 600 }}>{insights.topCategory}</div></div>
            </div>
            <p style={{ marginTop: "1rem", color: "#94a3b8" }}>{insights.insight}</p>
            <p style={{ color: "#60a5fa", fontSize: "0.9rem", marginTop: "0.5rem" }}>💡 {insights.recommendation}</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1rem", margin: "1.5rem 0" }}>
          {[
            { label: "Total", value: issues.length },
            { label: "Critical", value: issues.filter(i => i.severity === "Critical").length },
            { label: "Open", value: issues.filter(i => i.status === "Open").length },
            { label: "In Progress", value: issues.filter(i => i.status === "In Progress").length },
            { label: "Resolved", value: issues.filter(i => i.status === "Resolved").length }
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#60a5fa" }}>{s.value}</div>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Issue", "Location", "Severity", "Department", "Votes", "Status"].map(h => (
                  <th key={h} style={{ padding: "1rem", textAlign: "left", color: "#64748b", fontSize: "0.85rem", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(issue => (
                <tr key={issue.id} style={{ borderBottom: "1px solid #1e293b" }}>
                  <td style={{ padding: "0.85rem 1rem", maxWidth: "220px" }}>
                    <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>{issue.summary?.slice(0, 50)}</div>
                    <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{issue.category}</div>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontSize: "0.85rem" }}>{issue.location}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <span className={`badge severity-${issue.severity}`}>{issue.severity}</span>
                  </td>
                  <td style={{ padding: "0.85rem 1rem", color: "#94a3b8", fontSize: "0.85rem" }}>{issue.department}</td>
                  <td style={{ padding: "0.85rem 1rem", color: "#60a5fa", fontWeight: 600 }}>{issue.votes || 0}</td>
                  <td style={{ padding: "0.85rem 1rem" }}>
                    {isAuthority ? (
                      <select value={issue.status} onChange={e => updateStatus(issue.id, e.target.value)}
                        style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem", width: "auto" }}>
                        <option>Open</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                      </select>
                    ) : (
                      <span className={`badge status-${issue.status?.replace(" ", "-")}`}>{issue.status}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}