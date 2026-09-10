"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { payOrder, voidOrder } from "@/lib/actions";
import { clock, money, statusLabel, typeLabel } from "@/lib/format";
import { isSameDay } from "@/lib/stats";
import type { Order, OrderStatus } from "@/lib/types";

export function OrdersBoard({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [scope, setScope] = useState<"today" | "all">("today");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [error, setError] = useState("");

  const rows = useMemo(() => {
    return orders.filter((order) => {
      const dayOk = scope === "all" || isSameDay(order.createdAt);
      const statusOk = status === "all" || order.status === status;
      return dayOk && statusOk;
    });
  }, [orders, scope, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Bills</p>
          <h2 className="font-display mt-1 text-2xl sm:text-4xl">Order history</h2>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          {(["today", "all"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              className={`rounded-full px-4 text-sm capitalize ${scope === value ? "bg-gold text-white" : "bg-panel text-muted"}`}
            >
              {value}
            </button>
          ))}
          {(["all", "open", "paid", "void"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`rounded-full px-4 text-sm capitalize ${status === value ? "bg-panel-2 text-ink" : "text-muted"}`}
            >
              {value}
            </button>
          ))}
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
