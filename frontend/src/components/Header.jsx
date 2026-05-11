import { useState } from "react";
import LoginForm from "./LoginForm";
import LoggedIn from "./LoggedIn";
import RegisterModal from "./RegisterModal";

function Header({
  currentUser,
  setCurrentUser,
}) {

  const [showRegister, setShowRegister] =
    useState(false);

  return (
    <header>
      {currentUser ? (
        <LoggedIn
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      ) : (
        <div
  style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  }}
>
  <div
    style={{
      display: "flex",
      gap: "0.5rem",
    }}
  >
    <LoginForm
      setCurrentUser={setCurrentUser}
    />
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      gap: "1rem",
    }}
  >
    <div
      style={{
        flex: 1,
        height: "1px",
        background: "#ccc",
      }}
    />

    <span>or</span>

    <div
      style={{
        flex: 1,
        height: "1px",
        background: "#ccc",
      }}
    />
  </div>

  <button
    onClick={() =>
      setShowRegister(true)
    }
  >
    Create account
  </button>
</div>     )}

<RegisterModal
  show={showRegister}
  onClose={() =>
    setShowRegister(false)
  }
/>
    </header>
  );
}

export default Header;