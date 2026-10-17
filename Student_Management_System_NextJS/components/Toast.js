'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';

// Bottom-right notification in the mockup's style (white card, coloured icon ring).
const ToastContext = createContext(() => {});

const KIND = {
  ok: [CircleCheck, 'text-emerald-600 bg-emerald-50 ring-emerald-100'],
  info: [Info, 'text-brand-600 bg-brand-50 ring-brand-100'],
  error: [CircleAlert, 'text-rose-600 bg-rose-50 ring-rose-100'],
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ text: '', kind: 'ok', visible: false });
  const timer = useRef(null);

  const show = useCallback((text, kind = 'ok') => {
    clearTimeout(timer.current);
    setToast({ text, kind, visible: true });
    timer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), kind === 'error' ? 5000 : 3000);
  }, []);

  const [Icon, tone] = KIND[toast.kind] || KIND.ok;

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[90] transform transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'
        }`}
        role={toast.kind === 'error' ? 'alert' : 'status'}
        aria-live="polite"
      >
        <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 pr-10 flex items-center gap-3 text-sm sm:max-w-sm relative">
          <span className={`w-8 h-8 rounded-full ring-4 flex items-center justify-center shrink-0 ${tone}`}>
            <Icon className="w-4 h-4" />
          </span>
          <span className="font-semibold text-slate-900">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast((t) => ({ ...t, visible: false }))}
            className="absolute top-2 right-2 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-500"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
