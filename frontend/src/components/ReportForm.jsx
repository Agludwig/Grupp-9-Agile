import { useState } from "react";

function ReportForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = () => {

    if (!title.trim() || !description.trim() || !lat.trim() || !lon.trim()) {
      setError("All fields (Title, Description, Lat, Lon) are required.");
      return;
    }

    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      setError("Latitude and longitude must be valid numbers.");
      return;
    }

    setError("");
    onSubmit({
      title,
      description,
      lat: parsedLat,
      lon: parsedLon,
    });

    setSuccess("Report submitted successfully!");
    setTitle("");
    setDescription("");
    setLat("");
    setLon("");

    setTimeout(() => setSuccess(""), 2000);
  };
  return (
    <div className="card p-4">
      <h2>Create Report</h2>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <small className="text-muted">Required</small>
      <input
        className="form-control mb-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <small className="text-muted">Required</small>

      <textarea
        className="form-control mb-2"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <small className="text-muted">Required</small>

      <input
        className="form-control mb-2"
        placeholder="Latitude"
        value={lat}
        onChange={(e) => setLat(e.target.value)}
      />

      <small className="text-muted">Required</small>

      <input
        className="form-control mb-2"
        placeholder="Longitude"
        value={lon}
        onChange={(e) => setLon(e.target.value)}
      />

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={!title || !description || !lat || !lon}
      >
        Submit Report
      </button>
    </div>
  );
}

export default ReportForm;
