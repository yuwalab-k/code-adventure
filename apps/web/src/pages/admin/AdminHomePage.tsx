import { Link } from "react-router-dom";

export function AdminHomePage() {
  return (
    <main>
      <Link to="/map">← マップへ戻る</Link>
      <h1>管理メニュー</h1>
      <ul>
        <li>
          <Link to="/admin/users">アカウント管理</Link>
        </li>
      </ul>
      <p>
        問題・用語集・code_reading・アイテムの管理画面は準備中です(APIは実装済み — /api/admin/problems 等)。
      </p>
    </main>
  );
}
