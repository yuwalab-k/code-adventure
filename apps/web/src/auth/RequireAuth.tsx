import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") return <div className="loading-screen">よみこみちゅう...</div>;
  if (status === "signed-out") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === "loading") return <div className="loading-screen">よみこみちゅう...</div>;
  if (status === "signed-out") return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/map" replace />;
  return <>{children}</>;
}
