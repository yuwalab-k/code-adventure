import { useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiFetch, ApiError } from "../../lib/api";

interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: "student" | "admin";
}

// The one and only account-provisioning surface: there is no public
// self-registration endpoint anywhere in this API (see SPEC.md 4.1).
export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiFetch<{ users: AdminUser[] }>("/admin/users"),
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify({ username, password, displayName, role }),
      });
      setUsername("");
      setPassword("");
      setDisplayName("");
      setRole("student");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "作成に失敗しました");
    }
  }

  return (
    <main>
      <Link to="/admin">← 管理メニューへ戻る</Link>
      <h1>アカウント管理</h1>

      <form onSubmit={handleSubmit}>
        <h2>新しいアカウントを作成</h2>
        <label>
          ユーザー名
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          パスワード
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          表示名
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </label>
        <label>
          ロール
          <select value={role} onChange={(e) => setRole(e.target.value as "student" | "admin")}>
            <option value="student">生徒</option>
            <option value="admin">管理者</option>
          </select>
        </label>
        {error && <p>{error}</p>}
        <button type="submit">作成</button>
      </form>

      <h2>アカウント一覧</h2>
      <ul>
        {data?.users.map((u) => (
          <li key={u.id}>
            {u.displayName} (@{u.username}) — {u.role}
          </li>
        ))}
      </ul>
    </main>
  );
}
