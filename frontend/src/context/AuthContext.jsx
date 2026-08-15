import { createContext, useContext, useState } from "react";
import * as api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function persist(token, user) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }

  async function login(username, password) {
    const data = await api.login(username, password);
    persist(data.token, data.user);
    return data.user;
  }

  async function register(username, password) {
    const data = await api.register(username, password);
    persist(data.token, data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
