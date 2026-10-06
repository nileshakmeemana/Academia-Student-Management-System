'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

// The mockup's bottom-right toast (#toastNotification), driven from React.
const ToastContext = createContext(() => {});

const ICON = {
  ok: ['w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold', '✓'],
  info: ['w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold', 'i'],
  error: ['w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold', '!'],
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ text: '', kind: 'ok', visible: false });
  const timer = useRef(null);

  const show = useCallback((text, kind = 'ok') => {
    clearTimeout(timer.current);
    setToast({ text, kind, visible: true });
    timer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), kind === 'error' ? 5000 : 3000);
  }, []);

  const [iconCls, glyph] = ICON[toast.kind] || ICON.ok;

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className={`fixed bottom-6 right-6 z-[90] transform transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
        role={toast.kind === 'error' ? 'alert' : 'status'}
        aria-live="polite"
      >
        <div className="bg-[#1e2229] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs border border-slate-700 max-w-sm">
          <div className={`${iconCls} shrink-0`}>{glyph}</div>
          <div className="font-semibold">{toast.text}</div>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
