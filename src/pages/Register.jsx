import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name, email, points: 0, role: "citizen",
        reportsCount: 0, votesGiven: 0, createdAt: new Date()
      });
      navigate("/");
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, var(--teal), var(--blue))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", margin: "0 auto 1rem" }}>🏙️</div>
          <h2 className="display" style={{ fontSize: "1.6rem", fontWeight: 700 }}>Join CivicLens</h2>
          <p style={{ color: "var(--text-dim)", marginTop: "0.4rem", fontSize: "0.9rem" }}>Make your community better</p>
        </div>
        <div className="card">
          {error && (
            <div style={{ background: "var(--red-dim)", border: "1px solid var(--red)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1.25rem", color: "var(--red)", fontSize: "0.88rem" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "0.4rem", fontWeight: 500 }}>Full name</label>
              <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "0.4rem", fontWeight: 500 }}>Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "0.4rem", fontWeight: 500 }}>Password</label>
              <input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", padding: "0.8rem" }}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", marginTop: "1.25rem", color: "var(--text-dim)", fontSize: "0.88rem" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--teal)", fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}