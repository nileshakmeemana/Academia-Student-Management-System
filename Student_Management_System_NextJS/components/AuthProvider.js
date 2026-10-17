'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { broadcastLogout, setExpiresAt } from '@/lib/session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { user: me, session: s } = await api('/auth/me');
      setUser(me);
      setSession(s);
      if (s?.expiresAt) setExpiresAt(s.expiresAt);
      return me;
    } catch {
      setUser(null);
      return null;
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // reason: 'logout' (button), 'timeout' (idle), 'expired', 'all' (every device)
  const logout = useCallback(async (reason = 'logout') => {
    try {
      await api(reason === 'all' ? '/auth/logout-all' : '/auth/logout', { method: 'POST' });
    } catch {
      /* already signed out */
    } finally {
      setUser(null);
      broadcastLogout(reason);
      window.location.href = `/login?message=${reason}`;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, session, ready, refresh, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
