const router = require('express').Router();
const { User } = require('../models');
const { asyncHandler, HttpError, isBlank } = require('../utils/http');
const { issueToken, clearToken, requireAuth } = require('../middleware/auth');
const { createAccount } = require('../services/people');
const { rateLimit } = require('../utils/rateLimit');
const { LOGIN_MAX_ATTEMPTS, LOGIN_LOCK_MS, LOGIN_IP_LIMIT, REGISTER_IP_LIMIT } = require('../config/security');

const lockedMessage = (until) => {
  const minutes = Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
  return `Too many failed sign-in attempts. This account is locked for ${minutes} more minute${minutes === 1 ? '' : 's'}.`;
};

// LoginServlet — with per-IP rate limiting and per-account lockout.
router.post(
  '/login',
  rateLimit('login', LOGIN_IP_LIMIT, 'Too many sign-in attempts from this network.'),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (isBlank(username) || isBlank(password)) throw new HttpError(400, 'Enter your username and password.');

    // Accepts the username or the account email.
    const login = String(username).trim();
    const query = login.includes('@') ? { email: login.toLowerCase() } : { username: login };
    const user = await User.findOne(query).select('+password +failedLogins +lockUntil');

    if (!user) {
      await User.fakePasswordCheck(password);
      throw new HttpError(401, 'Invalid username or password');
    }
    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new HttpError(429, lockedMessage(user.lockUntil));
    }

    if (!(await user.checkPassword(password))) {
      const failed = (user.failedLogins || 0) + 1;
      if (failed >= LOGIN_MAX_ATTEMPTS) {
        const until = new Date(Date.now() + LOGIN_LOCK_MS);
        await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lockUntil: until } });
        throw new HttpError(429, lockedMessage(until));
      }
      await User.updateOne({ _id: user._id }, { $set: { failedLogins: failed } });
      const left = LOGIN_MAX_ATTEMPTS - failed;
      throw new HttpError(401, `Invalid username or password${left <= 2 ? ` (${left} attempt${left === 1 ? '' : 's'} left before the account is locked)` : ''}`);
    }

    await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lockUntil: null, lastLoginAt: new Date() } });
    const session = issueToken(res, user);
    res.json({ user: user.toSafeJSON(), session });
  })
);

// RegisterServlet (students and teachers only, like the original role dropdown)
router.post(
  '/register',
  rateLimit('register', REGISTER_IP_LIMIT, 'Too many accounts created from this network.'),
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!['student', 'teacher'].includes(role)) throw new HttpError(400, 'All fields are required');
    await createAccount(req.body, role);
    res.status(201).json({ message: 'Registration successful. Please login.' });
  })
);

// LogoutServlet
router.post('/logout', (req, res) => {
  clearToken(res);
  res.json({ message: 'You have been signed out.' });
});

// Signs out every device by invalidating all existing tokens.
router.post(
  '/logout-all',
  requireAuth,
  asyncHandler(async (req, res) => {
    await User.updateOne({ _id: req.user._id }, { $inc: { sessionVersion: 1 } });
    clearToken(res);
    res.json({ message: 'You have been signed out on all devices.' });
  })
);

// Current user + session timing (requireAuth also slides the idle timeout).
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON(), session: req.sessionInfo });
});

// "Stay signed in" from the timeout warning: always issues a fresh idle window.
router.post('/refresh', requireAuth, (req, res) => {
  const session = issueToken(res, req.user, req.session.auth);
  res.json({ session });
});

module.exports = router;
