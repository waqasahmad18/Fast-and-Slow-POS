import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "fast_and_slow_pos";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

export function getMongoUri() {
  const fromEnv = process.env.MONGODB_URI?.trim() ?? "";
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL) return "";
  return "mongodb://127.0.0.1:27017";
}

export function shouldConnectMongo() {
  const uri = getMongoUri();
  if (!uri) return false;
  if (process.env.VERCEL && /localhost|127\.0\.0\.1/.test(uri)) return false;
  return true;
}

function connect(uri: string) {
  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    globalForMongo.mongoClientPromise = client.connect();
  }
  return globalForMongo.mongoClientPromise;
}

export async function tryGetDb(): Promise<Db | null> {
  if (!shouldConnectMongo()) return null;
  try {
    const client = await connect(getMongoUri());
    return client.db(dbName);
  } catch {
    globalForMongo.mongoClientPromise = undefined;
    return null;
  }
}

export async function getDb(): Promise<Db> {
  const db = await tryGetDb();
  if (!db) {
    throw new Error(
      process.env.VERCEL
        ? "Set MONGODB_URI in Vercel to your MongoDB Atlas mongodb+srv:// connection string, then Redeploy."
        : "MongoDB is not running. Start it with npm run db:start, then restart the app."
    );
  }
  return db;
}
