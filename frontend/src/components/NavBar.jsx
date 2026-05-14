import { NavLink } from "react-router-dom";
import "../style.css";

const navLinks = [
  { label: "View Reports",     to: "/reports"     },
  { label: "Create Report",      to: "/submit"      },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "My Account",  to: "/account"     },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <ul className="navbar-links">
        {navLinks.map(({ label, to }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => isActive ? "nav-btn active" : "nav-btn"}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}