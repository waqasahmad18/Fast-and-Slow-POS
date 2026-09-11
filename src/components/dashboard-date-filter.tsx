"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";

export function DashboardDateFilter({ day, today }: { day: string; today: string }) {
  const router = useRouter();

  function go(next: string) {
    router.push(next === today ? "/" : `/?date=${next}`);
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <label className="flex h-11 items-center gap-2 rounded-2xl border border-line bg-panel px-3 text-sm text-ink">
        <CalendarDays size={16} className="shrink-0 text-gold" />
        <span className="sr-only">Dashboard date</span>
        <input
          type="date"
          value={day}
          max={today}
          onChange={(event) => {
            const next = event.target.value;
            if (next) go(next);
          }}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </label>
      <button
        type="button"
        onClick={() => go(today)}
        className={`h-11 rounded-full px-4 text-sm ${day === today ? "bg-gold text-white" : "bg-panel text-muted"}`}
      >
        Today
      </button>
    </div>
  );
}
