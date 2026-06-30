import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const MAPS_KEY = "AIzaSyDSiiTqjJziXAgP9bjQkydk1I6lMbEvZXU";

const SEVERITY_COLOR = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };

const LOCATION_COORDS = {
  "dwarka": { lat: 28.5921, lng: 77.0460 },
  "connaught": { lat: 28.6315, lng: 77.2167 },
  "saket": { lat: 28.5245, lng: 77.2066 },
  "rohini": { lat: 28.7041, lng: 77.1025 },
  "janakpuri": { lat: 28.6219, lng: 77.0878 },
  "lajpat": { lat: 28.5677, lng: 77.2433 },
  "karol bagh": { lat: 28.6514, lng: 77.1907 },
  "vasant kunj": { lat: 28.5244, lng: 77.1588 },
  "nehru place": { lat: 28.5486, lng: 77.2522 },
  "palam": { lat: 28.5921, lng: 77.0873 },
  "vikaspuri": { lat: 28.6398, lng: 77.0744 },
  "akbar road": { lat: 28.6139, lng: 77.2090 },
  "noida": { lat: 28.5355, lng: 77.3910 },
  "gurgaon": { lat: 28.4595, lng: 77.0266 },
  "delhi": { lat: 28.6139, lng: 77.2090 },
};

function guessCoords(location) {
  if (!location) return { lat: 28.6139 + (Math.random()-0.5)*0.05, lng: 77.2090 + (Math.random()-0.5)*0.05 };
  const lower = location.toLowerCase();
  for (const [key, coords] of Object.entries(LOCATION_COORDS)) {
    if (lower.includes(key)) {
      return { lat: coords.lat + (Math.random() - 0.5) * 0.015, lng: coords.lng + (Math.random() - 0.5) * 0.015 };
    }
  }
  return { lat: 28.6139 + (Math.random()-0.5)*0.05, lng: 77.2090 + (Math.random()-0.5)*0.05 };
}

export default function MapPage() {
  const [issues, setIssues] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState({});

  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setIssues(snap.docs.map(d => {
        const data = d.data();
        const coords = (data.lat && data.lng) ? { lat: data.lat, lng: data.lng } : guessCoords(data.location);
        return { id: d.id, ...data, _coords: coords };
      }));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (window.google) { setMapLoaded(true); return; }
    const existing = document.querySelector('script[data-gmaps]');
    if (existing) { existing.onload = () => setMapLoaded(true); return; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`;
    script.async = true;
    script.dataset.gmaps = "true";
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapLoaded) return;
    const m = new window.google.maps.Map(document.getElementById("gmap"), {
      center: { lat: 28.6139, lng: 77.2090 },
      zoom: 11,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
      ]
    });
    setMap(m);
  }, [mapLoaded]);

  useEffect(() => {
    if (!map || !issues.length) return;
    const newMarkers = {};
    issues.forEach(issue => {
      const marker = new window.google.maps.Marker({
        position: issue._coords,
        map,
        title: issue.summary,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: SEVERITY_COLOR[issue.severity] || "#3b82f6",
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }
      });
      newMarkers[issue.id] = marker;
    });
    setMarkers(newMarkers);
  }, [map, issues]);

  function focusIssue(issue) {
    if (!map) return;
    map.panTo(issue._coords);
    map.setZoom(15);
    const marker = markers[issue.id];
    if (marker) {
      new window.google.maps.InfoWindow({
        content: `<div style="color:#000;font-weight:600;max-width:200px">${issue.summary}<br/><span style="font-size:12px;color:#555">${issue.location}</span></div>`
      }).open(map, marker);
    }
  }

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 style={{ color: "#60a5fa", margin: 0 }}>🗺️ Live Issue Map</h2>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>{issues.length} issues tracked in real time</p>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {Object.entries(SEVERITY_COLOR).map(([sev, color]) => (
            <span key={sev} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "#94a3b8" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
              {sev}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div id="gmap" style={{ flex: 1, height: "100%" }} />

        <div style={{ width: "340px", background: "#1e293b", borderLeft: "1px solid #334155", padding: "1rem", overflowY: "auto" }}>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "1rem", fontWeight: 600 }}>REPORTED ISSUES</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {issues.map(issue => (
              <div key={issue.id} className="card" style={{ padding: "0.85rem" }}>
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ background: (SEVERITY_COLOR[issue.severity] || "#3b82f6") + "33", color: SEVERITY_COLOR[issue.severity] || "#3b82f6", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600 }}>{issue.severity}</span>
                  <span style={{ background: "#14532d", color: "#86efac", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem" }}>{issue.status}</span>
                </div>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "0.3rem" }}>{issue.summary?.slice(0, 60)}</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: "0.6rem" }}>📍 {issue.location}</p>
                <button
                  onClick={() => focusIssue(issue)}
                  style={{ width: "100%", background: "#334155", color: "#e2e8f0", border: "none", borderRadius: "6px", padding: "0.4rem", fontSize: "0.78rem", cursor: "pointer" }}
                >
                  📍 Show on Map
                </button>
              </div>
            ))}
            {issues.length === 0 && (
              <p style={{ color: "#64748b", fontSize: "0.85rem", textAlign: "center", padding: "2rem 0" }}>No issues reported yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}