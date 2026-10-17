// Session expiry shared between the API wrapper, the idle-timeout guard and other tabs.
const KEY = 'sms_session_expires';
const LOGOUT_KEY = 'sms_session_logout';
const EVENT = 'sms-session';

let expiresAt = 0;

const read = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) – single-tab behaviour still works */
  }
};

export function getExpiresAt() {
  if (typeof window === 'undefined') return expiresAt;
  const stored = Number(read(KEY));
  return Math.max(expiresAt, Number.isFinite(stored) ? stored : 0);
}

export function setExpiresAt(ms) {
  if (typeof window === 'undefined' || !Number.isFinite(ms)) return;
  expiresAt = ms;
  write(KEY, String(ms));
  window.dispatchEvent(new CustomEvent(EVENT, { detail: ms }));
}

// Tells every open tab to leave (used on sign-out and timeout).
export function broadcastLogout(reason) {
  expiresAt = 0;
  write(KEY, '0');
  write(LOGOUT_KEY, `${reason}:${Date.now()}`);
}

export function subscribe({ onChange, onLogout }) {
  const onStorage = (e) => {
    if (e.key === KEY) onChange?.(Number(e.newValue) || 0);
    if (e.key === LOGOUT_KEY && e.newValue) onLogout?.(e.newValue.split(':')[0]);
  };
  const onLocal = (e) => onChange?.(e.detail);
  window.addEventListener('storage', onStorage);
  window.addEventListener(EVENT, onLocal);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(EVENT, onLocal);
  };
}
