function LoggedIn({ currentUser, setCurrentUser }) {
  function handleLogout() {
    setCurrentUser(null);
  }

  return (
    <div className="header-user-bar">
      <span>
        Logged in as <strong>{currentUser.username}</strong>
      </span>
      <button className="btn-logout" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}

export default LoggedIn;
