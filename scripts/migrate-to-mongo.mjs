import { readFile } from "fs/promises";
import path from "path";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "fast_and_slow_pos";
const file = path.join(process.cwd(), "data", "store.json");

function docs(items) {
  return items.map((item) => ({ ...item, _id: item.id }));
}

const raw = JSON.parse(await readFile(file, "utf8"));
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });
await client.connect();
const db = client.db(dbName);

await db.collection("settings").replaceOne(
  { _id: "main" },
  {
    _id: "main",
    restaurantName: raw.restaurantName,
    address: raw.address,
    phone: raw.phone,
    taxRate: raw.taxRate,
  },
  { upsert: true }
);

for (const [name, items] of [
  ["menu", raw.menu],
  ["tables", raw.tables],
  ["orders", raw.orders],
  ["stockMoves", raw.stockMoves],
]) {
  await db.collection(name).deleteMany({});
  if (items.length) await db.collection(name).insertMany(docs(items));
}

const counts = {
  settings: await db.collection("settings").countDocuments(),
  menu: await db.collection("menu").countDocuments(),
  tables: await db.collection("tables").countDocuments(),
  orders: await db.collection("orders").countDocuments(),
  stockMoves: await db.collection("stockMoves").countDocuments(),
};

console.log("Migrated POS data into MongoDB", counts);
await client.close();
