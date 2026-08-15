import { useEffect, useState } from "react";
import * as api from "../api";
import StatusBadge from "../components/StatusBadge";
import DocumentLink from "../components/DocumentLink";

export default function LeaveHistory() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getMyLeaves()
      .then(setLeaves)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1>My Leave History</h1>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : leaves.length === 0 ? (
        <p>You haven't submitted any leave requests yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Manager's Remarks</th>
                <th>Document</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>
                    {leave.start_date} &rarr; {leave.end_date}
                  </td>
                  <td>{leave.reason}</td>
                  <td>
                    <StatusBadge status={leave.status} />
                  </td>
                  <td>{leave.remarks || "-"}</td>
                  <td>
                    <DocumentLink leaveId={leave.id} name={leave.document_original_name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
