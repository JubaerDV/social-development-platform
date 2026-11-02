import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME;

if (!uri) {
  throw new Error("MONGODB_URI is missing from environment variables.");
}

if (!databaseName) {
  throw new Error("MONGODB_DB_NAME is missing from environment variables.");
}

const client = new MongoClient(uri);

let database: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (database) return database;

  await client.connect();

  database = client.db(databaseName);

  await database.command({ ping: 1 });

  console.log("MongoDB connected successfully.");

  return database;
}

export { client };
