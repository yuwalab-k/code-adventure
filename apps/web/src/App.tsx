import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./auth/LoginPage";
import { RequireAuth, RequireAdmin } from "./auth/RequireAuth";
import { useAuth } from "./auth/AuthContext";
import { GamePage } from "./pages/GamePage";
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { Mascot } from "./mascot/Mascot";

function HomeRedirect() {
  const { status, user } = useAuth();
  if (status === "loading") return null;
  if (status === "signed-out") return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === "admin" ? "/admin" : "/map"} replace />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/map" element={<RequireAuth><GamePage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminHomePage /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
      <Mascot />
    </>
  );
}

export default App;
