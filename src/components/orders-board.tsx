"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { payOrder, voidOrder } from "@/lib/actions";
import { clock, money, statusLabel, typeLabel } from "@/lib/format";
import { restaurantDayKey } from "@/lib/time";
import type { Order, OrderStatus } from "@/lib/types";

export function OrdersBoard({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const todayKey = restaurantDayKey();
  const [day, setDay] = useState(todayKey);
  const [allDays, setAllDays] = useState(false);
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [error, setError] = useState("");

  const rows = useMemo(() => {
    return orders.filter((order) => {
      const dayOk = allDays || restaurantDayKey(order.createdAt) === day;
      const statusOk = status === "all" || order.status === status;
      return dayOk && statusOk;
    });
  }, [orders, allDays, day, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Bills</p>
          <h2 className="font-display mt-1 text-2xl sm:text-4xl">Order history</h2>
          <p className="mt-1 text-sm text-muted">
            {allDays ? "All dates" : day === todayKey ? "Today" : day} · {rows.length}{" "}
            {rows.length === 1 ? "bill" : "bills"}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto">
          <label className="flex h-11 items-center gap-2 rounded-2xl border border-line bg-panel px-3 text-sm text-ink">
            <CalendarDays size={16} className="shrink-0 text-gold" />
            <span className="sr-only">Filter by date</span>
            <input
              type="date"
              value={day}
              max={todayKey}
              onChange={(event) => {
                const next = event.target.value;
                if (!next) return;
                setDay(next);
                setAllDays(false);
              }}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDay(todayKey);
                setAllDays(false);
              }}
              className={`h-11 rounded-full px-4 text-sm ${
                !allDays && day === todayKey ? "bg-gold text-white" : "bg-panel text-muted"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setAllDays(true)}
              className={`h-11 rounded-full px-4 text-sm ${allDays ? "bg-gold text-white" : "bg-panel text-muted"}`}
            >
              All
            </button>
            {(["all", "open", "paid", "void"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`h-11 rounded-full px-4 text-sm capitalize ${
                  status === value ? "bg-panel-2 text-ink" : "text-muted"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>
      {error ? <p className="text-sm text-rose">{error}</p> : null}

      <section className="rounded-2xl border border-line bg-panel p-3 sm:rounded-3xl sm:p-5">
        <div className="space-y-3 md:hidden">
          {rows.length === 0 ? (
            <p className="py-6 text-sm text-muted">No bills in this filter.</p>
          ) : (
            rows.map((order) => (
              <article key={order.id} className="rounded-2xl bg-panel-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/orders/${order.id}`} className="font-medium text-gold-2">
                      {order.billNo}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {clock(order.createdAt)} · {order.lines.length} items
                    </p>
                    <p className="text-xs text-muted">
                      {typeLabel[order.type]}
                      {order.tableName ? ` · ${order.tableName}` : ""} · {statusLabel[order.status]}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium">{money(order.total)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/orders/${order.id}/print`}
                    className="rounded-xl bg-white px-3 py-2 text-sm text-gold-2"
                  >
                    Print
                  </Link>
                  {order.status === "open" ? (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const result = await payOrder(order.id, "cash");
                            if (!result.ok) setError(result.error);
                            router.refresh();
                          })
                        }
                        className="rounded-xl bg-white px-3 py-2 text-sm disabled:opacity-40"
                      >
                        Cash
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            const result = await voidOrder(order.id);
                            if (!result.ok) setError(result.error);
                            router.refresh();
                          })
                        }
                        className="rounded-xl bg-white px-3 py-2 text-sm text-rose disabled:opacity-40"
                      >
                        Void
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3 font-medium">Bill</th>
                <th className="pb-3 font-medium">When</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Total</th>
                <th className="pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-muted">
                    No bills in this filter.
                  </td>
                </tr>
              ) : (
                rows.map((order) => (
                  <tr key={order.id} className="border-t border-line">
                    <td className="py-3">
                      <Link href={`/orders/${order.id}`} className="text-gold-2 hover:underline">
                        {order.billNo}
                      </Link>
                      <p className="text-xs text-muted">{order.lines.length} items</p>
                    </td>
                    <td className="py-3 text-muted">{clock(order.createdAt)}</td>
                    <td className="py-3">
                      {typeLabel[order.type]}
                      {order.tableName ? ` · ${order.tableName}` : ""}
                    </td>
                    <td className="py-3">{statusLabel[order.status]}</td>
                    <td className="py-3 text-right">{money(order.total)}</td>
                    <td className="py-3 text-right">
                      <Link href={`/orders/${order.id}/print`} className="mr-3 text-gold-2 hover:underline">
                        Print
                      </Link>
                      {order.status === "open" ? (
                        <>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              start(async () => {
                                const result = await payOrder(order.id, "cash");
                                if (!result.ok) setError(result.error);
                                router.refresh();
                              })
                            }
                            className="mr-3 hover:underline disabled:opacity-40"
                          >
                            Cash
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() =>
                              start(async () => {
                                const result = await voidOrder(order.id);
                                if (!result.ok) setError(result.error);
                                router.refresh();
                              })
                            }
                            className="text-rose hover:underline disabled:opacity-40"
                          >
                            Void
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
