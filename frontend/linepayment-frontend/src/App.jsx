import { useState, useEffect } from "react";
import API from "./api";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("auth");
  const [authTab, setAuthTab] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  // Wallet states
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (token) {
      setPage("home");
    }
  }, [token]);

  const showMessage = (msg, type) => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(""), 3000);
  };

  // Auth handlers
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", { username, password });
      showMessage("✅ Registration successful! Now login.", "success");
      setUsername("");
      setPassword("");
      setAuthTab("login");
    } catch (error) {
      showMessage(
        `❌ ${error.response?.data?.detail || "Registration failed"}`,
        "error"
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);
      setCurrentUser(username);
      setUsername("");
      setPassword("");
      setPage("home");
      showMessage("✅ Login successful!", "success");
    } catch (error) {
      showMessage(
        `❌ ${error.response?.data?.detail || "Login failed"}`,
        "error"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setPage("auth");
    setCurrentUser("");
    setAuthTab("login");
    showMessage("✅ Logged out", "success");
  };

  // Wallet handlers
  const handleSendMoney = async (e) => {
    e.preventDefault();
    if (!userId || !toUserId || !amount) {
      showMessage("❌ Fill all fields", "error");
      return;
    }
    try {
      await API.post("/wallet/transfer", {
        from_user_id: parseInt(userId),
        to_user_id: parseInt(toUserId),
        amount: parseFloat(amount),
      });
      showMessage("✅ Money sent successfully!", "success");
      setUserId("");
      setToUserId("");
      setAmount("");
    } catch (error) {
      showMessage(
        `❌ ${error.response?.data?.detail || "Transfer failed"}`,
        "error"
      );
    }
  };

  const handleGetTransactions = async (e) => {
    e.preventDefault();
    if (!userId) {
      showMessage("❌ Enter User ID", "error");
      return;
    }
    try {
      const res = await API.get(`/wallet/transactions/${userId}`);
      setTransactions(res.data);
      showMessage("✅ Transactions loaded!", "success");
    } catch (error) {
      showMessage(`❌ ${error.response?.data?.detail || "Failed"}`, "error");
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>💳 LinePay</h1>
        {token && (
          <div className="header-right">
            <span className="user-name">Welcome, {currentUser}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </header>

      {message && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {page === "auth" && !token ? (
        <div className="auth-container">
          <div className="auth-box">
            <div className="auth-tabs">
              <button
                className={`tab ${authTab === "login" ? "active" : ""}`}
                onClick={() => setAuthTab("login")}
              >
                Login
              </button>
              <button
                className={`tab ${authTab === "register" ? "active" : ""}`}
                onClick={() => setAuthTab("register")}
              >
                Register
              </button>
            </div>

            {authTab === "login" ? (
              <form onSubmit={handleLogin}>
                <h2>Login</h2>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <h2>Register</h2>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Register</button>
              </form>
            )}
          </div>
        </div>
      ) : page === "home" && token ? (
        <div className="home-container">
          <div className="home-grid">
            <div className="home-card send-card">
              <h2>📤 Send Money</h2>
              <form onSubmit={handleSendMoney}>
                <input
                  type="number"
                  placeholder="Your User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Recipient User ID"
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button type="submit">Send Money</button>
              </form>
            </div>

            <div className="home-card transactions-card">
              <h2>📊 View Transactions</h2>
              <form onSubmit={handleGetTransactions}>
                <input
                  type="number"
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
                <button type="submit">Get Transactions</button>
              </form>

              {transactions.length > 0 && (
                <div className="transactions-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td>{tx.id}</td>
                          <td>{tx.from_user}</td>
                          <td>{tx.to_user}</td>
                          <td>${tx.amount.toFixed(2)}</td>
                          <td>{tx.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {transactions.length === 0 && (
                <p className="no-transactions">No transactions yet</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
