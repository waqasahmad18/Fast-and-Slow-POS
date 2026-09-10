"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "@/lib/actions";

export function SettingsForm({
  restaurantName,
  address,
  phone,
  taxRate,
}: {
  restaurantName: string;
  address: string;
  phone: string;
  taxRate: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    restaurantName,
    address,
    phone,
    taxPercent: String(Math.round(taxRate * 100)),
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    start(async () => {
      const result = await updateSettings({
        restaurantName: form.restaurantName,
        address: form.address,
        phone: form.phone,
        taxRate: Number(form.taxPercent) / 100,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="max-w-xl rounded-2xl border border-line bg-panel p-4 sm:rounded-3xl sm:p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Restaurant</p>
      <h2 className="font-display mt-1 text-2xl sm:text-4xl">Settings</h2>
      <p className="mt-1 text-sm text-muted">These details print on every guest bill.</p>
      <div className="mt-5 space-y-3">
        <input
          value={form.restaurantName}
          onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
          placeholder="Restaurant name"
          className="w-full rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
          required
        />
        <input
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Address"
          className="w-full rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
        />
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
          className="w-full rounded-2xl border border-line bg-bg px-3 text-sm outline-none"
        />
        <label className="block text-sm text-muted">
          GST / tax %
          <input
            type="number"
            min="0"
            max="100"
            value={form.taxPercent}
            onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
            className="mt-1 w-full rounded-2xl border border-line bg-bg px-3 text-ink outline-none"
          />
        </label>
      </div>
      {error ? <p className="mt-3 text-sm text-rose">{error}</p> : null}
      {saved ? <p className="mt-3 text-sm text-mint">Saved. New bills will use these details.</p> : null}
      <button type="submit" disabled={pending} className="mt-5 rounded-2xl bg-gold px-5 text-sm font-semibold text-white">
        {pending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
