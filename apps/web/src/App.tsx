import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LoginPage } from "./auth/LoginPage";
import { RequireAuth, RequireAdmin } from "./auth/RequireAuth";
import { useAuth } from "./auth/AuthContext";
import { MapPage } from "./pages/MapPage";
import { ProblemPage } from "./pages/ProblemPage";
import { StorePage } from "./pages/StorePage";
import { AvatarPage } from "./pages/AvatarPage";
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { Mascot } from "./mascot/Mascot";

function HomeRedirect() {
  const { status, user } = useAuth();
  if (status === "loading") return null;
  if (status === "signed-out") return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === "admin" ? "/admin" : "/map"} replace />;
}

// マップ・問題部屋ではロボットくんがプレイヤーに追従して常に見えているので、
// 右下固定のマスコットは表示すると二重になるため隠す。
export function GlobalMascot() {
  const location = useLocation();
  if (location.pathname.startsWith("/map") || location.pathname.startsWith("/problems/")) return null;
  return <Mascot />;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/map" element={<RequireAuth><MapPage /></RequireAuth>} />
        <Route path="/problems/:id" element={<RequireAuth><ProblemPage /></RequireAuth>} />
        <Route path="/store" element={<RequireAuth><StorePage /></RequireAuth>} />
        <Route path="/avatar" element={<RequireAuth><AvatarPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminHomePage /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
      <GlobalMascot />
    </>
  );
}

export default App;
