// db.js
const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  global.mongoose = { conn: null, promise: null };
  cached = global.mongoose;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
      throw new Error('DATABASE or DATABASE_PASSWORD environment variable is missing on Vercel.');
    }

    const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Fail after 5s instead of hanging for 10s
    };

    cached.promise = mongoose.connect(DB, opts).then(() => {
      console.log('MongoDB connected successfully!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e.message);
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
