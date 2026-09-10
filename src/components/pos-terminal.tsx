"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Printer, Search, Trash2, UtensilsCrossed } from "lucide-react";
import { DishPhoto } from "@/components/dish-photo";
import { checkout } from "@/lib/actions";
import { money, taxLabel, typeLabel } from "@/lib/format";
import type { MenuItem, Order, OrderType, PaymentMethod, Table } from "@/lib/types";

type CartLine = { itemId: string; qty: number };

function maxQty(menu: MenuItem[], orders: Order[], orderId: string | null, itemId: string) {
  const stock = menu.find((item) => item.id === itemId)?.stock ?? 0;
  if (!orderId) return stock;
  const reserved = orders.find((order) => order.id === orderId)?.lines.find((line) => line.itemId === itemId)?.qty ?? 0;
  return stock + reserved;
}

export function PosTerminal({
  taxRate,
  menu,
  tables,
  orders,
}: {
  taxRate: number;
  menu: MenuItem[];
  tables: Table[];
  orders: Order[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState<OrderType>("dine-in");
  const [tableId, setTableId] = useState<string>("");
  const [note, setNote] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [paidId, setPaidId] = useState<string | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((item) => item.category)))],
    [menu]
  );

  const openOrders = orders.filter((order) => order.status === "open");

  const visible = menu.filter((item) => {
    const matchCat = category === "All" || item.category === category;
    const matchQ = item.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchCat && matchQ;
  });

  const detailed = cart.map((line) => {
    const item = menu.find((entry) => entry.id === line.itemId);
    return {
      ...line,
      name: item?.name ?? "Item",
      price: item?.price ?? 0,
      stock: item?.stock ?? 0,
      image: item?.image,
    };
  });

  const subtotal = detailed.reduce((sum, line) => sum + line.price * line.qty, 0);
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;

  function loadOrder(order: Order) {
    setOrderId(order.id);
    setType(order.type);
    setTableId(order.tableId ?? "");
    setNote(order.note);
    setCart(order.lines.map((line) => ({ itemId: line.itemId, qty: line.qty })));
    setPaidId(null);
    setError("");
  }

  function reset() {
    setOrderId(null);
    setCart([]);
    setNote("");
    setTableId("");
    setType("dine-in");
    setPaidId(null);
    setError("");
  }

  function addItem(item: MenuItem) {
    setPaidId(null);
    setCart((prev) => {
      const found = prev.find((line) => line.itemId === item.id);
      const nextQty = (found?.qty ?? 0) + 1;
      if (nextQty > maxQty(menu, orders, orderId, item.id)) return prev;
      if (found) return prev.map((line) => (line.itemId === item.id ? { ...line, qty: nextQty } : line));
      return [...prev, { itemId: item.id, qty: 1 }];
    });
  }

  function setQty(itemId: string, qty: number) {
    const max = maxQty(menu, orders, orderId, itemId);
    if (qty < 1) {
      setCart((prev) => prev.filter((line) => line.itemId !== itemId));
      return;
    }
    setCart((prev) => prev.map((line) => (line.itemId === itemId ? { ...line, qty: Math.min(qty, max) } : line)));
  }

  function submit(paymentMethod: PaymentMethod | null) {
    setError("");
    start(async () => {
      const result = await checkout({
        orderId,
        type,
        tableId: type === "dine-in" ? tableId || null : null,
        note,
        paymentMethod,
        lines: cart,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (paymentMethod) {
        setPaidId(result.orderId);
        setOrderId(null);
        setCart([]);
        setNote("");
        setTableId("");
        router.refresh();
        return;
      }
      setOrderId(result.orderId);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 pb-24 xl:grid-cols-[1fr_minmax(300px,380px)] xl:pb-0">
      <section className="rounded-2xl border border-line bg-panel p-3 sm:rounded-[28px] sm:p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Fast & Slow · POS</p>
            <h2 className="font-display mt-1 text-2xl sm:text-3xl">Create bill</h2>
          </div>
          {openOrders.length ? (
            <div className="flex flex-wrap gap-2">
              {openOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => loadOrder(order)}
                  className={`rounded-full border px-3 text-xs ${
                    orderId === order.id
                      ? "border-gold bg-gold text-white"
                      : "border-line bg-panel-2 text-ink"
                  }`}
                >
                  {order.billNo}
                  {order.tableName ? ` · ${order.tableName}` : ""}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 z-10 h-4 w-4 -translate-y-1/2 text-muted"
              strokeWidth={2}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes..."
              className="box-border h-12 w-full min-w-0 rounded-2xl border border-line bg-white py-0 pr-4 pl-11 text-sm outline-none ring-gold/40 focus:ring-2"
            />
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className={`shrink-0 rounded-full px-4 text-sm ${
                  category === name ? "bg-gold text-white" : "bg-panel-2 text-muted"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3">
          {visible.map((item) => {
            const out = item.stock < 1;
            return (
              <button
                key={item.id}
                type="button"
                disabled={out}
                onClick={() => addItem(item)}
                className="dish-card group overflow-hidden rounded-2xl border border-line bg-white text-left transition sm:rounded-[24px] sm:hover:-translate-y-0.5 disabled:opacity-40"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-panel-2">
                  <DishPhoto
                    item={item}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-white/92 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-ink">
                    {item.category}
                  </span>
                  <span className="absolute bottom-2 right-2 rounded-full bg-gold px-2.5 py-1 text-xs font-semibold text-white">
                    {money(item.price)}
                  </span>
                </div>
                <div className="p-2 sm:p-3">
                  <p className="text-sm font-medium leading-snug sm:text-base">{item.name}</p>
                  <p className={`mt-1 text-xs ${item.stock <= item.lowStockAt ? "text-rose" : "text-muted"}`}>
                    {out ? "Out of stock" : `${item.stock} ${item.unit} left`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside id="current-bill" className="rounded-2xl border border-line bg-panel p-3 sm:rounded-[28px] sm:p-4 md:p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl sm:text-2xl">Current bill</h3>
          <button type="button" onClick={reset} className="rounded-full bg-panel-2 px-3 text-xs text-muted">
            New
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {(Object.keys(typeLabel) as OrderType[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`rounded-xl text-xs ${type === key ? "bg-gold text-white" : "bg-panel-2 text-muted"}`}
            >
              {typeLabel[key]}
            </button>
          ))}
        </div>

        {type === "dine-in" ? (
          <select
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
          >
            <option value="">Select table</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>
                {table.name} · {table.seats} seats · {table.status}
              </option>
            ))}
          </select>
        ) : null}

        <div className="mt-4 max-h-[42vh] space-y-2 overflow-auto pr-1">
          {detailed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
              <UtensilsCrossed className="mx-auto mb-2" />
              Tap a dish to add it to the bill.
            </div>
          ) : (
            detailed.map((line) => (
              <div key={line.itemId} className="rounded-2xl bg-panel-2 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                      <DishPhoto item={line} alt={line.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{line.name}</p>
                      <p className="text-xs text-muted">{money(line.price)}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setQty(line.itemId, 0)} className="text-rose">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(line.itemId, line.qty - 1)}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-bg"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.itemId, line.qty + 1)}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-bg"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-gold-2">{money(line.price * line.qty)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Kitchen note, extra spice, no onion..."
          className="mt-3 min-h-16 w-full rounded-2xl border border-line bg-bg px-3 py-2 text-sm outline-none"
        />

        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>GST {taxLabel(taxRate)}</span>
            <span>{money(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-rose">{error}</p> : null}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={pending || cart.length === 0}
            onClick={() => submit(null)}
            className="rounded-2xl bg-panel-2 text-sm disabled:opacity-40"
          >
            Hold bill
          </button>
          <button
            type="button"
            disabled={pending || cart.length === 0}
            onClick={() => submit("card")}
            className="rounded-2xl bg-panel-2 text-sm disabled:opacity-40"
          >
            Pay card
          </button>
          <button
            type="button"
            disabled={pending || cart.length === 0}
            onClick={() => submit("cash")}
            className="col-span-2 rounded-2xl bg-gold text-white font-semibold disabled:opacity-40"
          >
            {pending ? "Saving..." : `Pay cash · ${money(total)}`}
          </button>
        </div>

        {paidId ? (
          <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-3">
            <p className="text-sm">Bill paid. Print the receipt for the guest.</p>
            <button
              type="button"
              onClick={() => window.open(`/orders/${paidId}/print`, "_blank")}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gold text-white text-sm font-medium"
            >
              <Printer size={16} />
              Print bill
            </button>
          </div>
        ) : null}
      </aside>

      {cart.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 p-3 backdrop-blur xl:hidden">
          <button
            type="button"
            onClick={() => document.getElementById("current-bill")?.scrollIntoView({ behavior: "smooth" })}
            className="w-full rounded-2xl bg-gold text-sm font-semibold text-white"
          >
            View bill · {detailed.reduce((n, line) => n + line.qty, 0)} items · {money(total)}
          </button>
        </div>
      ) : null}
    </div>
  );
}
