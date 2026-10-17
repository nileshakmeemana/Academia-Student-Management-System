const mongoose = require('mongoose');

// Fixed-window counters for rate limiting ("login:1.2.3.4" -> count until resetAt).
// MongoDB removes expired documents through the TTL index.
const rateLimitSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    count: { type: Number, default: 0 },
    resetAt: { type: Date, required: true },
  },
  { versionKey: false }
);
rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RateLimit', rateLimitSchema);
