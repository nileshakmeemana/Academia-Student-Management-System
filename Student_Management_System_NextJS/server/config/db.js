const mongoose = require('mongoose');
const { isSrvLookupError, resolveSrvUri } = require('./dns');

// Serverless functions are reused between requests, so keep one connection per
// instance on the global object instead of reconnecting on every call.
const cached = global.__smsMongoose || (global.__smsMongoose = { conn: null, promise: null, uri: null });

const OPTIONS = { bufferCommands: false, serverSelectionTimeoutMS: 10000 };

async function open(uri) {
  try {
    return await mongoose.connect(cached.uri || uri, OPTIONS);
  } catch (err) {
    // mongodb+srv:// needs SRV/TXT DNS lookups, which some networks block.
    // Resolve the cluster another way and connect with a plain mongodb:// URI.
    if (!cached.uri && uri.startsWith('mongodb+srv://') && isSrvLookupError(err)) {
      cached.uri = await resolveSrvUri(uri);
      return mongoose.connect(cached.uri, OPTIONS);
    }
    throw err;
  }
}

async function connectDB(uri = process.env.MONGO_URI) {
  if (cached.conn) return cached.conn;
  if (!uri) throw new Error('MONGO_URI is not set.');
  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = open(uri)
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
