import React, { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister() {
    if (!username.trim()) {
      setMessage("Username cannot be empty");
      return;
    }
    if (password.length < 5) {
      setMessage("Password must be at least 5 characters long");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: String(username),
        password: String(password),
      }),
    });
    const data = await res.json();
    setMessage(JSON.stringify(data));
  }

  return (
    <div>
      <h2>Register</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
      <pre>{message}</pre>
    </div>
  );
}
