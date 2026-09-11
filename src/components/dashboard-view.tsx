import Link from "next/link";
import { AlertTriangle, Banknote, Bike, CreditCard, ReceiptText, ShoppingBag, Users, UtensilsCrossed } from "lucide-react";
import { DashboardDateFilter } from "@/components/dashboard-date-filter";
import { dishImage } from "@/lib/dishes";
import { clock, money, statusLabel, typeLabel } from "@/lib/format";
import type { DayStats } from "@/lib/stats";
import type { MenuItem, Order, Table } from "@/lib/types";

export function DashboardView({
  restaurantName,
  dayKey,
  todayKey,
  stats,
  lowStock,
  occupied,
  dayOrders,
  openOrders,
}: {
  restaurantName: string;
  dayKey: string;
  todayKey: string;
  stats: DayStats;
  lowStock: MenuItem[];
  occupied: Table[];
  dayOrders: Order[];
  openOrders: Order[];
}) {
  const isToday = dayKey === todayKey;
  const mixTotal = stats.revenue + stats.unpaidTotal + stats.voidTotal;
  const payTotal = stats.cash + stats.card;
  const typeMax = Math.max(...stats.byType.map((row) => row.paidAmount), 1);
  const typeIcons = {
    "dine-in": UtensilsCrossed,
    takeaway: ShoppingBag,
    delivery: Bike,
  } as const;
  const cards = [
    {
      label: isToday ? "Today sales" : "Paid sales",
      value: money(stats.revenue),
      hint: `${stats.paidBills} paid bills`,
    },
    {
      label: "Unpaid",
      value: money(stats.unpaidTotal),
      hint: `${stats.openBills} open bills`,
    },
    {
      label: "Tax collected",
      value: money(stats.tax),
      hint: `${stats.itemsSold} items sold`,
    },
    {
      label: "Average bill",
      value: money(stats.avgTicket),
      hint: isToday ? `${occupied.length} tables busy` : `${stats.voidBills} void bills`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Overview</p>
          <h2 className="font-display text-2xl leading-tight sm:text-3xl">{restaurantName}</h2>
        </div>
        <Link
          href="/pos"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-gold px-4 text-sm font-semibold text-white"
        >
          New bill
        </Link>
      </div>

      <DashboardDateFilter day={dayKey} today={todayKey} />

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
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl sm:text-2xl">Day mix</h3>
              <p className="mt-1 text-sm text-muted">Paid, open, and cancelled bills for this date</p>
            </div>
          </div>

          {mixTotal === 0 ? (
            <p className="mt-6 text-sm text-muted">No bills on this date.</p>
          ) : (
            <>
              <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-panel-2">
                {stats.revenue > 0 ? (
                  <div className="bg-mint" style={{ width: `${(stats.revenue / mixTotal) * 100}%` }} />
                ) : null}
                {stats.unpaidTotal > 0 ? (
                  <div className="bg-gold" style={{ width: `${(stats.unpaidTotal / mixTotal) * 100}%` }} />
                ) : null}
                {stats.voidTotal > 0 ? (
                  <div className="bg-rose" style={{ width: `${(stats.voidTotal / mixTotal) * 100}%` }} />
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Paid", amount: stats.revenue, count: stats.paidBills, className: "text-mint" },
                  { label: "Unpaid", amount: stats.unpaidTotal, count: stats.openBills, className: "text-gold-2" },
                  { label: "Void", amount: stats.voidTotal, count: stats.voidBills, className: "text-rose" },
                ].map((row) => (
                  <div key={row.label} className="rounded-2xl bg-panel-2 px-4 py-3">
                    <p className={`text-xs font-medium ${row.className}`}>{row.label}</p>
                    <p className="mt-1 font-display text-xl">{money(row.amount)}</p>
                    <p className="mt-1 text-xs text-muted">
                      {row.count} {row.count === 1 ? "bill" : "bills"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium">Payments</p>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-panel-2">
                  {payTotal === 0 ? null : (
                    <>
                      {stats.cash > 0 ? (
                        <div className="bg-mint" style={{ width: `${(stats.cash / payTotal) * 100}%` }} />
                      ) : null}
                      {stats.card > 0 ? (
                        <div className="bg-gold" style={{ width: `${(stats.card / payTotal) * 100}%` }} />
                      ) : null}
                    </>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <Banknote size={16} className="text-mint" />
                    {money(stats.cash)} cash
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CreditCard size={16} className="text-gold" />
                    {money(stats.card)} card
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium">Order types</p>
                {stats.byType.map((row) => {
                  const Icon = typeIcons[row.type];
                  return (
                    <div key={row.type}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="inline-flex min-w-0 items-center gap-2">
                          <Icon size={16} className="shrink-0 text-gold" />
                          {typeLabel[row.type]}
                        </span>
                        <span className="shrink-0 font-medium">{money(row.paidAmount)}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-panel-2">
                        <div
                          className="h-full rounded-full bg-gold/80"
                          style={{ width: `${(row.paidAmount / typeMax) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {row.paidBills} paid
                        {row.openBills ? ` · ${row.openBills} open` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </article>

        <article className="rounded-2xl border border-line bg-panel p-3 sm:rounded-[28px] sm:p-5">
          <h3 className="font-display text-xl sm:text-2xl">Top dishes</h3>
          <div className="mt-4 space-y-3">
            {stats.topItems.length === 0 ? (
              <p className="text-sm text-muted">No paid sales on this date.</p>
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
              <p className="text-sm text-muted">No open bills on this date.</p>
            ) : (
              openOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
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
          <h3 className="font-display text-xl sm:text-2xl">Bills this day</h3>
          <ReceiptText size={18} className="text-gold" />
        </div>
        <div className="mt-4 space-y-2 md:hidden">
          {dayOrders.length === 0 ? (
            <p className="py-4 text-sm text-muted">No bills on this date.</p>
          ) : (
            dayOrders.map((order) => (
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
              {dayOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-muted">
                    No bills on this date.
                  </td>
                </tr>
              ) : (
                dayOrders.map((order) => (
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
