'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { btnClass } from './styles';
import { api } from '@/lib/api';
import { getExpiresAt, subscribe } from '@/lib/session';

const WARN_MS = 2 * 60 * 1000; // show the warning 2 minutes before sign-out
const TICK_MS = 1000;
const ACTIVITY = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
const KEEPALIVE_EVERY_MS = 60 * 1000; // extend at most once a minute while active

const fmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Idle timeout: activity keeps the session alive (the server slides the cookie),
// a warning appears 2 minutes before it ends, and every tab signs out together.
export default function SessionGuard() {
  const { user, session, logout } = useAuth();
  const [remaining, setRemaining] = useState(null);
  const [warning, setWarning] = useState(false);
  const lastActivity = useRef(Date.now());
  const lastKeepAlive = useRef(Date.now());
  const busy = useRef(false);
  const stayRef = useRef(null);
  const warningRef = useRef(false);

  const keepAlive = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    lastKeepAlive.current = Date.now();
    try {
      await api('/auth/refresh', { method: 'POST' });
    } catch {
      /* a 401 here is handled by the expiry check below */
    } finally {
      busy.current = false;
    }
  }, []);

  // Track real user activity (not timers or background requests).
  useEffect(() => {
    if (!user) return undefined;
    const onActivity = () => {
      lastActivity.current = Date.now();
    };
    ACTIVITY.forEach((e) => window.addEventListener(e, onActivity, { passive: true, capture: true }));
    return () => ACTIVITY.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }));
  }, [user]);

  // Another tab signed out -> leave too.
  useEffect(() => {
    if (!user) return undefined;
    return subscribe({
      onLogout: (reason) => {
        window.location.href = `/login?message=${reason === 'timeout' ? 'timeout' : 'logout'}`;
      },
    });
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    const tick = () => {
      const now = Date.now();
      const exp = getExpiresAt();
      if (!exp) return;
      const left = exp - now;
      setRemaining(left);

      if (left <= 0) {
        logout('timeout');
        return;
      }
      const absolute = session?.absoluteExpiresAt;
      const canExtend = !absolute || absolute - now > WARN_MS;
      const activeRecently = lastActivity.current > lastKeepAlive.current;

      // Active user: push the deadline forward (throttled), and always before the
      // warning would appear, so people who are working never see it.
      const nearWarning = left <= WARN_MS + 5000;
      if (!warningRef.current && canExtend && activeRecently && (nearWarning || now - lastKeepAlive.current > KEEPALIVE_EVERY_MS)) {
        keepAlive();
        return;
      }
      const show = left <= WARN_MS;
      warningRef.current = show;
      setWarning(show);
    };
    tick();
    const id = setInterval(tick, TICK_MS);
    const unsub = subscribe({ onChange: tick });
    return () => {
      clearInterval(id);
      unsub();
    };
  }, [user, session, logout, keepAlive]);

  useEffect(() => {
    if (warning) stayRef.current?.focus();
  }, [warning]);

  if (!user || !warning || remaining == null || typeof document === 'undefined') return null;

  const absolute = session?.absoluteExpiresAt;
  const final = absolute && absolute - Date.now() <= WARN_MS + 1000;

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-[4px] flex items-center justify-center px-4">
      <div role="alertdialog" aria-modal="true" aria-labelledby="session-title" aria-describedby="session-desc" className="w-full max-w-[400px] bg-white rounded-xl shadow-2xl p-6">
        <span className="w-12 h-12 rounded-full bg-amber-50 ring-8 ring-amber-50/60 text-amber-600 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </span>
        <h2 id="session-title" className="mt-4 text-lg font-semibold text-slate-900">
          {final ? 'Your session is ending' : 'Are you still there?'}
        </h2>
        <p id="session-desc" className="mt-1 text-sm text-slate-600">
          {final
            ? 'For security, sessions end after a while even when active. Save your work — you will need to sign in again in'
            : 'For your security, you will be signed out after a period of inactivity. Signing out in'}{' '}
          <span className="font-semibold text-slate-900 tabular-nums">{fmt(remaining)}</span>.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => logout('logout')} className={btnClass('secondary')}>Sign out</button>
          {final ? (
            <button type="button" onClick={() => logout('expired')} className={btnClass('primary')}>Sign in again</button>
          ) : (
            <button
              ref={stayRef}
              type="button"
              onClick={() => {
                lastActivity.current = Date.now();
                keepAlive().then(() => {
                  warningRef.current = false;
                  setWarning(false);
                });
              }}
              className={btnClass('primary')}
            >
              Stay signed in
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
