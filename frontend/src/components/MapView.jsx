import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";

function HeatmapLayer({ reports }) {
  const map = useMap();

  useEffect(() => {
    if (!reports.length) return;

    const heatData = reports.map((r) => [r.lat, r.lon, 0.5]);

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
  const navigate = useNavigate();

  function openUserProfile(userId) {
    if (userId) {
      navigate(`/users/${userId}`);
    }
  }

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
          reports.map((report) => {
            const creatorId = report.created_by ?? report.created_by_id;

            return (
              <Marker key={report.id} position={[report.lat, report.lon]}>
                <Popup>
                  <div>
                    <strong>{report.title}</strong>
                    <p>{report.message}</p>

                    {report.created_by_username && creatorId && (
                      <button
                        className="btn btn-link btn-sm p-0"
                        onClick={() => openUserProfile(creatorId)}
                      >
                        View {report.created_by_username}'s profile
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {heatmapOn && <HeatmapLayer reports={reports} />}
      </MapContainer>
    </>
  );
}
