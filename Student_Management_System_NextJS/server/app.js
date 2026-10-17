const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { requireAuth, requireRole } = require('./middleware/auth');

// The Express API. It is not started with app.listen(); Next.js serves it from
// pages/api/[...path].js, so it runs as a Vercel serverless function on the same
// domain as the frontend (the httpOnly auth cookie stays first-party).
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);

// API responses are never cached and never framed.
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');
  next();
});

// CSRF defence (on top of the SameSite cookie): state-changing requests must come
// from this site and send JSON, which a cross-site HTML form cannot do.
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
app.use('/api', (req, res, next) => {
  if (!UNSAFE.has(req.method)) return next();
  const origin = req.headers.origin;
  if (origin) {
    let originHost;
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = '';
    }
    const hosts = [req.headers['x-forwarded-host'], req.headers.host].filter(Boolean).map((h) => String(h).split(',')[0].trim());
    if (!hosts.includes(originHost)) return res.status(403).json({ message: 'Cross-site request blocked.' });
  }
  const hasBody = Number(req.headers['content-length'] || 0) > 0 || req.headers['transfer-encoding'];
  if (hasBody && !req.is('application/json')) return res.status(415).json({ message: 'Requests must be sent as JSON.' });
  return next();
});

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// Strips MongoDB operators ($gt, $where, …) and dotted keys from user input so they
// can never reach a query (NoSQL injection).
const scrub = (value, depth = 0) => {
  if (depth > 10 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value)
      .filter(([k]) => !k.startsWith('$') && !k.includes('.') && k !== '__proto__' && k !== 'constructor' && k !== 'prototype')
      .map(([k, v]) => [k, scrub(v, depth + 1)])
  );
};
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') req.body = scrub(req.body);
  if (req.query && typeof req.query === 'object') req.query = scrub(req.query);
  next();
});

if (process.env.NODE_ENV === 'production' && String(process.env.JWT_SECRET || '').length < 32) {
  console.warn('[security] JWT_SECRET is shorter than 32 characters. Use a long random value in production.');
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Make sure config is present and MongoDB is connected before any route runs.
// The connection is cached, so warm serverless invocations reuse it.
app.use('/api', async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set.');
    await connectDB();
    return next();
  } catch (err) {
    return next(err);
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', requireAuth, require('./routes/profile'));
app.use('/api/admin', requireAuth, requireRole('admin'), require('./routes/admin'));
app.use('/api/teacher', requireAuth, requireRole('teacher'), require('./routes/teacher'));
app.use('/api/student', requireAuth, requireRole('student'), require('./routes/student'));

app.use('/api', (req, res) => res.status(404).json({ message: 'Not found' }));

// error-500.jsp equivalent
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request is too large.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON.' });
  if (err.status) return res.status(err.status).json({ message: err.message });
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first ? first.message : 'Some fields are invalid.' });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'value';
    return res.status(409).json({ message: `That ${field} is already in use.` });
  }
  console.error(err);
  return res.status(500).json({ message: 'Something went wrong on the server. Please try again.' });
});

module.exports = app;
