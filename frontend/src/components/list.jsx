import { useEffect, useState } from "react";
import "./style.css";

function List() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/reports")
      .then((res) => res.json())
      .then((data) => setReports(data));
  }, []);

  return (
    <div>
      {reports.length === 0 ? (
        <p>No reports available</p>
      ) : (
        reports.map((r, i) => (
          <div key={i} className="report">
            {r.image_url && <img src={r.image_url} alt="Report image" />}
            <p>{r.message}</p>
            <p className="meta">📍 {r.address || `${r.lat}, ${r.lon}`}</p>
            <p className="meta">🕒 {new Date(r.created_at).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default List;