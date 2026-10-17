'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Dialog in the mockup's style: white panel, 2xl shadow, blurred dark overlay.
// Rendered through a portal; scroll is locked on both <html> and <body>.
export default function Modal({ open, title, subtitle, onClose, size = 'max-w-lg', children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const html = document.documentElement;
    const prev = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    panelRef.current?.querySelector('input:not([type=hidden]):not([readonly]), select, textarea')?.focus();
    return () => {
      [html.style.overflow, document.body.style.overflow] = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-[4px] flex items-start justify-center overflow-y-auto px-4 py-10 sm:py-16"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={title} className={`w-full ${size} bg-white rounded-xl shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-200">
          <div className="space-y-1 min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 -mr-2 -mt-1 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-500 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
