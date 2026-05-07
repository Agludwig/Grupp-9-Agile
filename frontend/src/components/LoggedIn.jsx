function LoggedIn({
  currentUser,
  setCurrentUser,
}) {

  function handleLogout() {
    setCurrentUser(null);
  }

  return (
    <div>
      Logged in as{" "}
      <strong>
        {currentUser.username}
      </strong>

      <button
        onClick={handleLogout}
        style={{ marginLeft: "1rem" }}
      >
        Log out
      </button>
    </div>
  );
}

export default LoggedIn;