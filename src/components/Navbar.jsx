import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Navbar({ user, role }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/");
  }

  return (
    <nav style={{
      background: "#1e293b",
      borderBottom: "1px solid #334155",
      padding: "0 1.5rem",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
      flexWrap: "wrap"
    }}>
      <Link to="/" style={{ fontWeight: 700, fontSize: "1.2rem", color: "#60a5fa" }}>
        🏙️ CivicLens
      </Link>
      <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Home</Link>
        <Link to="/map" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Map</Link>
        <Link to="/dashboard" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Dashboard</Link>
        <Link to="/leaderboard" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Leaderboard</Link>
        {user ? (
          <>
            <Link to="/report"><button className="btn-primary" style={{ fontSize: "0.85rem" }}>+ Report</button></Link>
            <span style={{ color: "#64748b", fontSize: "0.85rem" }}>
              👤 {user.displayName || user.email} {role === "authority" && <span style={{ color: "#fbbf24" }}>(Authority)</span>}
            </span>
            <button className="btn-secondary" onClick={handleLogout} style={{ fontSize: "0.85rem", padding: "0.4rem 1rem" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn-secondary" style={{ fontSize: "0.85rem" }}>Login</button></Link>
            <Link to="/register"><button className="btn-primary" style={{ fontSize: "0.85rem" }}>Register</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}