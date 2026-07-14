import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, ApiError } from "../lib/api";

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: "student" | "admin";
  xp: number;
  rating: number;
  coins: number;
}

interface AuthState {
  user: User | null;
  status: "loading" | "signed-in" | "signed-out";
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthState["status"]>("loading");

  useEffect(() => {
    apiFetch<{ user: User }>("/auth/me")
      .then((res) => {
        setUser(res.user);
        setStatus("signed-in");
      })
      .catch(() => setStatus("signed-out"));
  }, []);

  async function login(username: string, password: string) {
    const res = await apiFetch<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setUser(res.user);
    setStatus("signed-in");
  }

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    setStatus("signed-out");
  }

  // Re-fetches the current user (xp/rating/coins) after a reward-granting
  // action, so the HUD reflects the new totals without a full page reload.
  async function refreshUser() {
    const res = await apiFetch<{ user: User }>("/auth/me");
    setUser(res.user);
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout, refreshUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
