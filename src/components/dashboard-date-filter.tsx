"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { shiftRestaurantDay } from "@/lib/time";

export function DashboardDateFilter({ day, today }: { day: string; today: string }) {
  const router = useRouter();
  const yesterday = shiftRestaurantDay(today, -1);

  function go(next: string) {
    router.push(next === today ? "/" : `/?date=${next}`);
  }

  const chip = (active: boolean) =>
    `h-8 rounded-full px-3 text-xs font-medium ${active ? "bg-gold text-white" : "text-muted hover:bg-white"}`;

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-line bg-panel px-2 py-1.5">
      <button type="button" onClick={() => go(today)} className={chip(day === today)}>
        Today
      </button>
      <button type="button" onClick={() => go(yesterday)} className={chip(day === yesterday)}>
        Yesterday
      </button>
      <label className="ml-auto flex h-8 min-w-[9.5rem] items-center gap-1.5 rounded-xl bg-panel-2 px-2 text-xs text-ink">
        <CalendarDays size={14} className="shrink-0 text-gold" />
        <span className="sr-only">Pick a date</span>
        <input
          type="date"
          value={day}
          max={today}
          onChange={(event) => {
            const next = event.target.value;
            if (next) go(next);
          }}
          className="min-w-0 flex-1 bg-transparent text-xs outline-none"
        />
      </label>
    </div>
  );
}
