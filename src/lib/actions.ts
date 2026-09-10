"use server";

import { revalidatePath } from "next/cache";
import { dishImage } from "./dishes";
import { addMove, findItem, nextBillNo, saveStore } from "./store";
import type { OrderLine, OrderType, PaymentMethod, StoreData } from "./types";

function refresh() {
  revalidatePath("/", "layout");
}

function fail(error: unknown) {
  return {
    ok: false as const,
    error: error instanceof Error ? error.message : "Something went wrong.",
  };
}

function mergeLines(lines: { itemId: string; qty: number }[]) {
  const qty = new Map<string, number>();
  for (const line of lines) {
    if (line.qty < 1) throw new Error("Invalid quantity.");
    qty.set(line.itemId, (qty.get(line.itemId) ?? 0) + line.qty);
  }
  return qty;
}

function toOrderLines(data: StoreData, qty: Map<string, number>): OrderLine[] {
  return [...qty.entries()].map(([itemId, count]) => {
    const item = findItem(data, itemId);
    if (!item) throw new Error("Menu item missing.");
    return { itemId: item.id, name: item.name, qty: count, price: item.price };
  });
}

function applyStockDelta(data: StoreData, oldLines: OrderLine[], newLines: OrderLine[]) {
  const oldQty = new Map(oldLines.map((line) => [line.itemId, line.qty]));
  const newQty = new Map(newLines.map((line) => [line.itemId, line.qty]));
  const ids = new Set([...oldQty.keys(), ...newQty.keys()]);

  for (const id of ids) {
    const item = findItem(data, id);
    if (!item) throw new Error("Menu item missing.");
    const delta = (newQty.get(id) ?? 0) - (oldQty.get(id) ?? 0);
    if (delta === 0) continue;
    if (delta > 0 && item.stock < delta) {
      throw new Error(`${item.name} has only ${item.stock} left.`);
    }
    item.stock -= delta;
    addMove(data, {
      itemId: item.id,
      itemName: item.name,
      qty: -delta,
      reason: delta > 0 ? "sale" : "void",
    });
  }
}

function totals(lines: OrderLine[], taxRate: number) {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const tax = Math.round(subtotal * taxRate);
  return { subtotal, tax, total: subtotal + tax };
}

export async function checkout(input: {
  orderId?: string | null;
  type: OrderType;
  tableId: string | null;
  note: string;
  paymentMethod: PaymentMethod | null;
  lines: { itemId: string; qty: number }[];
}) {
  if (!input.lines.length) return { ok: false as const, error: "Cart is empty." };
  if (input.type === "dine-in" && !input.tableId && !input.paymentMethod) {
    return { ok: false as const, error: "Select a table to hold a dine-in order." };
  }

  try {
    let orderId = "";

    await saveStore((data) => {
      const qty = mergeLines(input.lines);
      const lines = toOrderLines(data, qty);
      const existing = input.orderId
        ? data.orders.find((order) => order.id === input.orderId) ?? null
        : null;

      if (existing && existing.status !== "open") {
        throw new Error("This bill is already closed.");
      }

      const { subtotal, tax, total } = totals(lines, data.taxRate);
      const table = input.tableId
        ? data.tables.find((item) => item.id === input.tableId) ?? null
        : null;
      if (table && table.status === "occupied" && existing?.tableId !== table.id) {
        const other = data.orders.find((order) => order.status === "open" && order.tableId === table.id);
        if (other) throw new Error(`${table.name} already has ${other.billNo}.`);
      }
      const now = new Date().toISOString();
      const paid = Boolean(input.paymentMethod);

      applyStockDelta(data, existing?.lines ?? [], lines);

      if (existing?.tableId && existing.tableId !== table?.id) {
        const prev = data.tables.find((item) => item.id === existing.tableId);
        if (prev) prev.status = "free";
      }

      if (existing) {
        existing.type = input.type;
        existing.tableId = table?.id ?? null;
        existing.tableName = table?.name ?? null;
        existing.lines = lines;
        existing.note = input.note.trim();
        existing.subtotal = subtotal;
        existing.taxRate = data.taxRate;
        existing.tax = tax;
        existing.total = total;
        existing.status = paid ? "paid" : "open";
        existing.paymentMethod = input.paymentMethod;
        existing.paidAt = paid ? now : null;
        orderId = existing.id;
      } else {
        const order = {
          id: `ord-${Date.now()}`,
          billNo: nextBillNo(data.orders),
          type: input.type,
          tableId: table?.id ?? null,
          tableName: table?.name ?? null,
          status: paid ? ("paid" as const) : ("open" as const),
          lines,
          note: input.note.trim(),
          subtotal,
          taxRate: data.taxRate,
          tax,
          total,
          paymentMethod: input.paymentMethod,
          createdAt: now,
          paidAt: paid ? now : null,
        };
        data.orders.unshift(order);
        orderId = order.id;
      }

      if (table) table.status = paid ? "free" : "occupied";
    });

    refresh();
    return { ok: true as const, orderId };
  } catch (error) {
    return fail(error);
  }
}

