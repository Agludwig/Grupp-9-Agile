import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function List({ reports, onSelectReport }) {
  const markAsHandled = async (reportId) => {
    await fetch(`http://127.0.0.1:8000/reports/${reportId}/handle`, {
      method: "POST",
      body: new FormData(),
    });
    fetchReports();
  };

  return (
    <div>
      <MapContainer
        center={[57.7089, 11.9746]}
        zoom={12}
        style={{ height: "400px", width: "100%", marginBottom: "2rem" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {reports.map(
          (r) =>
            r.lat &&
            r.lon && (
              <Marker
                key={r.id}
                position={[r.lat, r.lon]}
                icon={r.handled ? greenIcon : blueIcon}
              >
                <Popup>
                  <strong>{r.title}</strong>
                  <br />
                  {r.message}
                  <br />
                  {/* Knapp för att öppna detaljvyn från kartan */}
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() => onSelectReport(r)}
                  >
                    View Details
                  </button>
                </Popup>
              </Marker>
            ),
        )}
      </MapContainer>

      {reports.length === 0 ? (
        <p>No reports available</p>
      ) : (
        reports.map((r) => (
          // Vi gör hela div:en klickbar för att öppna detaljvyn
          <div
            key={r.id}
            className="report"
            onClick={() => onSelectReport(r)}
            style={{ cursor: "pointer" }}
          >
            {r.unhandled_image_path && (
              <img
                src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/LitterFreeCitiesImages/${r.unhandled_image_path}`}
                alt="Report"
              />
            )}
            <p>
              <strong>{r.title}</strong>
            </p>
            <p>{r.message}</p>
            <p className="meta">
              📍 {r.lat?.toFixed(4)}, {r.lon?.toFixed(4)}
            </p>
            <p className="meta">🕒 {new Date(r.created_at).toLocaleString()}</p>
            <p className="meta">{r.handled ? "✅ Handled" : "⏳ Pending"}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default List;
