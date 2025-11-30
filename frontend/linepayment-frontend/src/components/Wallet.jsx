import React, { useState } from "react";

export default function Wallet({ user }) {
  const [amount, setAmount] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [message, setMessage] = useState("");

  async function handleAddMoney() {
    if (!amount) return setMessage("Enter amount");

    const res = await fetch("http://127.0.0.1:8000/wallet/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: String(user.id),
        amount: parseFloat(amount),
      }),
    });
    const data = await res.json();
    setMessage(JSON.stringify(data));
  }

  async function handleTransfer() {
    if (!toUserId || !amount) return setMessage("Enter user ID and amount");

    const res = await fetch("http://127.0.0.1:8000/wallet/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_user_id: String(user.id),
        to_user_id: String(toUserId),
        amount: parseFloat(amount),
      }),
    });
    const data = await res.json();
    setMessage(JSON.stringify(data));
  }

  return (
    <div>
      <h3>Wallet</h3>
      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleAddMoney}>Add Money</button>
      <input
        placeholder="To User ID"
        type="number"
        value={toUserId}
        onChange={(e) => setToUserId(e.target.value)}
      />
      <button onClick={handleTransfer}>Transfer Money</button>
      <pre>{message}</pre>
    </div>
  );
}
