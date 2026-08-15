import { useEffect, useState } from "react";
import * as api from "../api";

export default function ManagerEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getEmployees()
      .then(setEmployees)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h1>Registered Employees</h1>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : employees.length === 0 ? (
        <p>No employees have registered yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.username}</td>
                  <td>{new Date(emp.date_joined).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
