import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

function ReportDetailView({
  report,
  currentUser,
  onClose,
  onSignup,
  onUnassign,
  onRefresh,
}) {

  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  if (!report) return null;

  const isSignedUp = report.signed_up_by !== null && report.signed_up_by !== undefined;
  const signedUpByCurrentUser = currentUser?.id === report.signed_up_by;

  const handleMarkAsHandled = async () => {
    const formData = new FormData();

    formData.append(
      "handled_by",
      currentUser.id
    );

    const response = await fetch(
      `http://127.0.0.1:8000/reports/${report.id}/handle`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (response.ok) {
      onRefresh();
      onClose();
    } else {
      alert("Failed to mark report as handled");
    }
  };

  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const imagePath = report.unhandled_image_path
    ? `${baseUrl}/storage/v1/object/public/LitterFreeCitiesImages/${report.unhandled_image_path}`
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>

        <h2>{report.title}</h2>

        {imagePath && (
          <img src={imagePath} alt="Area to clean" className="detail-image" />
        )}

        <div className="detail-info">
          <p>
            <strong>Description:</strong> {report.message}
          </p>

          <p>
            <strong>Created by:</strong>{" "}
            {report.created_by_username || "Unknown"}
          </p>

          {report.handled && (
            <p>
              <strong>Handled by:</strong>{" "}
              {report.handled_by_username || "Unknown"}
            </p>
          )}

          <p className="meta">
            Reported: {new Date(report.created_at).toLocaleString()}
          </p>
          {report.signed_up_by_username && (
            <>
              <p>
                <strong> Signed up by:</strong>{" "}
                {report.signed_up_by_username}
              </p>

              <p>
                <strong>Points:</strong>{" "}
                {report.signed_up_by_points ?? 0}
              </p>

              <p>
                <strong>Signed up at:</strong>{" "}
                {new Date(report.signed_up_at).toLocaleString()}
              </p>
            </>
          )}
        </div>

        {/* Small map inside the view */}
        <div className="mini-map-container">
          <MapContainer
            center={[report.lat, report.lon]}
            zoom={15}
            style={{ height: "200px", width: "100%", borderRadius: "8px" }}
            scrollWheelZoom={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[report.lat, report.lon]} />
          </MapContainer>
        </div>

        <div className="actions" style={{ marginTop: "1rem" }}>
          {!isSignedUp && !report.handled && (
            <>
              <button
                className="btn btn-primary w-100"
                onClick={() => onSignup(report.id)}
              >
                Sign up to cleaning
              </button>

              <button
                className="btn btn-success w-100 mt-2"
                onClick={handleMarkAsHandled}
              >
                Mark as Cleaned
              </button>
            </>
          )}

          {signedUpByCurrentUser && !report.handled && (
            <>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => onUnassign(report.id)}
              >
                Unassign
              </button>

              <button
                className="btn btn-success w-100 mt-2"
                onClick={handleMarkAsHandled}
              >
                Mark as Cleaned
              </button>
            </>
          )}

          {isSignedUp && !signedUpByCurrentUser && !report.handled && (
            <div className="alert alert-info">
              This report is currently assigned to {report.signed_up_by_username}.
            </div>
          )}

          {report.handled && (
            <div className="alert alert-success">
              ✅ This location has been cleaned!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportDetailView;
