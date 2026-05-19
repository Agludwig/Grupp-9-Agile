import { useState, useEffect } from "react";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/leaderboard")
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Leaderboard data:", data);
        setLeaderboard(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching leaderboard:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = leaderboard.filter((entry) => {
    const name = entry["user_name"] ?? "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const medal = (i) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `#${i + 1}`;
  };

  const rowClass = (i) => {
  if (i === 0) return "leaderboard-row gold";
  if (i === 1) return "leaderboard-row silver";
  if (i === 2) return "leaderboard-row bronze";
  return "leaderboard-row";
};

  if (loading) return <div className="alert alert-info mt-3">Loading leaderboard...</div>;
  if (error)   return <div className="alert alert-danger mt-3">Failed to load: {error}</div>;

  console.log("leaderboard state:", leaderboard);
  console.log("filtered:", filtered);

  return (
    <div className="leaderboard-container">

      {filtered.length === 0 ? (
        <div className="alert alert-info">No users found.</div>
      ) : (
        <div className="leaderboard-list">
          {filtered.map((entry, i) => (
            <div key={entry["user_name"]} className={rowClass(i)}>
              <span className="leaderboard-rank">{medal(i)}</span>
              <span className="leaderboard-username">{entry["user_name"]}</span>
              <span className="leaderboard-count">
                {entry["points"]} point{entry["points"] !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}