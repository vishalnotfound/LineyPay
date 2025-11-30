import React, { useState } from "react";

export default function Transactions({ user }) {
  const [transactions, setTransactions] = useState([]);

  async function fetchTransactions() {
    const res = await fetch(
      `http://127.0.0.1:8000/wallet/transactions/${user.id}`
    );
    const data = await res.json();
    setTransactions(data);
  }

  return (
    <div>
      <h3>Transactions</h3>
      <button onClick={fetchTransactions}>Get Transactions</button>
      <pre>{JSON.stringify(transactions, null, 2)}</pre>
    </div>
  );
}
