import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import IssueDetail from "./pages/IssueDetail";
import MapPage from "./pages/Map";
import Leaderboard from "./pages/Leaderboard";
import Navbar from "./components/Navbar";

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          setRole(snap.exists() ? snap.data().role : "citizen");
        } catch {
          setRole("citizen");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f172a", color: "#60a5fa", fontSize: "1.5rem" }}>
      Loading CivicLens...
    </div>
  );

  return (
    <BrowserRouter>
      <Navbar user={user} role={role} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/report" element={user ? <Report user={user} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard user={user} role={role} />} />
        <Route path="/issue/:id" element={<IssueDetail user={user} />} />
      </Routes>
    </BrowserRouter>
  );
}