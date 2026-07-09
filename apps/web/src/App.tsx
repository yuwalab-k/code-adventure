import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./auth/LoginPage";
import { RequireAuth, RequireAdmin } from "./auth/RequireAuth";
import { MapPage } from "./pages/MapPage";
import { ProblemPage } from "./pages/ProblemPage";
import { StorePage } from "./pages/StorePage";
import { AvatarPage } from "./pages/AvatarPage";
import { AdminHomePage } from "./pages/admin/AdminHomePage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/map" element={<RequireAuth><MapPage /></RequireAuth>} />
      <Route path="/problems/:id" element={<RequireAuth><ProblemPage /></RequireAuth>} />
      <Route path="/store" element={<RequireAuth><StorePage /></RequireAuth>} />
      <Route path="/avatar" element={<RequireAuth><AvatarPage /></RequireAuth>} />
      <Route path="/admin" element={<RequireAdmin><AdminHomePage /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
      <Route path="*" element={<Navigate to="/map" replace />} />
    </Routes>
  );
}

export default App;
