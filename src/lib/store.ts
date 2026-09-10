import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_DISH_IMAGES, dishImage } from "./dishes";
import type { MenuItem, Order, StockMove, StoreData, Table } from "./types";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "restaurant-pos")
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

function seed(): StoreData {
  const menu: MenuItem[] = [
    { id: "m1", name: "Chicken Karahi", category: "Karahi", price: 1450, stock: 24, unit: "servings", lowStockAt: 4, active: true, image: DEFAULT_DISH_IMAGES.m1 },
    { id: "m2", name: "Mutton Karahi", category: "Karahi", price: 2200, stock: 12, unit: "servings", lowStockAt: 3, active: true, image: DEFAULT_DISH_IMAGES.m2 },
    { id: "m3", name: "Chicken Biryani", category: "Rice", price: 650, stock: 30, unit: "plates", lowStockAt: 5, active: true, image: DEFAULT_DISH_IMAGES.m3 },
    { id: "m4", name: "Chicken Tikka", category: "BBQ", price: 780, stock: 18, unit: "plates", lowStockAt: 4, active: true, image: DEFAULT_DISH_IMAGES.m4 },
    { id: "m5", name: "Seekh Kabab", category: "BBQ", price: 520, stock: 20, unit: "plates", lowStockAt: 4, active: true, image: DEFAULT_DISH_IMAGES.m5 },
    { id: "m6", name: "Garlic Naan", category: "Bread", price: 80, stock: 80, unit: "pcs", lowStockAt: 10, active: true, image: DEFAULT_DISH_IMAGES.m6 },
    { id: "m7", name: "Plain Naan", category: "Bread", price: 40, stock: 90, unit: "pcs", lowStockAt: 10, active: true, image: DEFAULT_DISH_IMAGES.m7 },
    { id: "m8", name: "Fresh Lime", category: "Drinks", price: 150, stock: 40, unit: "glasses", lowStockAt: 8, active: true, image: DEFAULT_DISH_IMAGES.m8 },
    { id: "m9", name: "Soft Drink", category: "Drinks", price: 90, stock: 48, unit: "cans", lowStockAt: 8, active: true, image: DEFAULT_DISH_IMAGES.m9 },
    { id: "m10", name: "Kheer", category: "Dessert", price: 220, stock: 15, unit: "bowls", lowStockAt: 3, active: true, image: DEFAULT_DISH_IMAGES.m10 },
  ];

  const tables: Table[] = Array.from({ length: 10 }, (_, i) => ({
    id: `t${i + 1}`,
    name: `Table ${i + 1}`,
    seats: i < 6 ? 4 : 6,
    status: "free",
  }));

  return {
    restaurantName: "Fast and Slow Restaurant",
    address: "Main Boulevard, Lahore",
    phone: "0300-1234567",
    taxRate: 0.05,
    menu,
    tables,
    orders: [],
    stockMoves: [],
  };
}

let writeQueue: Promise<void> = Promise.resolve();

function migrate(data: StoreData): { data: StoreData; dirty: boolean } {
  let dirty = false;
  if (!data.address) {
    data.address = "Main Boulevard, Lahore";
    dirty = true;
  }
  if (!data.phone) {
    data.phone = "0300-1234567";
    dirty = true;
  }
  if (!data.restaurantName || data.restaurantName === "Al Noor Restaurant") {
    data.restaurantName = "Fast and Slow Restaurant";
    dirty = true;
  }
  for (const item of data.menu) {
    if (!item.image?.trim()) {
      item.image = dishImage(item);
      dirty = true;
    }
  }
  return { data, dirty };
}

async function readStore(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const { data, dirty } = migrate(JSON.parse(raw) as StoreData);
    if (dirty) await writeStore(data);
    return data;
  } catch {
    const data = seed();
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return data;
  }
}

async function writeStore(data: StoreData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export function withStore<T>(fn: (data: StoreData) => T | Promise<T>): Promise<T> {
  const run = writeQueue.then(async () => {
    const data = await readStore();
    return fn(data);
  });
  writeQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function getStore() {
  return withStore((data) => structuredClone(data));
}

export async function saveStore(mutator: (data: StoreData) => void) {
  return withStore(async (data) => {
    mutator(data);
    await writeStore(data);
    return structuredClone(data);
  });
}

export function nextBillNo(orders: Order[]) {
  const n = orders.length + 1;
  return `B-${String(n).padStart(4, "0")}`;
}

export function findItem(data: StoreData, id: string) {
  return data.menu.find((item) => item.id === id);
}

export function addMove(data: StoreData, move: Omit<StockMove, "id" | "createdAt">) {
  data.stockMoves.unshift({
    ...move,
    id: `sm-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  });
}
