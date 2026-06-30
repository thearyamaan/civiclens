import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Leaderboard() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "issues"), (snap) => {
      setIssues(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const leaders = useMemo(() => {
    const map = {};

    issues.forEach((issue) => {
      if (!issue.reportedBy) return;

      if (!map[issue.reportedBy]) {
        map[issue.reportedBy] = {
          name: issue.reportedByName || "Citizen",
          reports: 0,
          votesReceived: 0,
          resolved: 0,
        };
      }

      map[issue.reportedBy].reports += 1;
      map[issue.reportedBy].votesReceived += issue.votes || 0;
      if (issue.status === "Resolved") map[issue.reportedBy].resolved += 1;
    });

    return Object.values(map)
      .map((u) => ({
        ...u,
        points: u.reports * 10 + u.votesReceived * 5 + u.resolved * 20,
      }))
      .sort((a, b) => b.points - a.points);
  }, [issues]);

  return (
    <div className="page-shell narrow">
      <div className="card">
        <h2 className="page-title">Civic Champions</h2>
        <p className="muted-text">
          Citizens earn points for reporting, getting votes, and resolved issues.
        </p>

        <div className="leader-list">
          {leaders.length === 0 ? (
            <div className="empty-state">No leaderboard data yet.</div>
          ) : (
            leaders.map((leader, index) => (
              <div key={`${leader.name}-${index}`} className="leader-item">
                <div className="leader-rank">#{index + 1}</div>
                <div className="leader-name">{leader.name}</div>
                <div className="leader-meta">
                  {leader.reports} reports • {leader.votesReceived} votes • {leader.resolved} resolved
                </div>
                <div className="leader-points">{leader.points} pts</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}