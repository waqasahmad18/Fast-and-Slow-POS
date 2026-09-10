import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB ?? "fast_and_slow_pos";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

function connect() {
  if (!globalForMongo.mongoClientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });
    globalForMongo.mongoClientPromise = client.connect();
  }
  return globalForMongo.mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  try {
    const client = await connect();
    return client.db(dbName);
  } catch {
    globalForMongo.mongoClientPromise = undefined;
    throw new Error("MongoDB is not running. Start it with npm run db:start, then restart the app.");
  }
}
