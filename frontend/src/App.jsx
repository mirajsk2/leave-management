import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ApplyLeave from "./pages/ApplyLeave";
import LeaveHistory from "./pages/LeaveHistory";
import ManagerEmployees from "./pages/ManagerEmployees";
import ManagerLeaves from "./pages/ManagerLeaves";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "manager" ? "/manager/leaves" : "/dashboard"} replace />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply-leave"
          element={
            <ProtectedRoute requiredRole="employee">
              <ApplyLeave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leave-history"
          element={
            <ProtectedRoute requiredRole="employee">
              <LeaveHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/employees"
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerEmployees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/leaves"
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerLeaves />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
