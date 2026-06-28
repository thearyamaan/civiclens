import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IssueDetail from "./pages/IssueDetail";
import Leaderboard from "./pages/Leaderboard";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)", gap: "1rem" }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, var(--teal), var(--blue))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🏙️</div>
      <span className="display" style={{ color: "var(--teal)", fontSize: "1.1rem", fontWeight: 600 }}>Loading CivicLens...</span>
    </div>
  );

  return (
    <BrowserRouter>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/report" element={user ? <Report user={user} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/issue/:id" element={<IssueDetail user={user} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}