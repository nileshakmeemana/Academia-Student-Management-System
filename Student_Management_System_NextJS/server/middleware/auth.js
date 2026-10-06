const jwt = require('jsonwebtoken');
const { User } = require('../models');

const COOKIE = 'sms_token';

function issueToken(res, user) {
  const token = jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function clearToken(res) {
  res.clearCookie(COOKIE, { path: '/' });
}

// Equivalent of the servlet session check: no valid token -> 401.
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE];
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) {
      clearToken(res);
      return res.status(401).json({ message: 'Your account no longer exists.' });
    }
    req.user = user;
    return next();
  } catch {
    clearToken(res);
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have access to this page.' });
  }
  return next();
};

module.exports = { COOKIE, issueToken, clearToken, requireAuth, requireRole };
