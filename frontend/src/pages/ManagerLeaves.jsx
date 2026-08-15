import { useEffect, useState } from "react";
import * as api from "../api";
import StatusBadge from "../components/StatusBadge";
import DocumentLink from "../components/DocumentLink";
import { useToast } from "../context/ToastContext";

export default function ManagerLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeLeave, setActiveLeave] = useState(null); // leave being reviewed
  const [pendingDecision, setPendingDecision] = useState(null); // "approved" | "rejected"
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  function loadLeaves() {
    setLoading(true);
    api
      .getAllLeaves()
      .then(setLeaves)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadLeaves, []);

  function openReview(leave, decision) {
    setActiveLeave(leave);
    setPendingDecision(decision);
    setRemarks("");
  }

  function closeModal() {
    setActiveLeave(null);
    setPendingDecision(null);
    setRemarks("");
  }

  async function confirmDecision() {
    setSubmitting(true);
    try {
      await api.reviewLeave(activeLeave.id, pendingDecision, remarks);
      showToast(`Leave request ${pendingDecision}.`, "success");
      closeModal();
      loadLeaves();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <h1>Leave Requests</h1>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : leaves.length === 0 ? (
        <p>No leave requests have been submitted yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Document</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>{leave.employee_username}</td>
                  <td>
                    {leave.start_date} &rarr; {leave.end_date}
                  </td>
                  <td>{leave.reason}</td>
                  <td>
                    <DocumentLink leaveId={leave.id} name={leave.document_original_name} />
                  </td>
                  <td>
                    <StatusBadge status={leave.status} />
                  </td>
                  <td>{leave.remarks || "-"}</td>
                  <td className="actions-cell">
                    {leave.status === "pending" ? (
                      <>
                        <button
                          className="btn btn-approve"
                          onClick={() => openReview(leave, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => openReview(leave, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="muted">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeLeave && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {pendingDecision === "approved" ? "Approve" : "Reject"} leave request for{" "}
              {activeLeave.employee_username}
            </h2>
            <p>
              {activeLeave.start_date} &rarr; {activeLeave.end_date}
            </p>
            <label>
              Remarks
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                placeholder="Optional remarks for the employee"
              />
            </label>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>
              <button
                className={pendingDecision === "approved" ? "btn btn-approve" : "btn btn-reject"}
                onClick={confirmDecision}
                disabled={submitting}
              >
                {submitting ? "Saving..." : `Confirm ${pendingDecision}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
