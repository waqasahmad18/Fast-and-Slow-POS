import { promises as fs } from "fs";
import path from "path";
import type { AnyBulkWriteOperation, Document, Filter } from "mongodb";
import { DEFAULT_DISH_IMAGES, dishImage } from "./dishes";
import { tryGetDb } from "./mongo";
import type { MenuItem, Order, StockMove, StoreData, Table } from "./types";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "restaurant-pos")
  : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

let backend: "mongo" | "file" | null = null;

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
let ready: Promise<void> | null = null;

function migrate(data: StoreData): StoreData {
  if (!data.address) data.address = "Main Boulevard, Lahore";
  if (!data.phone) data.phone = "0300-1234567";
  if (!data.restaurantName || data.restaurantName === "Al Noor Restaurant") {
    data.restaurantName = "Fast and Slow Restaurant";
  }
  for (const item of data.menu) {
    if (!item.image?.trim()) item.image = dishImage(item);
  }
  return data;
}

function withoutMongoId<T extends { id: string }>(doc: T & { _id?: unknown }): T {
  const { _id: _unused, ...rest } = doc;
  void _unused;
  return rest as T;
}

async function loadLegacyJson(): Promise<StoreData | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return migrate(JSON.parse(raw) as StoreData);
  } catch {
    return null;
  }
}

async function persistFile(data: StoreData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function resolveBackend() {
  if (backend) return backend;
  const db = await tryGetDb();
  if (process.env.VERCEL) {
    if (!db) {
      throw new Error(
        "Set MONGODB_URI in Vercel to your MongoDB Atlas mongodb+srv:// connection string, then Redeploy."
      );
    }
    backend = "mongo";
    return backend;
  }
  backend = db ? "mongo" : "file";
  return backend;
}

const byId = (id: string) => ({ _id: id }) as unknown as Filter<Document>;

async function syncCollection<T extends { id: string }>(
  name: "menu" | "tables" | "orders" | "stockMoves",
  items: T[]
) {
  const db = await tryGetDb();
  if (!db) throw new Error("MongoDB unavailable.");
  const col = db.collection(name);
  const ids = items.map((item) => item.id);
  if (ids.length) {
    await col.deleteMany({ _id: { $nin: ids } } as unknown as Filter<Document>);
    await col.bulkWrite(
      items.map((item) => ({
        replaceOne: {
          filter: byId(item.id),
          replacement: { ...item },
          upsert: true,
        },
      })) as AnyBulkWriteOperation<Document>[]
    );
    return;
  }
  await col.deleteMany({});
}

async function persist(data: StoreData) {
  if ((await resolveBackend()) === "file") {
    await persistFile(data);
    return;
  }
  await persistMongo(data);
}

async function persistMongo(data: StoreData) {
  const db = await tryGetDb();
  if (!db) {
    backend = "file";
    await persistFile(data);
    return;
  }
  await db.collection("settings").updateOne(
    byId("main"),
    {
      $set: {
        restaurantName: data.restaurantName,
        address: data.address,
        phone: data.phone,
        taxRate: data.taxRate,
      },
    },
    { upsert: true }
  );
  await syncCollection("menu", data.menu);
  await syncCollection("tables", data.tables);
  await syncCollection("orders", data.orders);
  await syncCollection("stockMoves", data.stockMoves);
}

async function ensureIndexes() {
  const db = await tryGetDb();
  if (!db) return;
  await Promise.all([
    db.collection("orders").createIndex({ createdAt: -1 }),
    db.collection("orders").createIndex({ status: 1 }),
    db.collection("stockMoves").createIndex({ createdAt: -1 }),
  ]);
}

async function bootstrap() {
  if ((await resolveBackend()) === "file") {
    const existing = await loadLegacyJson();
    if (!existing) await persistFile(seed());
    return;
  }

  const db = await tryGetDb();
  if (!db) {
    if (process.env.VERCEL) {
      throw new Error(
        "Set MONGODB_URI in Vercel to your MongoDB Atlas mongodb+srv:// connection string, then Redeploy."
      );
    }
    backend = "file";
    const existing = await loadLegacyJson();
    if (!existing) await persistFile(seed());
    return;
  }

  const settings = await db.collection("settings").findOne(byId("main"));
  if (!settings) {
    await persistMongo((await loadLegacyJson()) ?? seed());
  }
  await ensureIndexes();
}

function ensureReady() {
  if (!ready) ready = bootstrap();
  return ready;
}

async function readMongo(): Promise<StoreData | null> {
  const db = await tryGetDb();
  if (!db) return null;

  const [settings, menu, tables, orders, stockMoves] = await Promise.all([
    db.collection("settings").findOne(byId("main")),
    db.collection("menu").find().toArray(),
    db.collection("tables").find().toArray(),
    db.collection("orders").find().sort({ createdAt: -1 }).toArray(),
    db.collection("stockMoves").find().sort({ createdAt: -1 }).toArray(),
  ]);

  if (!settings) {
    const data = seed();
    await persist(data);
    return data;
  }

  return migrate({
    restaurantName: String(settings.restaurantName ?? "Fast and Slow Restaurant"),
    address: String(settings.address ?? ""),
    phone: String(settings.phone ?? ""),
    taxRate: Number(settings.taxRate ?? 0.05),
    menu: menu.map((item) => withoutMongoId(item as MenuItem & { _id?: unknown })),
    tables: tables.map((item) => withoutMongoId(item as Table & { _id?: unknown })),
    orders: orders.map((item) => withoutMongoId(item as Order & { _id?: unknown })),
    stockMoves: stockMoves.map((item) => withoutMongoId(item as StockMove & { _id?: unknown })),
  });
}

async function readStore(): Promise<StoreData> {
  await ensureReady();
  if ((await resolveBackend()) === "mongo") {
    const fromMongo = await readMongo();
    if (fromMongo) return fromMongo;
    if (process.env.VERCEL) {
      throw new Error("Could not read POS data from MongoDB Atlas.");
    }
    backend = "file";
  }
  return (await loadLegacyJson()) ?? seed();
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
    await persist(data);
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
