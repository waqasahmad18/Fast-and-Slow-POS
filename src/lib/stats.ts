import type { Order, StoreData } from "./types";

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(iso: string, date = new Date()) {
  const a = new Date(iso);
  const b = startOfDay(date);
  const c = new Date(b);
  c.setDate(c.getDate() + 1);
  return a >= b && a < c;
}

export function todayOrders(orders: Order[], date = new Date()) {
  return orders.filter((order) => order.status !== "void" && isSameDay(order.createdAt, date));
}

export type DayStats = {
  bills: number;
  openBills: number;
  paidBills: number;
  itemsSold: number;
  revenue: number;
  tax: number;
  avgTicket: number;
  cash: number;
  card: number;
  hourly: number[];
  topItems: { name: string; qty: number; sales: number }[];
};

export function computeDayStats(orders: Order[], date = new Date()): DayStats {
  const day = todayOrders(orders, date);
  const paid = day.filter((order) => order.status === "paid");
  const open = day.filter((order) => order.status === "open");
  const revenue = paid.reduce((sum, order) => sum + order.total, 0);
  const tax = paid.reduce((sum, order) => sum + order.tax, 0);
  const cash = paid
    .filter((order) => order.paymentMethod === "cash")
    .reduce((sum, order) => sum + order.total, 0);
  const card = paid
    .filter((order) => order.paymentMethod === "card")
    .reduce((sum, order) => sum + order.total, 0);
  const itemsSold = day.reduce(
    (sum, order) => sum + order.lines.reduce((n, line) => n + line.qty, 0),
    0
  );

  const hourly = Array.from({ length: 24 }, () => 0);
  for (const order of paid) {
    hourly[new Date(order.paidAt ?? order.createdAt).getHours()] += order.total;
  }

  const itemMap = new Map<string, { name: string; qty: number; sales: number }>();
  for (const order of paid) {
    for (const line of order.lines) {
      const prev = itemMap.get(line.name) ?? { name: line.name, qty: 0, sales: 0 };
      prev.qty += line.qty;
      prev.sales += line.price * line.qty;
      itemMap.set(line.name, prev);
    }
  }

  const topItems = [...itemMap.values()].sort((a, b) => b.sales - a.sales).slice(0, 6);

  return {
    bills: day.length,
    openBills: open.length,
    paidBills: paid.length,
    itemsSold,
    revenue,
    tax,
    avgTicket: paid.length ? Math.round(revenue / paid.length) : 0,
    cash,
    card,
    hourly,
    topItems,
  };
}

export function lowStockItems(data: StoreData) {
  return data.menu.filter((item) => item.active && item.stock <= item.lowStockAt);
}
