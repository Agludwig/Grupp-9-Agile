import { useState } from "react";
import ListItem from "./ListItem";

function List({ reports, onSelectReport }) {
  const [timeFilter, setTimeFilter] = useState(90);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const openDirections = (lat, lon) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, "_blank");
  };

  const filteredReports = reports.filter((r) => {
    const diffDays =
      (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
    const matchesTime = diffDays <= timeFilter;

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "done"
          ? r.handled === true
          : r.handled === false;

    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTime && matchesStatus && matchesSearch;
  });

  return (
    <div className="report-list-container">
      {/* --- Filter Controls --- */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #eee",
        }}
      >
        <div className="row">
          <div className="col-md-4">
            <label className="form-label">
              Show last <strong>{timeFilter}</strong> days
            </label>
            <input
              type="range"
              className="form-range"
              min="1"
              max="90"
              value={timeFilter}
              onChange={(e) => setTimeFilter(Number(e.target.value))}
            />
          </div>

          {/* Status-filter */}
          <div className="col-md-4">
            <label className="form-label">Status</label>
            <div className="btn-group w-100" role="group">
              <button
                className={`btn btn-sm ${statusFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setStatusFilter("all")}
              >
                All
              </button>
              <button
                className={`btn btn-sm ${statusFilter === "pending" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </button>
              <button
                className={`btn btn-sm ${statusFilter === "done" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setStatusFilter("done")}
              >
                Done
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search title or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- List Display --- */}
      {filteredReports.length === 0 ? (
        <div className="alert alert-info">No reports matches your filters.</div>
      ) : (
        <div
          className="list-group"
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          {filteredReports.map((r) => (
            <ListItem
              key={r.id}
              report={r}
              onSelect={onSelectReport}
              onDirections={openDirections}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .report-list-container {
          margin-bottom: 3rem;
        }
        .form-label {
          font-size: 0.85rem;
          font-weight: bold;
          margin-bottom: 8px;
          display: block;
        }
      `}</style>
    </div>
  );
}

export default List;
