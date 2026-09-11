import { getStore } from "./store";
import { computeDayStats, lowStockItems } from "./stats";
import { restaurantDayKey } from "./time";

export async function loadPosData() {
  const data = await getStore();
  return {
    restaurantName: data.restaurantName,
    taxRate: data.taxRate,
    menu: data.menu.filter((item) => item.active),
    tables: data.tables,
    orders: data.orders,
  };
}

export async function loadDashboard(dayKey?: string) {
  const data = await getStore();
  const day = dayKey ?? restaurantDayKey();
  const dayOrders = data.orders.filter((order) => restaurantDayKey(order.createdAt) === day);
  return {
    restaurantName: data.restaurantName,
    dayKey: day,
    todayKey: restaurantDayKey(),
    stats: computeDayStats(data.orders, day),
    lowStock: lowStockItems(data),
    occupied: data.tables.filter((table) => table.status === "occupied"),
    dayOrders,
    openOrders: dayOrders.filter((order) => order.status === "open"),
  };
}

export async function loadMenu() {
  const data = await getStore();
  return data.menu;
}

export async function loadInventory() {
  const data = await getStore();
  return {
    menu: data.menu,
    stockMoves: data.stockMoves.slice(0, 50),
  };
}

export async function loadOrders() {
  const data = await getStore();
  return data.orders;
}

export async function loadSettings() {
  const data = await getStore();
  return {
    restaurantName: data.restaurantName,
    address: data.address,
    phone: data.phone,
    taxRate: data.taxRate,
  };
}

export async function getOrder(id: string) {
  const data = await getStore();
  return data.orders.find((order) => order.id === id) ?? null;
}

export async function getBillContext(id: string) {
  const data = await getStore();
  const order = data.orders.find((item) => item.id === id) ?? null;
  if (!order) return null;
  return {
    order,
    restaurantName: data.restaurantName,
    address: data.address,
    phone: data.phone,
  };
}

export async function getRestaurantName() {
  const data = await getStore();
  return data.restaurantName;
}
