// Security settings. Each one can be changed with an environment variable.
const num = (name, fallback) => {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

module.exports = {
  // Signed out after this many minutes without activity (sliding session).
  SESSION_IDLE_MS: num('SESSION_IDLE_MINUTES', 30) * 60 * 1000,
  // Signed out this many hours after signing in, even if active.
  SESSION_MAX_MS: num('SESSION_MAX_HOURS', 12) * 60 * 60 * 1000,
  // Failed sign-ins before the account is locked, and for how long.
  LOGIN_MAX_ATTEMPTS: num('LOGIN_MAX_ATTEMPTS', 5),
  LOGIN_LOCK_MS: num('LOGIN_LOCK_MINUTES', 15) * 60 * 1000,
  // Per-IP limits (counted in MongoDB so they work across serverless instances).
  LOGIN_IP_LIMIT: { limit: num('LOGIN_IP_LIMIT', 20), windowMs: 15 * 60 * 1000 },
  REGISTER_IP_LIMIT: { limit: num('REGISTER_IP_LIMIT', 10), windowMs: 60 * 60 * 1000 },
  PASSWORD_IP_LIMIT: { limit: 10, windowMs: 15 * 60 * 1000 },
};
