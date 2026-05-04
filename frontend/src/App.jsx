import { useEffect, useState } from "react";
import ReportForm from "./components/ReportForm";
import List from "./components/List";
import "./style.css";

function App() {
  const [refresh, setRefresh] = useState(0);

  const handleSubmit = async (report) => {
    await fetch("http://127.0.0.1:8000/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });
    setRefresh((r) => r + 1);
  };

  return (
    <div>
      <h1>LitterFree Cities</h1>
      <ReportForm onSubmit={handleSubmit} />
      <h2 style={{ marginTop: "2rem" }}>All Reports</h2>
      <List key={refresh} />
    </div>
  );
}

export default App;
