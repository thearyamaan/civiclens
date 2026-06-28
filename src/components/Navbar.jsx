import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    navigate("/");
  }

  const active = (path) => location.pathname === path
    ? { color: "var(--teal)", fontWeight: 600 }
    : {};

  return (
    <nav style={{
      background: "rgba(8,15,26,0.92)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)",
      padding: "0 1.5rem",
      height: "68px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 200,
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "linear-gradient(135deg, var(--teal), var(--blue))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1rem"
        }}>🏙️</div>
        <span className="display" style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>
          Civic<span style={{ color: "var(--teal)" }}>Lens</span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <Link to="/">
          <button className="btn btn-ghost" style={{ fontSize: "0.85rem", ...active("/") }}>Map</button>
        </Link>
        {user && (
          <>
            <Link to="/report">
              <button className="btn btn-ghost" style={{ fontSize: "0.85rem", ...active("/report") }}>Report</button>
            </Link>
            <Link to="/dashboard">
              <button className="btn btn-ghost" style={{ fontSize: "0.85rem", ...active("/dashboard") }}>Dashboard</button>
            </Link>
            <Link to="/leaderboard">
              <button className="btn btn-ghost" style={{ fontSize: "0.85rem", ...active("/leaderboard") }}>🏆</button>
            </Link>
          </>
        )}

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "0.75rem", paddingLeft: "0.75rem", borderLeft: "1px solid var(--border)" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--teal-mid), var(--blue-dim))",
              border: "1px solid var(--teal)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8rem", fontWeight: 700, color: "var(--teal)"
            }}>
              {(user.displayName || user.email)[0].toUpperCase()}
            </div>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: "0.82rem", padding: "0.4rem 0.9rem" }}>
              Sign out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem", marginLeft: "0.5rem" }}>
            <Link to="/login"><button className="btn btn-secondary" style={{ fontSize: "0.85rem" }}>Sign in</button></Link>
            <Link to="/register"><button className="btn btn-primary" style={{ fontSize: "0.85rem" }}>Join</button></Link>
          </div>
        )}
      </div>
    </nav>
  );
}