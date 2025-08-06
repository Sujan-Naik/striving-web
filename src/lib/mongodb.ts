import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI!

let cached = (global as typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function dbConnect() {
  if (cached!.conn) {
    return cached!.conn
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri)
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    cached!.promise = null
    throw e
  }

  return cached!.conn
}

export default dbConnect