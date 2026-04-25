import { useEffect, useState } from "react";

function App() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/reports")
      .then((res) => res.json())
      .then((data) => setReports(data));
  }, []);

  return (
    <div>
      <h1>Reports</h1>

      <ul>
        {reports.map((r) => (
          <li key={r.id}>{r.message}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;