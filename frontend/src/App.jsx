import { useEffect, useState } from "react";
import ReportForm from "./components/ReportForm";
import List from "./components/List";
import ReportDetailView from "./components/ReportDetailView";
import "./style.css";

function App() {
  const [reports, setReports] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleSubmit = async (report) => {
    await fetch("http://127.0.0.1:8000/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });
    setRefresh((r) => r + 1);
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/reports")
      .then((res) => res.json())
      .then((data) => setReports(data));
  }, [refresh]);

  const handleSignup = async (id) => {
    console.log("Signing up for", id);
  };

  return (
    <div>
      <h1>LitterFree Cities</h1>
      <ReportForm onSubmit={() => setRefresh((prev) => prev + 1)} />

      <h2 style={{ marginTop: "2rem" }}>All Reports</h2>
      <List reports={reports} onSelectReport={setSelectedReport} />

      {/* Vår nya Product Description Vy */}
      {selectedReport && (
        <ReportDetailView
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onRefresh={() => setRefresh((prev) => prev + 1)}
        />
      )}
    </div>
  );
}

export default App;
