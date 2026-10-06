'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Lets each page put its title in the shell's top bar and turn on the
// ⌘K search pill (which then filters that page's table, like the mockup roster).
const PageContext = createContext(null);

export function PageProvider({ children }) {
  const [meta, setMeta] = useState({ title: '', subtitle: '', search: null });
  const [query, setQuery] = useState('');
  const pathname = usePathname();
  useEffect(() => setQuery(''), [pathname]);
  return <PageContext.Provider value={{ meta, setMeta, query, setQuery }}>{children}</PageContext.Provider>;
}

export const usePageContext = () => useContext(PageContext);

export function usePage({ title, subtitle = '', search = null }) {
  const ctx = useContext(PageContext);
  const { setMeta } = ctx;
  useEffect(() => {
    setMeta({ title, subtitle, search });
  }, [setMeta, title, subtitle, search]);
  useEffect(() => () => setMeta({ title: '', subtitle: '', search: null }), [setMeta]);
  return ctx.query;
}
