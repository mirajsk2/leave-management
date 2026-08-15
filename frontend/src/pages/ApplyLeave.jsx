import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api";
import { useToast } from "../context/ToastContext";

export default function ApplyLeave() {
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date");
      return;
    }

    setLoading(true);
    try {
      await api.applyLeave({ reason, startDate, endDate, file });
      showToast("Leave request submitted successfully.", "success");
      navigate("/leave-history");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <h1>Apply for Leave</h1>
      <form className="card-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}
        <label>
          Reason
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
          />
        </label>
        <div className="form-row">
          <label>
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>
          <label>
            End Date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Supporting Document
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Leave Request"}
        </button>
      </form>
    </div>
  );
}
