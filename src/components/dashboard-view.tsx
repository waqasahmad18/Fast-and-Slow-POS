import Link from "next/link";
import { AlertTriangle, Banknote, CreditCard, ReceiptText, Users } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { dishImage } from "@/lib/dishes";
import { clock, money, statusLabel, typeLabel } from "@/lib/format";
import type { DayStats } from "@/lib/stats";
import type { MenuItem, Order, Table } from "@/lib/types";

export function DashboardView({
  restaurantName,
  stats,
  lowStock,
  occupied,
  recent,
  openOrders,
}: {
  restaurantName: string;
  stats: DayStats;
  lowStock: MenuItem[];
  occupied: Table[];
  recent: Order[];
  openOrders: Order[];
}) {
  const peak = Math.max(...stats.hourly, 1);
  const cards = [
    { label: "Today sales", value: money(stats.revenue), hint: `${stats.paidBills} paid bills` },
    { label: "Average bill", value: money(stats.avgTicket), hint: `${stats.itemsSold} items sold` },
    { label: "Tax collected", value: money(stats.tax), hint: "Included in totals" },
    { label: "Open tables", value: String(occupied.length), hint: `${stats.openBills} unpaid bills` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="hidden md:block">
            <BrandMark tone="light" />
          </div>
          <h2 className="font-display text-2xl break-words sm:text-4xl md:mt-4">{restaurantName}</h2>
          <p className="mt-1 text-sm text-muted sm:text-base">Today’s floor, sales, and stock — quick plates, slow cooking.</p>
        </div>
        <Link href="/pos" className="inline-flex w-full items-center justify-center rounded-2xl bg-gold px-5 py-3 text-sm font-semibold text-white sm:w-auto">
          New bill
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-line bg-panel p-3 sm:rounded-[28px] sm:p-5">
            <p className="text-xs text-muted sm:text-sm">{card.label}</p>
            <p className="mt-2 font-display text-xl sm:text-3xl">{card.value}</p>
            <p className="mt-2 text-[11px] text-muted sm:text-xs">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-line bg-panel p-3 sm:rounded-[28px] sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-xl sm:text-2xl">Hourly sales</h3>
            <div className="flex flex-wrap gap-3 text-xs text-muted sm:text-sm">
              <span className="inline-flex items-center gap-1">
                <Banknote size={14} className="text-mint" /> {money(stats.cash)} cash
              </span>
              <span className="inline-flex items-center gap-1">
                <CreditCard size={14} className="text-gold" /> {money(stats.card)} card
              </span>
            </div>
          </div>
          <div className="mt-6 flex h-40 items-end gap-1">
            {stats.hourly.map((value, hour) => (
              <div key={hour} className="flex h-full flex-1 flex-col justify-end">
                <div
                  className="rounded-t bg-gold/80"
                  style={{ height: `${Math.max(4, (value / peak) * 100)}%` }}
                  title={`${hour}:00 · ${money(value)}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-panel p-3 sm:rounded-[28px] sm:p-5">
          <h3 className="font-display text-xl sm:text-2xl">Top dishes</h3>
          <div className="mt-4 space-y-3">
            {stats.topItems.length === 0 ? (
              <p className="text-sm text-muted">No paid sales yet today.</p>
            ) : (
              stats.topItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dishImage({ name: item.name })}
                      alt={item.name}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        <span className="mr-2 text-gold">{index + 1}.</span>
                        {item.name}
                      </p>
                      <p className="text-xs text-muted">{item.qty} sold</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm text-gold-2">{money(item.sales)}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-line bg-panel p-3 sm:rounded-[28px] sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl sm:text-2xl">Open bills</h3>
            <Users size={18} className="text-gold" />
          </div>
          <div className="mt-4 space-y-2">
            {openOrders.length === 0 ? (
              <p className="text-sm text-muted">No held tables right now.</p>
            ) : (
              openOrders.map((order) => (
                <Link
                  key={order.id}
                  href="/pos"
                  className="flex items-center justify-between rounded-2xl bg-panel-2 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {order.billNo} · {order.tableName ?? typeLabel[order.type]}
                    </p>
                    <p className="text-xs text-muted">{clock(order.createdAt)}</p>
                  </div>
                  <p className="text-gold-2">{money(order.total)}</p>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-line bg-panel p-3 sm:rounded-[28px] sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl sm:text-2xl">Low stock</h3>
            <AlertTriangle size={18} className="text-rose" />
          </div>
          <div className="mt-4 space-y-2">
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted">All active items are above the alert line.</p>
            ) : (
              lowStock.map((item) => (
                <Link
                  key={item.id}
                  href="/inventory"
                  className="flex items-center justify-between rounded-2xl bg-panel-2 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={dishImage(item)} alt={item.name} className="h-11 w-11 rounded-xl object-cover" />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted">Alert at {item.lowStockAt}</p>
                    </div>
                  </div>
                  <p className="text-rose">
                    {item.stock} {item.unit}
                  </p>
                </Link>
              ))
            )}
          </div>
        </article>
      </section>

      <article className="rounded-2xl border border-line bg-panel p-3 sm:rounded-[28px] sm:p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl sm:text-2xl">Recent bills</h3>
          <ReceiptText size={18} className="text-gold" />
        </div>
        <div className="mt-4 space-y-2 md:hidden">
          {recent.length === 0 ? (
            <p className="py-4 text-sm text-muted">No bills yet. Open POS to start the day.</p>
          ) : (
            recent.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl bg-panel-2 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-gold-2">{order.billNo}</p>
                  <p className="text-sm">{money(order.total)}</p>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {clock(order.createdAt)} · {typeLabel[order.type]}
                  {order.tableName ? ` · ${order.tableName}` : ""} · {statusLabel[order.status]}
                </p>
              </Link>
            ))
          )}
        </div>
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3 font-medium">Bill</th>
                <th className="pb-3 font-medium">When</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-muted">
                    No bills yet. Open POS to start the day.
                  </td>
                </tr>
              ) : (
                recent.map((order) => (
                  <tr key={order.id} className="border-t border-line">
                    <td className="py-3">
                      <Link href={`/orders/${order.id}`} className="text-gold-2 hover:underline">
                        {order.billNo}
                      </Link>
                    </td>
                    <td className="py-3 text-muted">{clock(order.createdAt)}</td>
                    <td className="py-3">
                      {typeLabel[order.type]}
                      {order.tableName ? ` · ${order.tableName}` : ""}
                    </td>
                    <td className="py-3">{statusLabel[order.status]}</td>
                    <td className="py-3 text-right">{money(order.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
