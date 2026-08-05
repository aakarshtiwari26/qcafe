import mongoose from "mongoose";
import { env } from "@/config/env";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
if (!global.__mongooseCache) {
  global.__mongooseCache = cache;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.MONGODB_URI, {
        maxPoolSize: 20,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 10_000,
        socketTimeoutMS: 45_000,
      })
      .then((m) => m);
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
