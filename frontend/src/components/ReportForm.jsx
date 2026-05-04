import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

function ReportForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select a valid image file"); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) { setError("Title and description are required."); return; }
    if (!selectedLocation) { setError("Please select a location on the map."); return; }
    setError("");

    const res = await fetch("http://127.0.0.1:8000/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, lat: selectedLocation.lat, lon: selectedLocation.lon }),
    });

    if (!res.ok) { const d = await res.json(); setError(d.detail || "Something went wrong."); return; }

    const data = await res.json();

    if (image && data.id) {
      const formData = new FormData();
      formData.append("file", image);
      await fetch(`http://127.0.0.1:8000/reports/${data.id}/image`, { method: "POST", body: formData });
    }

    setSuccess("Report submitted successfully!");
    setTitle(""); setDescription(""); setSelectedLocation(null); setImage(null); setPreview(null);
    setTimeout(() => setSuccess(""), 2000);
    if (onSubmit) onSubmit();
  };

  return (
    <div className="card p-4">
      <h2>Create Report</h2>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <p>Click on the map to select a location.</p>
      <MapContainer center={[57.7089, 11.9746]} zoom={13} style={{ height: "400px", width: "100%", marginBottom: "1rem" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <LocationPicker onLocationSelect={setSelectedLocation} />
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
            <Popup>Selected location</Popup>
          </Marker>
        )}
      </MapContainer>
      {selectedLocation && <p className="text-muted">📍 {selectedLocation.lat.toFixed(5)}, {selectedLocation.lon.toFixed(5)}</p>}
      <small className="text-muted">Required</small>
      <input className="form-control mb-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <small className="text-muted">Required</small>
      <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <small className="text-muted">Optional – attach an image</small>
      <input type="file" accept="image/*" className="form-control mb-2" onChange={handleImageChange} />
      {preview && <img src={preview} alt="preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "4px", marginBottom: "0.5rem" }} />}
      <button className="btn btn-primary" onClick={handleSubmit} disabled={!title || !description || !selectedLocation}>
        Submit Report
      </button>
    </div>
  );
}

export default ReportForm;
