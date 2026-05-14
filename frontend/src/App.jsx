import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Navbar from "./components/NavBar.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import SubmitPage from "./pages/SubmitPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AccountPage     from "./pages/AccountPage";
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

  const sharedProps = {
    reports,
    currentUser,
    selectedReport,
    setSelectedReport,
    onRefresh: () => setRefresh((prev) => prev + 1),
    onSubmit: handleSubmit,
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Header currentUser={currentUser} setCurrentUser={setCurrentUser} />
        <h1 className="text-center my-4">LitterFree Cities</h1>
        <Navbar />

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
            <Routes>
              <Route path="/"        element={<Navigate to="/reports" replace />} />
              <Route path="/reports" element={<ReportsPage {...sharedProps} />} />
              <Route path="/submit"  element={<SubmitPage  {...sharedProps} />} />
              <Route path="/leaderboard" element={<LeaderboardPage {...sharedProps} />} />
              <Route path="/account"     element={<AccountPage     {...sharedProps} />} />
            </Routes>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;