import { useEffect, useState } from "react";
import List from "./components/list";

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
        <div>
            <List />
        </div>
    </div>
  );
}

export default App;