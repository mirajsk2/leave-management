const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

async function handleResponse(res) {
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function register(username, password) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function applyLeave({ reason, startDate, endDate, file }) {
  const formData = new FormData();
  formData.append("reason", reason);
  formData.append("startDate", startDate);
  formData.append("endDate", endDate);
  if (file) formData.append("document", file);

  const res = await fetch(`${API_URL}/api/leaves`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  return handleResponse(res);
}

export async function getMyLeaves() {
  const res = await fetch(`${API_URL}/api/leaves/mine`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function getEmployees() {
  const res = await fetch(`${API_URL}/api/manager/employees`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function getAllLeaves() {
  const res = await fetch(`${API_URL}/api/manager/leaves`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return handleResponse(res);
}

export async function reviewLeave(id, status, remarks) {
  const res = await fetch(`${API_URL}/api/manager/leaves/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ status, remarks }),
  });
  return handleResponse(res);
}

export function documentUrl(id) {
  return `${API_URL}/api/leaves/${id}/document`;
}

export { API_URL };
