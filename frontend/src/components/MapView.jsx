import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import {useEffect, useState} from "react";
import L from "leaflet";
import "node_modules/leaflet.heat/dist/leaflet-heat.js";

function HeatmapLayer({ reports }) {
  const map = useMap();

  useEffect(() => {
    if (!reports.length) return;

    const heatData = reports.map(r => [r.lat, r.lon, 0.5]);

    const heat = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [reports, map]);

  return null;
}

export default function MapView({ reports }) {
  const [heatmapOn, setHeatmapOn] = useState(false);

  return (
    <>
      <button onClick={() => setHeatmapOn(!heatmapOn)}>
        Toggle Heatmap
      </button>

      <MapContainer center={[57.70, 12]} zoom={13} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {!heatmapOn &&
          reports.map(report => (
            <Marker key={report.id} position={[report.lat, report.lon]}>
              <Popup>{report.message}</Popup>
            </Marker>
          ))}

        {heatmapOn && <HeatmapLayer reports={reports} />}
      </MapContainer>
    </>
  );
}