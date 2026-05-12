function ListItem({ report, onSelect, onDirections }) {
  if (!report) return null;

  const truncateStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <div
      className="report-item"
      onClick={() => onSelect(report)}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "10px 15px",
        borderBottom: "1px solid #ddd",
        cursor: "pointer",
        background: "#fff",
        minHeight: "60px",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          gap: "10px",
          width: "0",
        }}
      >
        <span
          style={{
            fontWeight: "bold",
            width: "150px",
            flexShrink: 0,
            ...truncateStyle,
          }}
        >
          {report.title}
        </span>

        <span
          style={{
            flex: 1,
            color: "#555",
            paddingRight: "10px",
            ...truncateStyle,
          }}
        >
          {report.message}
        </span>

        <span
          style={{
            fontSize: "0.85rem",
            color: "#888",
            width: "100px",
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          🕒{" "}
          {report.created_at
            ? new Date(report.created_at).toLocaleDateString()
            : "No date"}
        </span>

        <span
          style={{
            width: "100px",
            fontSize: "0.9rem",
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          {report.handled ? "✅ Done" : "⏳ Pending"}
        </span>
      </div>

      <div style={{ marginLeft: "15px", flexShrink: 0 }}>
        <button
          className="btn btn-outline-primary btn-sm"
          style={{ width: "90px" }}
          onClick={(e) => {
            e.stopPropagation();
            onDirections(report.lat, report.lon);
          }}
        >
          Directions
        </button>
      </div>
    </div>
  );
}

export default ListItem;
