import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function ListItem({ report, onSelect, onDirections }) {
  const navigate = useNavigate();
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  const creatorId = report?.created_by ?? report?.created_by_id;

  useEffect(() => {
    let ignore = false;

    async function loadProfilePicture() {
      if (!creatorId) {
        setProfilePictureUrl(null);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/${creatorId}/profile`);

        if (!response.ok) {
          throw new Error("Could not load profile");
        }

        const data = await response.json();

        if (!ignore) {
          setProfilePictureUrl(data.profile_picture_url || null);
        }
      } catch (error) {
        if (!ignore) {
          setProfilePictureUrl(null);
        }
      }
    }

    loadProfilePicture();

    return () => {
      ignore = true;
    };
  }, [creatorId]);

  if (!report) return null;

  const truncateStyle = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  function openUserProfile(e) {
    e.stopPropagation();

    if (creatorId) {
      navigate(`/users/${creatorId}`);
    }
  }

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
            width: "150px",
            fontSize: "0.85rem",
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          {report.created_by_username && creatorId ? (
            <button
              className="btn btn-link btn-sm p-0"
              onClick={openUserProfile}
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "inherit",
              }}
            >
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={`${report.created_by_username}'s profile`}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #ccc",
                  }}
                />
              ) : (
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#eee",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #ccc",
                    fontSize: "0.9rem",
                  }}
                >
                  👤
                </span>
              )}

              <span>{report.created_by_username}</span>
            </button>
          ) : (
            "Unknown user"
          )}
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
