import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { generatePredictiveInsights } from "../gemini";

const SEV_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };
const SEV_COLOR = { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium", Low: "badge-low" };

export default function Dashboard({ user }) {
  const [issues, setIssues] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  async function getInsights() {
    setLoadingInsights(true);
    const result = await generatePredictiveInsights(issues);
    setInsights(result);
    setLoadingInsights(false);
  }

  async function updateStatus(id, status) {
    await updateDoc(doc(db, "issues", id), { status });
  }

  const filtered = statusFilter === "All" ? issues : issues.filter(i => i.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => (SEV_ORDER[b.severity] || 0) - (SEV_ORDER[a.severity] || 0));

  const catBreakdown = issues.reduce((acc, i) => {
    acc[i.category] = (acc[i.category] || 0) + 1; return acc;
  }, {});

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 className="display" style={{ fontSize: "1.6rem", fontWeight: 700 }}>Authority Dashboard</h2>
            <p style={{ color: "var(--text-dim)", fontSize: "0.88rem", marginTop: "0.25rem" }}>Manage and resolve community issues</p>
          </div>
          <button className="btn btn-primary" onClick={getInsights} disabled={loadingInsights}>
            {loadingInsights ? "⏳ Analyzing..." : "🤖 AI Insights"}
          </button>
        </div>

        {/* AI Insights */}
        {insights && (
          <div className="card card-glow fade-up" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🔮</span>
              <h3 style={{ color: "var(--teal)", fontWeight: 700 }}>Predictive Insights</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              {[
                ["Hotspot Area", insights.hotspot],
                ["Top Issue Type", insights.topCategory],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "var(--surface2)", borderRadius: 10, padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{k}</div>
                  <div style={{ fontWeight: 700, color: "var(--teal)" }}>{v}</div>
                </div>
              ))}
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>{insights.insight}</p>
            <p style={{ color: "var(--teal)", fontSize: "0.88rem" }}>💡 {insights.recommendation}</p>
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total", value: issues.length, color: "var(--teal)" },
            { label: "Critical", value: issues.filter(i => i.severity === "Critical").length, color: "var(--red)" },
            { label: "Open", value: issues.filter(i => i.status === "Open").length, color: "var(--orange)" },
            { label: "In Progress", value: issues.filter(i => i.status === "In Progress").length, color: "var(--yellow)" },
            { label: "Resolved", value: issues.filter(i => i.status === "Resolved").length, color: "var(--green)" },
          ].map(s => (
            <div key={s.label} className="stat-pill">
              <div className="stat-num" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.95rem" }}>Issues by Category</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} style={{ background: "var(--surface2)", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: "0.82rem" }}>
                <span style={{ color: "var(--text-dim)" }}>{cat}</span>
                <span style={{ color: "var(--teal)", fontWeight: 700, marginLeft: "0.5rem" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}>
          {["All", "Open", "In Progress", "Resolved"].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              padding: "0.4rem 1rem", borderRadius: "999px", border: "1px solid",
              borderColor: statusFilter === f ? "var(--teal)" : "var(--border)",
              background: statusFilter === f ? "var(--teal-dim)" : "transparent",
              color: statusFilter === f ? "var(--teal)" : "var(--text-dim)",
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer"
            }}>{f}</button>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                {["Issue", "Location", "Severity", "Votes", "Status", "Action"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {sorted.map(issue => (
                <tr key={issue.id}>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.15rem" }}>{issue.summary?.slice(0, 50)}...</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{issue.category}</div>
                  </td>
                  <td style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>{issue.location}</td>
                  <td><span className={`badge ${SEV_COLOR[issue.severity]}`}>{issue.severity}</span></td>
                  <td style={{ color: "var(--teal)", fontWeight: 700 }}>{issue.votes || 0}</td>
                  <td>
                    <span className={`badge ${issue.status === "Open" ? "badge-open" : issue.status === "In Progress" ? "badge-progress" : "badge-resolved"}`}>
                      {issue.status}
                    </span>
                  </td>
                  <td>
                    <select value={issue.status} onChange={e => updateStatus(issue.id, e.target.value)}
                      style={{ width: "auto", padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
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