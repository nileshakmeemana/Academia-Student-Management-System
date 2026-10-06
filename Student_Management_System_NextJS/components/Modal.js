'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Dialog built from the mockup's sign-in card (rounded-card-lg, shadow-float).
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
      className="fixed inset-0 z-[70] bg-slate-900/30 backdrop-blur-sm flex items-start justify-center overflow-y-auto px-4 py-10 sm:py-16"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={title} className={`w-full ${size} bg-white rounded-card-lg p-7 sm:p-8 shadow-float space-y-6`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
