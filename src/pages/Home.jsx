import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";

const SEV_COLOR = { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium", Low: "badge-low" };
const STATUS_COLOR = { "Open": "badge-open", "In Progress": "badge-progress", "Resolved": "badge-resolved" };
const CATEGORY_ICONS = {
  Pothole: "🕳️", Streetlight: "💡", "Water Leakage": "💧",
  Garbage: "🗑️", Sewage: "🚰", "Road Damage": "🛣️",
  "Tree Hazard": "🌳", Other: "📍"
};

const HOW_IT_WORKS = [
  { icon: "📸", title: "Snap a photo", desc: "Take a picture of any community issue you spot — pothole, broken light, garbage pile." },
  { icon: "🤖", title: "AI classifies it", desc: "Gemini Vision instantly categorizes the issue, sets severity, and routes it to the right department." },
  { icon: "🗳️", title: "Community votes", desc: "Neighbors upvote real problems so the most urgent issues rise to the top." },
  { icon: "✅", title: "Authorities act", desc: "Officials see a prioritized dashboard and update status as issues get resolved." },
];

const IMPACT = [
  { value: "4 min", label: "avg. report time" },
  { value: "AI", label: "auto-classification" },
  { value: "100%", label: "transparent tracking" },
  { value: "0", label: "red tape" },
];

export default function Home({ user }) {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const cats = ["All", ...Array.from(new Set(issues.map(i => i.category).filter(Boolean)))];

  const filtered = issues.filter(i => {
    const matchStatus = filter === "All" || i.status === filter;
    const matchCat = catFilter === "All" || i.category === catFilter;
    const matchSearch = !search || i.summary?.toLowerCase().includes(search.toLowerCase()) || i.location?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  const stats = [
    { label: "Total Reports", value: issues.length, color: "var(--teal)", icon: "📋" },
    { label: "Open Issues", value: issues.filter(i => i.status === "Open").length, color: "var(--red)", icon: "🔴" },
    { label: "In Progress", value: issues.filter(i => i.status === "In Progress").length, color: "var(--yellow)", icon: "🟡" },
    { label: "Resolved", value: issues.filter(i => i.status === "Resolved").length, color: "var(--green)", icon: "✅" },
    { label: "Critical", value: issues.filter(i => i.severity === "Critical").length, color: "var(--orange)", icon: "🚨" },
  ];

  return (
    <div style={{ background: "var(--bg)" }}>

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(160deg, #0d1b2a 0%, #0a1628 50%, #080f1a 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "4rem 0 3rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
          backgroundSize: "40px 40px",
          opacity: 0.3,
        }} />
        {/* Glow */}
        <div style={{
          position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, #00d4aa14 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container" style={{ position: "relative" }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", boxShadow: "0 0 10px var(--teal)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--teal)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Live Community Platform
              </span>
            </div>

            <h1 className="display" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.25rem" }}>
              Your neighbourhood,<br />
              <span style={{ color: "var(--teal)" }}>fixed faster.</span>
            </h1>

            <p style={{ color: "var(--text-dim)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2rem", maxWidth: 520 }}>
              CivicLens uses AI to turn citizen photos into prioritized government action.
              Report an issue in 60 seconds. Track it until it's resolved.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {user ? (
                <Link to="/report">
                  <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2rem" }}>
                    📸 Report an Issue
                  </button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2rem" }}>
                      Join the Community
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="btn btn-secondary" style={{ fontSize: "1rem", padding: "0.85rem 1.5rem" }}>
                      Sign in
                    </button>
                  </Link>
                </>
              )}
              <Link to="/leaderboard">
                <button className="btn btn-secondary" style={{ fontSize: "1rem", padding: "0.85rem 1.5rem" }}>
                  🏆 Leaderboard
                </button>
              </Link>
            </div>
          </div>

          {/* Impact pills */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "3rem", flexWrap: "wrap" }}>
            {IMPACT.map(i => (
              <div key={i.label} style={{
                background: "var(--surface2)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "0.6rem 1.1rem",
                display: "flex", alignItems: "center", gap: "0.6rem"
              }}>
                <span className="display" style={{ color: "var(--teal)", fontWeight: 700, fontSize: "1.1rem" }}>{i.value}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>

        {/* ── STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem", marginBottom: "3rem" }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "1.25rem 1rem",
              textAlign: "center",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = s.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{s.icon}</div>
              <div className="display" style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.2rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ marginBottom: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <h2 className="display" style={{ fontSize: "1.3rem", fontWeight: 700 }}>How it works</h2>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "1.5rem",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: 12, right: 14,
                  fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "0.05em"
                }}>0{i + 1}</div>
                <div style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>{step.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: "0.4rem", fontSize: "0.95rem" }}>{step.title}</div>
                <div style={{ color: "var(--text-dim)", fontSize: "0.83rem", lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ISSUES FEED ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <h2 className="display" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Community Feed</h2>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{filtered.length} issue{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Search + filters */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" placeholder="🔍  Search issues or locations..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: 280 }} />
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {["All", "Open", "In Progress", "Resolved"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "0.38rem 0.9rem", borderRadius: "999px", border: "1px solid",
                  borderColor: filter === f ? "var(--teal)" : "var(--border)",
                  background: filter === f ? "var(--teal-dim)" : "transparent",
                  color: filter === f ? "var(--teal)" : "var(--text-dim)",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
                }}>{f}</button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
              {["grid", "list"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "0.38rem 0.7rem", borderRadius: 8, border: "1px solid",
                  borderColor: view === v ? "var(--teal)" : "var(--border)",
                  background: view === v ? "var(--teal-dim)" : "transparent",
                  color: view === v ? "var(--teal)" : "var(--text-dim)",
                  fontSize: "0.9rem", cursor: "pointer"
                }}>{v === "grid" ? "⊞" : "☰"}</button>
              ))}
            </div>
          </div>

          {/* Category chips */}
          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {cats.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                padding: "0.28rem 0.8rem", borderRadius: "999px", border: "1px solid",
                borderColor: catFilter === c ? "var(--blue)" : "var(--border)",
                background: catFilter === c ? "var(--blue-dim)" : "transparent",
                color: catFilter === c ? "var(--blue)" : "var(--text-muted)",
                fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
              }}>{c !== "All" ? CATEGORY_ICONS[c] + " " : ""}{c}</button>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 ? (
            <div style={{
              background: "var(--surface)", border: "2px dashed var(--border2)",
              borderRadius: 18, padding: "4rem 2rem", textAlign: "center"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔭</div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>No issues here yet</h3>
              <p style={{ color: "var(--text-dim)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                Be the first to report a community issue in your area.
              </p>
              {user && (
                <Link to="/report">
                  <button className="btn btn-primary">📸 Report the first issue</button>
                </Link>
              )}
            </div>
          ) : view === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {filtered.map((issue, i) => (
                <Link to={`/issue/${issue.id}`} key={issue.id}>
                  <div className="card issue-card fade-up" style={{ animationDelay: `${i * 0.05}s`, height: "100%", display: "flex", flexDirection: "column" }}>
                    {issue.imageBase64 ? (
                      <div style={{ margin: "-1.5rem -1.5rem 1rem", borderRadius: "18px 18px 0 0", overflow: "hidden", height: 170, position: "relative" }}>
                        <img src={issue.imageBase64} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d1b2a88, transparent)" }} />
                      </div>
                    ) : (
                      <div style={{ margin: "-1.5rem -1.5rem 1rem", borderRadius: "18px 18px 0 0", height: 90, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem" }}>
                        {CATEGORY_ICONS[issue.category] || "📍"}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                      <span className={`badge ${SEV_COLOR[issue.severity] || "badge-medium"}`}>{issue.severity}</span>
                      <span className={`badge ${STATUS_COLOR[issue.status] || "badge-open"}`}>{issue.status}</span>
                      <span className="badge badge-cat">{CATEGORY_ICONS[issue.category] || "📍"} {issue.category}</span>
                    </div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.5rem", flex: 1, lineHeight: 1.4 }}>
                      {issue.summary?.slice(0, 80)}
                    </h3>
                    <p style={{ color: "var(--text-dim)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                      📍 {issue.location}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-muted)", fontSize: "0.78rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                      <span style={{ color: issue.votes > 0 ? "var(--teal)" : "var(--text-muted)", fontWeight: issue.votes > 0 ? 700 : 400 }}>
                        👍 {issue.votes || 0} votes
                      </span>
                      <span style={{ background: "var(--surface2)", padding: "0.2rem 0.6rem", borderRadius: 6, fontSize: "0.74rem" }}>{issue.department}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* CTA card at the end */}
              {user && (
                <Link to="/report">
                  <div style={{
                    border: "2px dashed var(--border2)", borderRadius: 18,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    minHeight: 200, cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
                    background: "transparent",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--teal)"; e.currentTarget.style.background = "var(--teal-dim)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>＋</div>
                    <div style={{ color: "var(--text-dim)", fontWeight: 600, fontSize: "0.9rem" }}>Report an issue</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginTop: "0.25rem" }}>Help your community</div>
                  </div>
                </Link>
              )}
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {["Issue", "Location", "Category", "Severity", "Status", "Votes"].map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(issue => (
                    <tr key={issue.id} style={{ cursor: "pointer" }} onClick={() => window.location.href = `/issue/${issue.id}`}>
                      <td style={{ fontWeight: 500, maxWidth: 220 }}>{issue.summary?.slice(0, 55)}...</td>
                      <td style={{ color: "var(--text-dim)" }}>{issue.location}</td>
                      <td>{CATEGORY_ICONS[issue.category]} {issue.category}</td>
                      <td><span className={`badge ${SEV_COLOR[issue.severity]}`}>{issue.severity}</span></td>
                      <td><span className={`badge ${STATUS_COLOR[issue.status]}`}>{issue.status}</span></td>
                      <td style={{ color: "var(--teal)", fontWeight: 700 }}>{issue.votes || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── COMMUNITY CTA ── */}
        {!user && (
          <div style={{
            marginTop: "3rem",
            background: "linear-gradient(135deg, var(--surface2) 0%, #0d2137 100%)",
            border: "1px solid var(--border2)",
            borderRadius: 18,
            padding: "3rem 2rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)",
              width: 300, height: 200,
              background: "radial-gradient(ellipse, #00d4aa0a 0%, transparent 70%)",
            }} />
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🏘️</div>
            <h2 className="display" style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Be the change in your community
            </h2>
            <p style={{ color: "var(--text-dim)", marginBottom: "2rem", maxWidth: 420, margin: "0 auto 2rem", lineHeight: 1.7 }}>
              Join thousands of citizens making their neighbourhoods better, one report at a time.
            </p>
            <Link to="/register">
              <button className="btn btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2.5rem" }}>
                Get started — it's free
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}