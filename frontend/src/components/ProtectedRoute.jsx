import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Employees can't reach manager pages, managers get bounced away from employee pages
    return <Navigate to={user.role === "manager" ? "/manager/leaves" : "/dashboard"} replace />;
  }

  return children;
}
