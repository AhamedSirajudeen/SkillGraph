import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("skillgraph_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.data.user);
    } catch {
      localStorage.removeItem("skillgraph_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("skillgraph_token", data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("skillgraph_token", data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }

  function logout() {
    localStorage.removeItem("skillgraph_token");
    setUser(null);
  }

  function updateLocalUser(partial) {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: loadMe, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
