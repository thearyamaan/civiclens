import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, increment } from "firebase/firestore";

export default function IssueDetail({ user, profile }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [voting, setVoting] = useState(false);

  const isAuthority = profile?.role === "authority";

  useEffect(() => {
    return onSnapshot(doc(db, "issues", id), (snap) => {
      if (snap.exists()) setIssue({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  async function handleVote() {
    if (!user) {
      navigate("/login");
      return;
    }

    if (issue?.voters?.includes(user.uid)) return;

    setVoting(true);
    await updateDoc(doc(db, "issues", id), {
      votes: increment(1),
      voters: arrayUnion(user.uid),
    });
    setVoting(false);
  }

  async function handleStatusChange(status) {
    if (!isAuthority) return;
    await updateDoc(doc(db, "issues", id), {
      status,
      updatedAt: new Date(),
    });
  }

  if (!issue) {
    return (
      <div className="page-shell narrow">
        <div className="card">Loading issue...</div>
      </div>
    );
  }

  const hasVoted = issue.voters?.includes(user?.uid);

  return (
    <div className="page-shell narrow">
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>

      <div className="card issue-detail-card">
        {issue.imageBase64 && (
          <img src={issue.imageBase64} alt={issue.summary} className="issue-detail-image" />
        )}

        <h2 className="page-title">{issue.summary}</h2>

        <div className="detail-grid">
          <div><strong>Location:</strong> {issue.location}</div>
          <div><strong>Category:</strong> {issue.category}</div>
          <div><strong>Severity:</strong> {issue.severity}</div>
          <div><strong>Department:</strong> {issue.department}</div>
          <div><strong>Status:</strong> {issue.status}</div>
          <div><strong>Reported By:</strong> {issue.reportedByName}</div>
        </div>

        {issue.description && <p className="detail-description">{issue.description}</p>}
        {issue.recommendedAction && <p className="recommendation">{issue.recommendedAction}</p>}

        <div className="detail-actions">
          <button
            className="btn btn-primary"
            onClick={handleVote}
            disabled={voting || hasVoted}
          >
            {hasVoted ? "Already Voted" : voting ? "Voting..." : `Upvote (${issue.votes || 0})`}
          </button>

          {issue.latitude && issue.longitude && (
            <a
              href={`https://www.google.com/maps?q=${issue.latitude},${issue.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="btn btn-secondary">Open Exact Location</button>
            </a>
          )}
        </div>

        <div className="authority-box">
          <h3>Authority Status Control</h3>
          {isAuthority ? (
            <div className="status-buttons">
              <button className="btn btn-secondary" onClick={() => handleStatusChange("Open")}>Open</button>
              <button className="btn btn-secondary" onClick={() => handleStatusChange("In Progress")}>In Progress</button>
              <button className="btn btn-primary" onClick={() => handleStatusChange("Resolved")}>Resolved</button>
            </div>
          ) : (
            <p className="muted-text">Only authority accounts can change status.</p>
          )}
        </div>
      </div>
    </div>
  );
}