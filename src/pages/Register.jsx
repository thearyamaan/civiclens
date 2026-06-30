import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        points: 0,
        role,
        createdAt: new Date()
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: "100%", maxWidth: "440px" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#60a5fa" }}>Join CivicLens</h2>
        {error && <p style={{ color: "#fca5a5", marginBottom: "1rem" }}>{error}</p>}
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} required />

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", color: "#94a3b8", fontSize: "0.9rem" }}>
              I am registering as:
            </label>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setRole("citizen")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: role === "citizen" ? "2px solid #3b82f6" : "1px solid #334155",
                  background: role === "citizen" ? "#1e3a5f" : "#0f172a",
                  color: role === "citizen" ? "#93c5fd" : "#94a3b8",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                👤 Citizen
              </button>
              <button
                type="button"
                onClick={() => setRole("authority")}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: role === "authority" ? "2px solid #3b82f6" : "1px solid #334155",
                  background: role === "authority" ? "#1e3a5f" : "#0f172a",
                  color: role === "authority" ? "#93c5fd" : "#94a3b8",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                🏢 Authority
              </button>
            </div>
            <p style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.5rem" }}>
              {role === "citizen"
                ? "Report issues, vote on community problems, and track resolutions."
                : "Manage issue status, view analytics, and respond to community reports."}
            </p>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p style={{ marginTop: "1rem", color: "#94a3b8" }}>
          Already have an account? <Link to="/login" style={{ color: "#60a5fa" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}