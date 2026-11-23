import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Falta la variable MONGODB_URI en .env.local');
}

interface CacheMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongoose: CacheMongoose | undefined;
}

const cached: CacheMongoose = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function conectarBD() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}