const RateLimit = require('../models/RateLimit');
const { HttpError } = require('./http');

// Client IP (Vercel and most proxies put the real one first in X-Forwarded-For).
function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

// Counts one hit for `key`; throws 429 once `limit` is exceeded inside the window.
async function hit(key, { limit, windowMs }, message = 'Too many requests. Please try again later.') {
  const now = new Date();
  let doc = await RateLimit.findOneAndUpdate({ _id: key, resetAt: { $gt: now } }, { $inc: { count: 1 } }, { new: true });
  if (!doc) {
    doc = await RateLimit.findOneAndUpdate(
      { _id: key },
      { $set: { count: 1, resetAt: new Date(now.getTime() + windowMs) } },
      { new: true, upsert: true }
    );
  }
  if (doc.count > limit) {
    const minutes = Math.max(1, Math.ceil((doc.resetAt.getTime() - now.getTime()) / 60000));
    const err = new HttpError(429, `${message} Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`);
    err.retryAfter = Math.ceil((doc.resetAt.getTime() - now.getTime()) / 1000);
    throw err;
  }
}

const rateLimit = (name, opts, message) => async (req, res, next) => {
  try {
    await hit(`${name}:${clientIp(req)}`, opts, message);
    next();
  } catch (err) {
    if (err.retryAfter) res.set('Retry-After', String(err.retryAfter));
    next(err);
  }
};

module.exports = { clientIp, hit, rateLimit };
