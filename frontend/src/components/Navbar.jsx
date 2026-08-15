import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">Leave Management</div>
      <div className="navbar-links">
        {user.role === "employee" ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/apply-leave">Apply Leave</Link>
            <Link to="/leave-history">Leave History</Link>
          </>
        ) : (
          <>
            <Link to="/manager/leaves">Leave Requests</Link>
            <Link to="/manager/employees">Employees</Link>
          </>
        )}
        <span className="navbar-user">{user.username}</span>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
