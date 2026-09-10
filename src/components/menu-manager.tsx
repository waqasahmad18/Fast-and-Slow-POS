"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DishPhoto } from "@/components/dish-photo";
import { toggleMenuItem, upsertMenuItem } from "@/lib/actions";
import { money } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

const empty = {
  id: "",
  name: "",
  category: "",
  price: "",
  stock: "0",
  unit: "pcs",
  lowStockAt: "5",
  image: "",
};

export function MenuManager({ menu }: { menu: MenuItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const rows = menu.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));

  function edit(item: MenuItem) {
    setForm({
      id: item.id,
      name: item.name,
      category: item.category,
      price: String(item.price),
      stock: String(item.stock),
      unit: item.unit,
      lowStockAt: String(item.lowStockAt),
      image: item.image ?? "",
    });
    setError("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    start(async () => {
      const result = await upsertMenuItem({
        id: form.id || undefined,
        name: form.name,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        unit: form.unit,
        lowStockAt: Number(form.lowStockAt),
        image: form.image,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setForm(empty);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <form onSubmit={submit} className="rounded-[28px] border border-line bg-panel p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Fast & Slow menu</p>
        <h2 className="font-display mt-1 text-3xl">{form.id ? "Edit item" : "Add item"}</h2>
        <div className="mt-4 space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Item name"
            className="w-full rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
            required
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Category (Karahi, BBQ, Drinks)"
            className="w-full rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
          />
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="Image path or URL (/dishes/new.png)"
            className="w-full rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
          />
          {form.image || form.id ? (
            <div className="h-28 overflow-hidden rounded-2xl bg-panel-2">
              <DishPhoto item={form} alt={form.name || "Preview"} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price PKR"
              className="rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
              required
            />
            <input
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="Unit"
              className="rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
            />
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="Opening stock"
              className="rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
            />
            <input
              type="number"
              min="0"
              value={form.lowStockAt}
              onChange={(e) => setForm({ ...form, lowStockAt: e.target.value })}
              placeholder="Low stock alert"
              className="rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
            />
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-rose">{error}</p> : null}
        <div className="mt-4 flex gap-2">
          <button type="submit" disabled={pending} className="flex-1 rounded-2xl bg-gold text-sm font-semibold text-white">
            {pending ? "Saving..." : form.id ? "Update item" : "Add to menu"}
          </button>
          {form.id ? (
            <button type="button" onClick={() => setForm(empty)} className="rounded-2xl bg-panel-2 px-4 text-sm">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <section className="rounded-[28px] border border-line bg-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl">{menu.length} dishes</h3>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rows.map((item) => (
            <article key={item.id} className="dish-card overflow-hidden rounded-[24px] border border-line bg-white">
              <div className="aspect-[4/3] overflow-hidden bg-panel-2">
                <DishPhoto item={item} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{item.category}</p>
                <div className="mt-1 flex items-start justify-between gap-3">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-gold-2">{money(item.price)}</p>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {item.stock} {item.unit} · {item.active ? "On POS" : "Hidden"}
                </p>
                <div className="mt-3 flex gap-3 text-sm">
                  <button type="button" onClick={() => edit(item)} className="text-gold-2 hover:underline">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      start(async () => {
                        await toggleMenuItem(item.id);
                        router.refresh();
                      })
                    }
                    className="text-muted hover:underline"
                  >
                    {item.active ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
