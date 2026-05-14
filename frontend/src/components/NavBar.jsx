import { useState } from "react";

const navLinks = ["View Reports", "Create Report", "Leaderboard", "My Account"];

export default function Navbar() {
  const [active, setActive] = useState("Work");

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 1.5rem", height: 60,
      border: "0.5px solid #e0e0e0", borderRadius: 12,
      fontFamily: "'DM Mono', monospace",
    }}>

      <ul style={{ display: "flex", gap: 4, listStyle: "none", margin: 0, padding: 0 }}>
        {navLinks.map((link) => (
          <li key={link}>
            <button
              onClick={() => setActive(link)}
              style={{
                fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase",
                background: active === link ? "#000000" : "transparent",
                border: `0.5px solid ${active === link ? "#ccc" : "transparent"}`,
                borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              }}
            >
              {link}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}