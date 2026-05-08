import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [35, 57], iconAnchor: [17, 57], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FlyToLocation({ selectedReport }) {
  const map = useMap();
  useEffect(() => {
<<<<<<< Updated upstream
    if (selectedReport) {
      map.flyTo([selectedReport.lat, selectedReport.lon], 16, { duration: 1 });
    }
  }, [selectedReport, map]);
=======
    if (!reports.length || !L.heatLayer) return;

    const heatData = reports
      .filter(r => r.lat && r.lon)
      .map(r => [r.lat, r.lon, 1]);

    const heat = L.heatLayer(heatData, {
      radius: 25,
      blur: 45,
      maxZoom: 8,
      max: 0.5
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [reports, map]);

>>>>>>> Stashed changes
  return null;
}

function List() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const markerRefs = useRef({});

  const fetchReports = () => {
    fetch("http://127.0.0.1:8000/reports")
      .then((res) => res.json())
      .then((data) => setReports(data));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleSelectReport = (r) => {
    setSelectedReport(r);
    const marker = markerRefs.current[r.id];
    if (marker) marker.openPopup();
  };

  const markAsHandled = async (reportId) => {
    await fetch(`http://127.0.0.1:8000/reports/${reportId}/handle`, { method: "POST", body: new FormData() });
    fetchReports();
  };

  const openDirections = (lat, lon) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, "_blank");
  };

  return (
    <div>
<<<<<<< Updated upstream
=======
      <label>
        Heatmap &nbsp;
  <input
    type="checkbox"
    checked={heatmapOn}
    onChange={() => setHeatmapOn(!heatmapOn)}
  />
</label>
<div style={{ marginBottom: "1rem" }} >

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

>>>>>>> Stashed changes
      <MapContainer center={[57.7089, 11.9746]} zoom={12} style={{ height: "400px", width: "100%", marginBottom: "2rem" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <FlyToLocation selectedReport={selectedReport} />
        {reports.map((r) => (
          r.lat && r.lon && (
            <Marker
              key={r.id}
              position={[r.lat, r.lon]}
              icon={selectedReport?.id === r.id ? selectedIcon : r.handled ? greenIcon : blueIcon}
              ref={(ref) => { if (ref) markerRefs.current[r.id] = ref; }}
            >
              <Popup>
                <strong>{r.title}</strong><br />
                {r.message}<br />
                {r.handled ? "✅ Handled" : "⏳ Pending"}<br />
                <button
                  onClick={() => openDirections(r.lat, r.lon)}
                  style={{ marginTop: "0.5rem", padding: "4px 8px", cursor: "pointer" }}
                >
                  Get Directions
                </button>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {reports.length === 0 ? (
        <p>No reports available</p>
      ) : (
        reports.map((r) => (
          <div
            key={r.id}
            className="report"
            style={{ cursor: "pointer", border: selectedReport?.id === r.id ? "2px solid #0d6efd" : "1px solid #ddd" }}
            onClick={() => handleSelectReport(r)}
          >
            {r.unhandled_image_path && (
              <img src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/LitterFreeCitiesImages/${r.unhandled_image_path}`} alt="Report" />
            )}
            <p><strong>{r.title}</strong></p>
            <p>{r.message}</p>
            <p className="meta">📍 {r.lat?.toFixed(4)}, {r.lon?.toFixed(4)}</p>
            <p className="meta">🕒 {new Date(r.created_at).toLocaleString()}</p>
            <p className="meta">{r.handled ? "✅ Handled" : "⏳ Pending"}</p>
            {!r.handled && (
              <button
                className="btn btn-success btn-sm"
                style={{ marginTop: "0.5rem" }}
                onClick={(e) => { e.stopPropagation(); markAsHandled(r.id); }}
              >
                Mark as Handled
              </button>
            )}
            <button
              className="btn btn-outline-primary btn-sm"
              style={{ marginTop: "0.5rem", marginLeft: "0.5rem" }}
              onClick={(e) => { e.stopPropagation(); openDirections(r.lat, r.lon); }}
            >
              Get Directions
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default List;
