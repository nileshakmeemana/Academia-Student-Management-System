const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { requireAuth, requireRole } = require('./middleware/auth');

// The Express API. It is not started with app.listen(); Next.js serves it from
// pages/api/[...path].js, so it runs as a Vercel serverless function on the same
// domain as the frontend (the httpOnly auth cookie stays first-party).
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

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
