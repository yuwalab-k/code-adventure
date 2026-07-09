import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

interface Item {
  id: string;
  name: string;
  description: string | null;
  priceCoins: number | null;
}

export function StorePage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["items"], queryFn: () => apiFetch<{ items: Item[] }>("/items") });
  const { data: owned } = useQuery({
    queryKey: ["my-items"],
    queryFn: () => apiFetch<{ items: Item[] }>("/users/me/items"),
  });

  async function purchase(itemId: string) {
    await apiFetch("/store/purchase", { method: "POST", body: JSON.stringify({ itemId }) });
    queryClient.invalidateQueries({ queryKey: ["my-items"] });
    queryClient.invalidateQueries({ queryKey: ["map"] });
  }

  const ownedIds = new Set(owned?.items.map((i) => i.id));

  return (
    <main className="store-page">
      <Link to="/map">← マップへ戻る</Link>
      <h1>ストア</h1>
      <ul>
        {data?.items
          .filter((i) => i.priceCoins !== null)
          .map((item) => (
            <li key={item.id}>
              {item.name} — {item.priceCoins}コイン{" "}
              {ownedIds.has(item.id) ? (
                <span>(所持済み)</span>
              ) : (
                <button onClick={() => purchase(item.id)}>購入</button>
              )}
            </li>
          ))}
      </ul>
    </main>
  );
}
