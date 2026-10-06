const mongoose = require('mongoose');
require('./dns');

// Serverless functions are reused between requests, so keep one connection per
// instance on the global object instead of reconnecting on every call.
const cached = global.__smsMongoose || (global.__smsMongoose = { conn: null, promise: null });

async function connectDB(uri = process.env.MONGO_URI) {
  if (cached.conn) return cached.conn;
  if (!uri) throw new Error('MONGO_URI is not set.');
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10000 })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}/${m.connection.name}`);
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
