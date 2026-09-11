import type { Order, StoreData } from "./types";
import { restaurantDayKey, restaurantHour } from "./time";

export function startOfDay(date = new Date()) {
  return new Date(`${restaurantDayKey(date)}T00:00:00+05:00`);
}

export function isSameDay(iso: string, date = new Date()) {
  return restaurantDayKey(iso) === restaurantDayKey(date);
}

export function todayOrders(orders: Order[], date: Date | string = new Date()) {
  const dayKey = typeof date === "string" ? date : restaurantDayKey(date);
  return orders.filter((order) => order.status !== "void" && restaurantDayKey(order.createdAt) === dayKey);
}

export type DayStats = {
  bills: number;
  openBills: number;
  paidBills: number;
  voidBills: number;
  itemsSold: number;
  revenue: number;
  unpaidTotal: number;
  tax: number;
  avgTicket: number;
  cash: number;
  card: number;
  hourly: number[];
  topItems: { name: string; qty: number; sales: number }[];
};

export function computeDayStats(orders: Order[], date: Date | string = new Date()): DayStats {
  const dayKey = typeof date === "string" ? date : restaurantDayKey(date);
  const allDay = orders.filter((order) => restaurantDayKey(order.createdAt) === dayKey);
  const paid = allDay.filter((order) => order.status === "paid");
  const open = allDay.filter((order) => order.status === "open");
  const revenue = paid.reduce((sum, order) => sum + order.total, 0);
  const unpaidTotal = open.reduce((sum, order) => sum + order.total, 0);
  const tax = paid.reduce((sum, order) => sum + order.tax, 0);
  const cash = paid
    .filter((order) => order.paymentMethod === "cash")
    .reduce((sum, order) => sum + order.total, 0);
  const card = paid
    .filter((order) => order.paymentMethod === "card")
    .reduce((sum, order) => sum + order.total, 0);
  const itemsSold = paid.reduce(
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
    bills: allDay.length,
    openBills: open.length,
    paidBills: paid.length,
    voidBills: allDay.filter((order) => order.status === "void").length,
    itemsSold,
    revenue,
    unpaidTotal,
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
