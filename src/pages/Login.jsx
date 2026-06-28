import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch { setError("Invalid email or password"); }
    setLoading(false);
  }

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, var(--teal), var(--blue))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 1rem" }}>🏙️</div>
          <h2 className="display" style={{ fontSize: "1.6rem", fontWeight: 700 }}>Welcome back</h2>
          <p style={{ color: "var(--text-dim)", marginTop: "0.4rem", fontSize: "0.9rem" }}>Sign in to CivicLens</p>
        </div>
        <div className="card">
          {error && (
            <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.25rem", color: "var(--red)", fontSize: "0.88rem" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "0.4rem", fontWeight: 500 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "0.4rem", fontWeight: 500 }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", padding: "0.8rem" }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "var(--text-dim)", fontSize: "0.88rem" }}>
          No account? <Link to="/register" style={{ color: "var(--teal)", fontWeight: 600 }}>Create one →</Link>
        </p>
      </div>
    </div>
  );
}