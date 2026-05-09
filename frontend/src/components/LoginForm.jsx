import { useState } from "react";
import RegisterModal from "./RegisterModal";

function LoginForm({ setCurrentUser }) {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showRegister, setShowRegister] =
  useState(false);

  

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch(
      "http://127.0.0.1:8000/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    if (response.ok) {
      const user = await response.json();

      setCurrentUser(user);

      setUsername("");
      setPassword("");
    } else {
      alert(
        "Invalid username or password"
      );
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button type="submit">
        Log in
      </button>

    

      <RegisterModal
      show={showRegister}
      onClose={() =>
      setShowRegister(false)
      }
/>

    </form>

    
  );
}

export default LoginForm;