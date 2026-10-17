const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { SESSION_IDLE_MS, SESSION_MAX_MS } = require('../config/security');

const COOKIE = 'sms_token';
const ALG = 'HS256';
// Re-issue the cookie at most once a minute while the user is active.
const REFRESH_AFTER_MS = 60 * 1000;

const secret = () => process.env.JWT_SECRET;

// Session info the browser uses for the idle-timeout warning.
function sessionInfo(payload) {
  return {
    expiresAt: payload.exp * 1000,
    absoluteExpiresAt: payload.auth * 1000 + SESSION_MAX_MS,
    idleMs: SESSION_IDLE_MS,
  };
}

// Signs a token that expires after SESSION_IDLE_MS. `auth` (sign-in time) is kept
// across refreshes so the absolute SESSION_MAX_MS limit can be enforced.
function issueToken(res, user, authTime = Math.floor(Date.now() / 1000)) {
  const now = Date.now();
  const idleExp = now + SESSION_IDLE_MS;
  const maxExp = authTime * 1000 + SESSION_MAX_MS;
  const exp = Math.floor(Math.min(idleExp, maxExp) / 1000);
  const payload = { sub: String(user._id), role: user.role, sv: user.sessionVersion || 0, auth: authTime, exp };
  const token = jwt.sign(payload, secret(), { algorithm: ALG });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Math.max(0, exp * 1000 - now),
    path: '/',
  });
  res.set('X-Session-Expires', String(exp * 1000));
  return sessionInfo(payload);
}

function clearToken(res) {
  res.clearCookie(COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  res.set('X-Session-Expires', '0');
}

const unauthorized = (res, message, reason) => {
  clearToken(res);
  return res.status(401).json({ message, reason });
};

// Equivalent of the servlet session check: no valid token -> 401.
// Every authenticated request slides the idle timeout forward.
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[COOKIE];
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.', reason: 'signed_out' });

    let payload;
    try {
      payload = jwt.verify(token, secret(), { algorithms: [ALG] });
    } catch (err) {
      return unauthorized(res, 'Your session has expired. Please sign in again.', 'expired');
    }

    if (!payload.auth || Date.now() > payload.auth * 1000 + SESSION_MAX_MS) {
      return unauthorized(res, 'Your session has expired. Please sign in again.', 'expired');
    }

    const user = await User.findById(payload.sub);
    if (!user) return unauthorized(res, 'Your account no longer exists.', 'revoked');
    if ((user.sessionVersion || 0) !== payload.sv || user.role !== payload.role) {
      return unauthorized(res, 'You were signed out. Please sign in again.', 'revoked');
    }

    req.user = user;
    req.session = { auth: payload.auth };
    const issuedMs = payload.exp * 1000 - SESSION_IDLE_MS;
    if (Date.now() - issuedMs > REFRESH_AFTER_MS) {
      req.sessionInfo = issueToken(res, user, payload.auth);
    } else {
      req.sessionInfo = sessionInfo(payload);
      res.set('X-Session-Expires', String(payload.exp * 1000));
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have access to this page.' });
  }
  return next();
};

module.exports = { COOKIE, issueToken, clearToken, requireAuth, requireRole, sessionInfo };
