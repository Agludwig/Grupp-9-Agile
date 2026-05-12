import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat/dist/leaflet-heat.js";
import "leaflet/dist/leaflet.css";

// Setup marker icons
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

const openDirections = (lat, lon) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  window.open(url, "_blank");
};

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

    return () => map.removeLayer(heat);
  }, [reports, map]);

  return null;
}

function ReportMap({ reports, onSelectReport }) {
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [timeFilter, setTimeFilter] = useState(90);

  const filteredReports = reports.filter((r) => {
    if (!r.created_at) return true;
    const diffDays =
      (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= timeFilter;
  });

  return (
    <div className="map-section" style={{ marginBottom: "2rem" }}>
      <div
        className="filter-controls"
        style={{
          background: "#f8f9fa",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "10px",
        }}
      >
        <label style={{ marginRight: "20px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={heatmapOn}
            onChange={() => setHeatmapOn(!heatmapOn)}
          />{" "}
          Activate Heatmap
        </label>
        <label style={{ display: "block", marginTop: "10px" }}>
          Show reports from the last <strong>{timeFilter}</strong> days
        </label>
        <input
          type="range"
          min="1"
          max="90"
          value={timeFilter}
          onChange={(e) => setTimeFilter(Number(e.target.value))}
          style={{ width: "100%", cursor: "pointer" }}
        />
      </div>

      <MapContainer
        center={[57.7089, 11.9746]}
        zoom={12}
        style={{
          height: "400px",
          borderRadius: "12px",
          border: "1px solid #ccc",
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {!heatmapOn &&
          filteredReports.map((r) => (
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
          ))}

        {heatmapOn && <HeatmapLayer reports={filteredReports} />}
      </MapContainer>
    </div>
  );
}

export default ReportMap;
