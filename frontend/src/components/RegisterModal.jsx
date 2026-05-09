import { useState } from "react";

function RegisterModal({
  show,
  onClose,
}) {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  if (!show) return null;

  async function handleRegister(e) {
    e.preventDefault();

    const response = await fetch(
      "http://127.0.0.1:8000/register",
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
      alert("Account created!");
      onClose();
    } else {
      alert("Registration failed");
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent:
          "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
        }}
      >
        <h2>Create account</h2>

        <form
          onSubmit={handleRegister}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <div
            style={{
              marginTop: "1rem",
            }}
          >
            <button type="submit">
              Register
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                marginLeft: "1rem",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterModal;