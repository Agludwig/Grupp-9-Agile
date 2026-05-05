import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat/dist/leaflet-heat.js";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
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
      .filter(r => r.lat && r.lon)
      .map(r => [r.lat, r.lon, 1]);

    const heat = L.heatLayer(heatData, {
      radius: 20,
      blur: 40,
      maxZoom: 8,
      max: 0.2
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [reports, map]);

  return null;
}


function List() {
  const [reports, setReports] = useState([]);

  const [heatmapOn, setHeatmapOn] = useState(false);
  const [timeFilter, setTimeFilter] = useState(24); // hours

  const filteredReports = reports.filter(r => {
    if (!r.created_at) return false;

  const createdTime = new Date(r.created_at).getTime();
  const now = Date.now();
  const diffDays = (now - createdTime) / (1000 * 60 * 60 * 24);

  return diffDays <= timeFilter;
});

  const fetchReports = () => {
    fetch("http://127.0.0.1:8000/reports")
      .then((res) => res.json())
      .then((data) => setReports(data));
  };

  useEffect(() => { fetchReports(); }, []);

  const markAsHandled = async (reportId) => {
    await fetch(`http://127.0.0.1:8000/reports/${reportId}/handle`, { method: "POST", body: new FormData() });
    fetchReports();
  };

  return (
    <div>
      <button onClick={() => setHeatmapOn(!heatmapOn)}>
        Toggle Heatmap
      </button>
      <div style={{ marginBottom: "1rem" }}>

  <div>
    <label>
      Show reports from last {timeFilter} days
    </label>
  </div>

  <input
    type="range"
    min="1"
    max="90"   // 90 days
    value={timeFilter}
    onChange={(e) => setTimeFilter(Number(e.target.value))}
    style={{ width: "50%" }}
    />
  </div>

      <MapContainer center={[57.7089, 11.9746]} zoom={12} style={{ height: "400px", width: "100%", marginBottom: "2rem" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        {!heatmapOn &&
          filteredReports.map((r) => (
            r.lat && r.lon && (
              <Marker key={r.id} position={[r.lat, r.lon]} icon={r.handled ? greenIcon : blueIcon}>
                <Popup>
                  <strong>{r.title}</strong><br />
                  {r.message}<br />
                  {r.handled ? "✅ Handled" : "⏳ Pending"}
                </Popup>
              </Marker>
            )
          ))}
        {heatmapOn && <HeatmapLayer reports={filteredReports} />}
      </MapContainer>

      {reports.length === 0 ? (
        <p>No reports available</p>
      ) : (
        reports.map((r) => (
          <div key={r.id} className="report">
            {r.unhandled_image_path && (
              <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/LitterFreeCitiesImages/${r.unhandled_image_path}`} alt="Report" />
            )}
            <p><strong>{r.title}</strong></p>
            <p>{r.message}</p>
            <p className="meta">📍 {r.lat?.toFixed(4)}, {r.lon?.toFixed(4)}</p>
            <p className="meta">🕒 {new Date(r.created_at).toLocaleString()}</p>
            <p className="meta">{r.handled ? "✅ Handled" : "⏳ Pending"}</p>
            {!r.handled && (
              <button className="btn btn-success btn-sm" style={{ marginTop: "0.5rem" }} onClick={() => markAsHandled(r.id)}>
                Mark as Handled
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default List;
