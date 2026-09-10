"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DishPhoto } from "@/components/dish-photo";
import { adjustStock, receiveStock } from "@/lib/actions";
import { clock } from "@/lib/format";
import type { MenuItem, StockMove } from "@/lib/types";

export function InventoryBoard({ menu, stockMoves }: { menu: MenuItem[]; stockMoves: StockMove[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [qty, setQty] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  function receive(itemId: string) {
    const value = Number(qty[itemId] ?? 0);
    setError("");
    start(async () => {
      const result = await receiveStock(itemId, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setQty((prev) => ({ ...prev, [itemId]: "" }));
      router.refresh();
    });
  }

  function setExact(itemId: string) {
    const value = Number(qty[itemId] ?? 0);
    setError("");
    start(async () => {
      const result = await adjustStock(itemId, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setQty((prev) => ({ ...prev, [itemId]: "" }));
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Stock room</p>
        <h2 className="font-display mt-1 text-2xl sm:text-4xl">Inventory</h2>
        <p className="mt-1 text-sm text-muted sm:text-base">Receive purchases or correct counts. Sales reduce stock automatically.</p>
      </div>
      {error ? <p className="text-sm text-rose">{error}</p> : null}

      <section className="rounded-2xl border border-line bg-panel p-3 sm:rounded-3xl sm:p-5">
        <div className="space-y-3 md:hidden">
          {menu.map((item) => {
            const low = item.stock <= item.lowStockAt;
            return (
              <article key={item.id} className="rounded-2xl bg-panel-2 p-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                    <DishPhoto item={item} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-xs text-muted">{item.category}</p>
                    <p className={`text-sm ${low ? "text-rose" : "text-muted"}`}>
                      {item.stock} {item.unit} · alert {item.lowStockAt}
                    </p>
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={qty[item.id] ?? ""}
                  onChange={(e) => setQty((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Qty"
                  className="mt-3 w-full rounded-xl border border-line bg-bg px-3 text-sm outline-none"
                />
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => receive(item.id)}
                    className="rounded-xl bg-gold text-sm font-medium text-white disabled:opacity-40"
                  >
                    Receive
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setExact(item.id)}
                    className="rounded-xl bg-white text-sm disabled:opacity-40"
                  >
                    Set count
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3 font-medium">Item</th>
                <th className="pb-3 font-medium">On hand</th>
                <th className="pb-3 font-medium">Alert</th>
                <th className="pb-3 font-medium">Qty</th>
                <th className="pb-3 text-right font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => {
                const low = item.stock <= item.lowStockAt;
                return (
                  <tr key={item.id} className="border-t border-line">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-white">
                          <DishPhoto item={item} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 ${low ? "text-rose" : ""}`}>
                      {item.stock} {item.unit}
                    </td>
                    <td className="py-3 text-muted">{item.lowStockAt}</td>
                    <td className="py-3">
                      <input
                        type="number"
                        min="0"
                        value={qty[item.id] ?? ""}
                        onChange={(e) => setQty((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        className="w-24 rounded-xl border border-line bg-bg px-2 text-sm outline-none"
                      />
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => receive(item.id)}
                        className="mr-2 text-gold-2 hover:underline disabled:opacity-40"
                      >
                        Receive
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setExact(item.id)}
                        className="text-muted hover:underline disabled:opacity-40"
                      >
                        Set count
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-3 sm:rounded-3xl sm:p-5">
        <h3 className="font-display text-xl sm:text-2xl">Recent stock moves</h3>
        <div className="mt-4 space-y-2">
          {stockMoves.length === 0 ? (
            <p className="text-sm text-muted">No movements yet.</p>
          ) : (
            stockMoves.map((move) => (
              <div key={move.id} className="flex items-center justify-between rounded-2xl bg-panel-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{move.itemName}</p>
                  <p className="text-xs capitalize text-muted">
                    {move.reason} · {clock(move.createdAt)}
                  </p>
                </div>
                <p className={move.qty < 0 ? "text-rose" : "text-mint"}>
                  {move.qty > 0 ? "+" : ""}
                  {move.qty}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
