import LoginForm from "./LoginForm";
import LoggedIn from "./LoggedIn";

function Header({
  currentUser,
  setCurrentUser,
}) {

  return (
    <header
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
    

      {currentUser ? (
        <LoggedIn
          currentUser={currentUser}
          setCurrentUser={
            setCurrentUser
          }
        />
      ) : (
        <LoginForm
          setCurrentUser={
            setCurrentUser
          }
        />
      )}
    </header>
  );
}

export default Header;