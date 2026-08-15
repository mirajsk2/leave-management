import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      navigate(user.role === "manager" ? "/manager/leaves" : "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Log In</h1>
        {error && <div className="error-banner">{error}</div>}
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. jane_doe or manager@gcu.in"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
        <p className="auth-switch">
          New employee? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}