export async function payOrder(orderId: string, paymentMethod: PaymentMethod) {
  try {
    await saveStore((data) => {
      const order = data.orders.find((item) => item.id === orderId);
      if (!order) throw new Error("Bill not found.");
      if (order.status !== "open") throw new Error("This bill is already closed.");
      order.status = "paid";
      order.paymentMethod = paymentMethod;
      order.paidAt = new Date().toISOString();
      if (order.tableId) {
        const table = data.tables.find((item) => item.id === order.tableId);
        if (table) table.status = "free";
      }
    });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function voidOrder(orderId: string) {
  try {
    await saveStore((data) => {
      const order = data.orders.find((item) => item.id === orderId);
      if (!order) throw new Error("Bill not found.");
      if (order.status === "void") throw new Error("Bill is already void.");
      applyStockDelta(data, order.lines, []);
      order.status = "void";
      order.paymentMethod = null;
      order.paidAt = null;
      if (order.tableId) {
        const table = data.tables.find((item) => item.id === order.tableId);
        if (table) table.status = "free";
      }
    });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function receiveStock(itemId: string, qty: number) {
  if (qty < 1) return { ok: false as const, error: "Quantity must be at least 1." };

  try {
    await saveStore((data) => {
      const item = findItem(data, itemId);
      if (!item) throw new Error("Item not found.");
      item.stock += qty;
      addMove(data, {
        itemId: item.id,
        itemName: item.name,
        qty,
        reason: "purchase",
      });
    });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function adjustStock(itemId: string, stock: number) {
  if (stock < 0) return { ok: false as const, error: "Stock cannot be negative." };

  try {
    await saveStore((data) => {
      const item = findItem(data, itemId);
      if (!item) throw new Error("Item not found.");
      const delta = stock - item.stock;
      item.stock = stock;
      if (delta !== 0) {
        addMove(data, {
          itemId: item.id,
          itemName: item.name,
          qty: delta,
          reason: "adjust",
        });
      }
    });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function upsertMenuItem(input: {
  id?: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  lowStockAt: number;
  image?: string;
}) {
  if (!input.name.trim() || input.price < 0) {
    return { ok: false as const, error: "Name and a valid price are required." };
  }

  try {
    await saveStore((data) => {
      if (input.id) {
        const item = findItem(data, input.id);
        if (!item) throw new Error("Item not found.");
        item.name = input.name.trim();
        item.category = input.category.trim() || "General";
        item.price = input.price;
        item.stock = input.stock;
        item.unit = input.unit || "pcs";
        item.lowStockAt = input.lowStockAt;
        item.image = input.image?.trim() || dishImage(item);
        return;
      }

      const next = {
        id: `m-${Date.now()}`,
        name: input.name.trim(),
        category: input.category.trim() || "General",
        price: input.price,
        stock: input.stock,
        unit: input.unit || "pcs",
        lowStockAt: input.lowStockAt,
        active: true,
        image: "",
      };
      next.image = input.image?.trim() || dishImage(next);
      data.menu.push(next);
    });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function toggleMenuItem(id: string) {
  try {
    await saveStore((data) => {
      const item = findItem(data, id);
      if (!item) throw new Error("Item not found.");
      item.active = !item.active;
    });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}

export async function updateSettings(input: {
  restaurantName: string;
  address: string;
  phone: string;
  taxRate: number;
}) {
  if (!input.restaurantName.trim()) {
    return { ok: false as const, error: "Restaurant name is required." };
  }
  if (input.taxRate < 0 || input.taxRate > 1) {
    return { ok: false as const, error: "Tax rate must be between 0 and 100%." };
  }

  try {
    await saveStore((data) => {
      data.restaurantName = input.restaurantName.trim();
      data.address = input.address.trim();
      data.phone = input.phone.trim();
      data.taxRate = input.taxRate;
    });
    refresh();
    return { ok: true as const };
  } catch (error) {
    return fail(error);
  }
}
