const { HttpError } = require('./http');

// Rules for new passwords (sign-up, admin-created accounts, password changes).
// Existing passwords keep working; the rules only apply when a password is set.
function assertStrongPassword(password, { username, email } = {}) {
  const pw = String(password || '');
  const problems = [];
  if (pw.length < 8) problems.push('be at least 8 characters');
  if (pw.length > 128) problems.push('be at most 128 characters');
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) problems.push('include letters and numbers');
  if (problems.length) throw new HttpError(400, `Password must ${problems.join(' and ')}.`);

  const lower = pw.toLowerCase();
  const bad = [username, email && String(email).split('@')[0]].filter(Boolean).map((v) => String(v).toLowerCase());
  if (bad.some((v) => v.length >= 3 && lower.includes(v))) {
    throw new HttpError(400, 'Password must not contain your username or email.');
  }
}

module.exports = { assertStrongPassword };
