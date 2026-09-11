import type { Order, StoreData } from "./types";
import { restaurantDayKey, restaurantHour } from "./time";

export function startOfDay(date = new Date()) {
  return new Date(`${restaurantDayKey(date)}T00:00:00+05:00`);
}

export function isSameDay(iso: string, date = new Date()) {
  return restaurantDayKey(iso) === restaurantDayKey(date);
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
    hourly[restaurantHour(order.paidAt ?? order.createdAt)] += order.total;
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
