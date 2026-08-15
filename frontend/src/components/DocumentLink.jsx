import { API_URL } from "../api";

export default function DocumentLink({ leaveId, name }) {
  if (!name) return <span className="muted">None</span>;

  async function handleDownload(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/leaves/${leaveId}/document`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <a href="#" onClick={handleDownload}>
      {name}
    </a>
  );
}
