import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import * as api from "../api";

const SEEN_KEY_PREFIX = "seenLeaveStatuses:";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkForStatusUpdates() {
      try {
        const leaves = await api.getMyLeaves();
        const storageKey = SEEN_KEY_PREFIX + user.username;
        const seen = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const nextSeen = { ...seen };
        let hasChanges = false;

        for (const leave of leaves) {
          const previousStatus = seen[leave.id];
          if (
            (leave.status === "approved" || leave.status === "rejected") &&
            previousStatus !== leave.status
          ) {
            showToast(
              `Your leave request (${leave.start_date} to ${leave.end_date}) was ${leave.status}.`,
              leave.status === "approved" ? "success" : "error"
            );
            hasChanges = true;
          }
          nextSeen[leave.id] = leave.status;
        }

        if (hasChanges || Object.keys(seen).length !== Object.keys(nextSeen).length) {
          localStorage.setItem(storageKey, JSON.stringify(nextSeen));
        }
      } catch (err) {
        // Silently ignore - dashboard should still render even if this check fails
        console.error(err);
      }
    }
    checkForStatusUpdates();
  }, [user.username, showToast]);

  return (
    <div className="page-container">
      <h1>Welcome, {user.username}</h1>
      <p className="subtitle">What would you like to do today?</p>
      <div className="dashboard-actions">
        <button className="btn btn-primary btn-large" onClick={() => navigate("/apply-leave")}>
          Apply Leave
        </button>
        <button
          className="btn btn-secondary btn-large"
          onClick={() => navigate("/leave-history")}
        >
          View Leave History
        </button>
      </div>
    </div>
  );
}
