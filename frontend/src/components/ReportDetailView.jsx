import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

function ReportDetailView({
  report,
  onClose,
  onSignup,
  onMarkAsHandled,
  onRefresh,
}) {
  useEffect(() => {
    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);
  if (!report) return null;

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
          <p className="meta">
            Reported: {new Date(report.created_at).toLocaleString()}
          </p>

          {report.assigned_to && (
            <>
              <p>
                <strong>Assigned to:</strong> {report.assigned_to}
              </p>

              <p>
                <strong>Assigned at:</strong>{" "}
                {new Date(report.assigned_at).toLocaleString()}
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
          {!report.assigned_to && !report.handled && (
            <button
              className="btn btn-primary w-100"
              onClick={() => onSignup(report.id)}
            >
              Sign up to cleaning
            </button>
          )}

          {report.assigned_to && !report.handled && (
            <button
              className="btn btn-success w-100"
              onClick={() => onMarkAsHandled(report.id)}
            >
              Mark as Cleaned
            </button>
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
