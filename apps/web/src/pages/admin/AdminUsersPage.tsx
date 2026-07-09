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

function EditUserRow({ user }: { user: AdminUser }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [role, setRole] = useState<"student" | "admin">(user.role);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <li>
        {user.displayName} (@{user.username}) — {user.role}{" "}
        <button onClick={() => setEditing(true)}>編集</button>
      </li>
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body: { displayName: string; role: string; password?: string } = { displayName, role };
      if (password) body.password = password;
      await apiFetch(`/admin/users/${user.id}`, { method: "PUT", body: JSON.stringify(body) });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditing(false);
      setPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "更新に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li>
      <form onSubmit={handleSave} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <span>@{user.username}</span>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value as "student" | "admin")}>
          <option value="student">生徒</option>
          <option value="admin">管理者</option>
        </select>
        <input
          type="password"
          placeholder="新しいパスワード(変更する場合のみ)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={saving}>
          保存
        </button>
        <button type="button" onClick={() => setEditing(false)}>
          キャンセル
        </button>
        {error && <span style={{ color: "#c62828" }}>{error}</span>}
      </form>
    </li>
  );
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
          <EditUserRow key={u.id} user={u} />
        ))}
      </ul>
    </main>
  );
}
