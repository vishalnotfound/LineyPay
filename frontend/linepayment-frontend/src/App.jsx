import React, { useState } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Wallet from "./components/Wallet";
import Transactions from "./components/Transactions";

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>LinePay</h1>

      {!user && (
        <>
          <Register />
          <hr style={{ margin: "2rem 0" }} />
          <Login setUser={setUser} />
        </>
      )}

      {user && (
        <>
          <h2>Welcome, {user.username}!</h2>
          <Wallet user={user} />
          <Transactions user={user} />
        </>
      )}
    </div>
  );
}
