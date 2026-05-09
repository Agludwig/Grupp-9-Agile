import { useState } from "react";
import ReportForm from "./components/ReportForm";
import List from "./components/List";
import Header from "./components/Header";
import "./style.css";

function App() {
  const [refresh, setRefresh] =
    useState(0);

  const [currentUser, setCurrentUser] =
    useState(null);

  const handleSubmit = async (
    report
  ) => {
    await fetch(
      "http://127.0.0.1:8000/reports",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(report),
      }
    );

    setRefresh((r) => r + 1);
  };

  return (
  <div className="app-container">
      <h1>LitterFree Cities</h1>

      <Header
        currentUser={currentUser}
        setCurrentUser={
          setCurrentUser
        }
      />

      {!currentUser ? (
  <div className="login-box">
    <h2>
      Please log in to continue
    </h2>

    <p>
      You must be logged in to create and view reports.
    </p>
    <img
  src="/eco-city.png"
  alt="Eco city"
  className="login-image"
/>
  </div>
      ) : (
        <>
          <ReportForm
            onSubmit={
              handleSubmit
            }
          />

          <h2
            style={{
              marginTop: "2rem",
            }}
          >
            All Reports
          </h2>

          <List key={refresh} />
        </>
      )}
    </div>
  );
}

export default App;