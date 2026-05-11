import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat/dist/leaflet-heat.js";

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

function HeatmapLayer({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (!reports.length || !L.heatLayer) return;
    const heatData = reports
      .filter((r) => r.lat && r.lon)
      .map((r) => [r.lat, r.lon, 1]);
    const heat = L.heatLayer(heatData, {
      radius: 25,
      blur: 45,
      maxZoom: 8,
      max: 0.2,
    }).addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [reports, map]);
  return null;
}

function List({ reports, onSelectReport }) {
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [timeFilter, setTimeFilter] = useState(24);

  const filteredReports = reports.filter((r) => {
    if (!r.created_at) return false;

    const createdTime = new Date(r.created_at).getTime();
    const now = Date.now();

    const diffDays = (now - createdTime) / (1000 * 60 * 60 * 24);

    return diffDays <= timeFilter;
  });

  const openDirections = (lat, lon) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
      "_blank",
    );
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "1rem",
          background: "#fff",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      >
        <label
          style={{
            fontWeight: "bold",
            display: "block",
            marginBottom: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            checked={heatmapOn}
            onChange={() => setHeatmapOn(!heatmapOn)}
          />{" "}
          Activate Heatmap
        </label>

        <label style={{ display: "block" }}>
          Show reports from the last <strong>{timeFilter}</strong> days
        </label>
        <input
          type="range"
          min="1"
          max="90" // 90 dagar
          value={timeFilter}
          onChange={(e) => setTimeFilter(Number(e.target.value))}
          style={{ width: "50%", cursor: "pointer" }}
        />
      </div>

      <MapContainer
        center={[57.7089, 11.9746]}
        zoom={12}
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "12px",
          marginBottom: "2rem",
          border: "1px solid #ccc",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {!heatmapOn &&
          filteredReports.map(
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
                    <p style={{ margin: "5px 0" }}>{r.message}</p>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onSelectReport(r)}
                      style={{ width: "100%", marginBottom: "5px" }}
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openDirections(r.lat, r.lon)}
                      style={{ width: "100%" }}
                    >
                      Get Directions
                    </button>
                  </Popup>
                </Marker>
              ),
          )}
        {heatmapOn && <HeatmapLayer reports={filteredReports} />}
      </MapContainer>

      {filteredReports.length === 0 ? (
        <p>Inga rapporter tillgängliga för valda filter.</p>
      ) : (
        filteredReports.map((r) => (
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

            <div style={{ marginTop: "1rem" }}>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openDirections(r.lat, r.lon);
                }}
              >
                Get Directions
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default List;
