import { useNavigate } from "react-router-dom";

function LoggedIn({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();

  function handleLogout() {
    setCurrentUser(null);
    navigate("/");
  }

  return (
    <div className="header-user-bar">
      <span>
        Logged in as <strong>{currentUser.username}</strong>
      </span>

      <button className="btn btn-outline-primary btn-sm" onClick={() => navigate("/account")}>
        My Profile
      </button>

      <button className="btn-logout" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}

export default LoggedIn;
