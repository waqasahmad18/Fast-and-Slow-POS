import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB ?? "fast_and_slow_pos";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

function missingUriMessage() {
  return process.env.VERCEL
    ? "Set MONGODB_URI in Vercel to your MongoDB Atlas mongodb+srv:// connection string, then Redeploy."
    : "MongoDB is not running. Start it with npm run db:start, then restart the app.";
}

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
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
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
  } catch (error) {
    globalForMongo.mongoClientPromise = undefined;
    if (process.env.VERCEL) {
      const detail = error instanceof Error ? error.message : "Unknown MongoDB error.";
      throw new Error(`MongoDB Atlas connection failed: ${detail}`);
    }
    return null;
  }
}

export async function getDb(): Promise<Db> {
  const db = await tryGetDb();
  if (!db) throw new Error(missingUriMessage());
  return db;
}
