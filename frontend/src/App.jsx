import { useState, useEffect } from "react";
import ReportForm from "./components/ReportForm";
import List from "./components/List";
import Header from "./components/Header";
import ReportMap from "./components/ReportMap";
import ReportDetailView from "./components/ReportDetailView";
import "./style.css";

function App() {
  const [reports, setReports] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/reports")
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((err) => console.error("Error fetching reports:", err));
  }, [refresh]);

  const handleSubmit = async (report) => {
    try {
      await fetch("http://127.0.0.1:8000/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      setRefresh((prev) => prev + 1);
    } catch (err) {
      console.error("Error submitting report:", err);
    }
  };

  return (
    <div className="app-container">
      <Header currentUser={currentUser} setCurrentUser={setCurrentUser} />

      <h1 className="text-center my-4">LitterFree Cities</h1>

      {!currentUser ? (
        <div className="login-box text-center">
          <h2>Please log in to continue</h2>
          <p>You must be logged in to create and view reports.</p>
          <img
            src="/eco-city.png"
            alt="Eco city"
            className="login-image"
            style={{ maxWidth: "300px", marginTop: "1rem" }}
          />
        </div>
      ) : (
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ReportForm onSubmit={handleSubmit} />
            </div>
          </div>

          <div className="row mt-5">
            <div className="col-md-12">
              <h2>Map Overview</h2>
              <ReportMap reports={reports} onSelectReport={setSelectedReport} />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-12">
              <h2>All Submitted Reports</h2>
              <List reports={reports} onSelectReport={setSelectedReport} />
            </div>
          </div>

          {selectedReport && (
            <ReportDetailView
              report={selectedReport}
              onClose={() => setSelectedReport(null)}
              onRefresh={() => setRefresh((prev) => prev + 1)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
