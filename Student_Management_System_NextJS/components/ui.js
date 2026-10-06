'use client';

// React versions of the building blocks in academia_student_management_system.html.
// Class strings are copied from the mockup; only data and behaviour are new.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoaderCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from './Toast';

export const cx = (...c) => c.filter(Boolean).join(' ');

/* ---------- shared brand logo ---------- */
export function BrandLogo({ className = 'w-36 h-auto' }) {
  return <Image src="/Logo.png" alt="Academia" width={2000} height={414} className={cx('object-contain', className)} priority />;
}

/* ---------- buttons ---------- */
const BTN = {
  // "+ New" pill
  pill: 'h-9 px-4 rounded-full bg-[#1e2229] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-subtle transition active:scale-[0.98]',
  // form submit (dark)
  dark: 'h-10 px-5 rounded-xl bg-[#1e2229] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-subtle',
  // form submit (green)
  green: 'h-10 px-5 rounded-xl bg-[#65d33a] hover:bg-[#5ec435] text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-subtle',
  // white secondary (Portal Login)
  white: 'h-10 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs shadow-subtle transition flex items-center justify-center gap-2',
  // outlined (SSO buttons)
  outline: 'h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-medium flex items-center justify-center gap-2 transition hover:bg-slate-50',
  // row actions: "Authorize" / "Review"
  rowDark: 'px-3 py-1 rounded-lg bg-[#1e2229] hover:bg-black text-white text-[11px] font-bold transition inline-flex items-center gap-1.5 whitespace-nowrap',
  rowLight: 'px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px] font-semibold transition inline-flex items-center gap-1.5 whitespace-nowrap',
  rowDanger: 'px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 text-[11px] font-semibold transition inline-flex items-center gap-1.5 whitespace-nowrap',
  // header text buttons
  ghost: 'text-xs font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-xl hover:bg-white/80 transition inline-flex items-center gap-1.5',
};

export function Button({ variant = 'dark', className, children, type = 'button', ...props }) {
  return (
    <button type={type} className={cx(BTN[variant], 'disabled:opacity-50 disabled:cursor-not-allowed', className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ variant = 'dark', className, children, ...props }) {
  return (
    <Link className={cx(BTN[variant], className)} {...props}>
      {children}
    </Link>
  );
}

/* ---------- cards ---------- */
export function Card({ className, dark = false, children }) {
  return (
    <div className={cx(dark ? 'bg-[#1e2229] text-white' : 'bg-white', 'rounded-card p-6 shadow-subtle min-w-0', className)}>
      {children}
    </div>
  );
}

// Panel header: dark icon tile + title + muted subtitle, actions on the right
export function CardHeader({ icon: Icon, title, subtitle, children, dark = false }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className={cx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', dark ? 'bg-white/10 text-white' : 'bg-[#1e2229] text-white')}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <div className="min-w-0">
          <h2 className={cx('text-sm font-bold tracking-tight truncate', dark ? 'text-white' : 'text-slate-950')}>{title}</h2>
          {subtitle && <div className="text-[11px] text-slate-400 font-medium">{subtitle}</div>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ---------- KPI cards ---------- */
export function KpiGrid({ children, cols = 4 }) {
  const map = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' };
  return <div className={cx('grid grid-cols-1 gap-4', map[cols])}>{children}</div>;
}

export function Kpi({ icon: Icon, label, value, children }) {
  return (
    <div className="bg-white rounded-card p-5 shadow-subtle flex items-center gap-4 min-w-0">
      <div className="w-10 h-10 rounded-full bg-[#1e2229] text-white flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-500 tracking-tight">{label}</div>
        {value != null && <div className="text-2xl font-extrabold text-slate-950 tracking-tight mt-0.5 truncate">{value}</div>}
        {children}
      </div>
    </div>
  );
}

export function MiniStat({ value, label, tone = 'text-emerald-700' }) {
  return (
    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-center">
      <div className={cx(tone, 'font-extrabold text-sm')}>{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

/* ---------- status micro-beacons (the mockup uses these instead of pill chips) ---------- */
const TONES = {
  emerald: ['text-emerald-700', 'bg-emerald-500'],
  blue: ['text-blue-700', 'bg-blue-500'],
  teal: ['text-teal-700', 'bg-teal-500'],
  cyan: ['text-cyan-700', 'bg-cyan-600'],
  amber: ['text-amber-700', 'bg-amber-500'],
  rose: ['text-rose-600', 'bg-rose-500'],
  slate: ['text-slate-500', 'bg-slate-400'],
};

export function Beacon({ tone = 'slate', pulse = false, children }) {
  const [text, dot] = TONES[tone] || TONES.slate;
  return (
    <span className={cx('inline-flex items-center gap-1.5 font-semibold text-[11px] whitespace-nowrap', text)}>
      <span className={cx('w-1.5 h-1.5 rounded-full shrink-0', dot, pulse && 'beacon-pulse')} />
      <span>{children}</span>
    </span>
  );
}

/* ---------- avatars ---------- */
const AVATAR_BG = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-600', 'bg-emerald-600', 'bg-teal-600', 'bg-emerald-700'];
export function Avatar({ name = '', size = 'w-6 h-6 text-[10px]', dark = false }) {
  const letter = (name.trim()[0] || '?').toUpperCase();
  const bg = dark ? 'bg-[#1e2229]' : AVATAR_BG[(name.charCodeAt(0) || 0) % AVATAR_BG.length];
  return <span className={cx(size, bg, 'rounded-full text-white font-bold flex items-center justify-center shrink-0')}>{letter}</span>;
}

export function PersonCell({ name, sub }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar name={name} />
      <div className="min-w-0">
        <div className="font-semibold text-slate-900 truncate">{name}</div>
        {sub && <div className="text-[10px] text-slate-400 truncate">{sub}</div>}
      </div>
    </div>
  );
}

export function TeacherCell({ name }) {
  if (!name) return <Beacon tone="amber">Not Assigned</Beacon>;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Avatar name={name} size="w-5 h-5 text-[9px]" dark />
      <span className="text-slate-700 truncate">{name}</span>
    </div>
  );
}

/* ---------- tables (mockup roster typography) ---------- */
export function Table({ head, children, minWidth = 640 }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full text-xs" style={{ minWidth }}>
        <thead>
          <tr className="text-[11px] font-semibold text-slate-400">
            {head.map((h, i) => {
              const label = typeof h === 'string' ? h : h.label;
              const right = typeof h === 'object' && h.right;
              return (
                <th key={i} className={cx('py-2 font-semibold whitespace-nowrap px-2 first:pl-0 last:pr-0', right ? 'text-right' : 'text-left')}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children }) {
  return <tr className="hover:bg-slate-50/60 transition">{children}</tr>;
}

export function Td({ children, className, right = false }) {
  return <td className={cx('py-2.5 px-2 first:pl-0 last:pr-0 align-middle text-slate-600', right && 'text-right', className)}>{children}</td>;
}

export function RowActions({ children }) {
  return <div className="flex items-center justify-end gap-1.5">{children}</div>;
}

export function IdChip({ children }) {
  return <span className="text-[11px] font-bold text-slate-400 tabular-nums">#{children}</span>;
}

/* ---------- list rows (mockup "approvals" list) ---------- */
export function ListRow({ icon: Icon, title, sub, href, children }) {
  const body = (
    <>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-slate-900 leading-snug">{title}</div>
          {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
        </div>
      </div>
      {children}
    </>
  );
  const cls = 'flex items-center justify-between gap-3 hover:bg-slate-50/60 p-1.5 rounded-xl transition text-xs';
  return href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

/* ---------- key/value rows ---------- */
export function KV({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-xs">
      <span className="text-slate-500 font-medium">{label}</span>
      <span className="font-semibold text-slate-900 text-right truncate">{children}</span>
    </div>
  );
}

/* ---------- bars ---------- */
export function Meter({ value, color }) {
  return (
    <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden min-w-[80px]">
      <div className={cx('h-full rounded-full transition-all', color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

// Vertical bar chart from "Peak Campus Density Today": the tallest bar is the green one.
export function BarChart({ bars, emptyLabel = 'No data yet.' }) {
  const max = Math.max(0, ...bars.map((b) => b.value));
  if (!bars.length || max === 0) return <Empty>{emptyLabel}</Empty>;
  return (
    <div className="mt-2 flex items-end justify-around h-40 px-2 gap-2 text-slate-400 text-[10px]">
      {bars.map((b) => {
        const peak = b.value === max;
        return (
          <div key={b.label} className="flex-1 max-w-[72px] flex flex-col items-center gap-2 h-full justify-end group min-w-0" title={`${b.label}: ${b.value}`}>
            <span className={cx('text-[10px] font-semibold', peak ? 'text-slate-900' : 'text-slate-400')}>{b.value}</span>
            <div
              className={cx('w-full rounded-lg transition-all', peak ? 'bg-[#52ce32] shadow-md group-hover:brightness-105' : 'bg-slate-100 group-hover:bg-slate-200')}
              style={{ height: `${Math.max(4, (b.value / max) * 86)}%` }}
            />
            <span className={cx('truncate max-w-full', peak && 'font-bold text-slate-900')}>{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- form fields (mockup input style) ---------- */
export const INPUT =
  'w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:bg-white transition read-only:text-slate-500';
export const LABEL = 'block text-xs font-semibold text-slate-700 mb-1.5';

export function Field({ label, htmlFor, className, hint, children }) {
  return (
    <div className={className}>
      <label className={LABEL} htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <div className="text-[10px] font-semibold text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

/* ---------- states ---------- */
export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-14 text-xs text-slate-400 font-medium">
      <LoaderCircle className="w-4 h-4 animate-spin" />
      {label}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="py-10 text-center text-xs text-slate-400 font-medium space-y-3 flex flex-col items-center">{children}</div>;
}

export function ErrorCard({ message }) {
  if (!message) return null;
  return (
    <div className="bg-white rounded-card p-5 shadow-subtle flex items-center gap-3 text-xs" role="alert">
      <span className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-600 flex items-center justify-center font-bold shrink-0">!</span>
      <span className="font-semibold text-slate-800">{message}</span>
    </div>
  );
}

/* ---------- helpers ---------- */
// Client-side filter that matches any visible column, like the JSP table search scripts.
export function matches(query, ...values) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;
  return values.some((v) => v != null && String(v).toLowerCase().includes(q));
}

// Success / error feedback goes through the mockup's toast.
export function useFlash() {
  const toast = useToast();
  const ok = useCallback((text) => toast(text, 'ok'), [toast]);
  const error = useCallback((text) => toast(text, 'error'), [toast]);
  return { ok, error };
}

export function useLoad(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));

  const reload = useCallback(async () => {
    if (!path) {
      setData(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const d = await api(path);
      setData(d);
      setError(null);
      return d;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}

// Inline form error (rose variant of the mockup's beacon rows)
export function FormError({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl px-3.5 py-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
      {message}
    </div>
  );
}

// Dark charcoal card list (mockup "April Student Attendance" card)
export function DarkLinks({ icon: Icon, title, items }) {
  return (
    <div className="bg-[#1e2229] text-white rounded-card p-5 shadow-subtle flex flex-col">
      <div className="flex items-center gap-2 pb-3">
        <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-xs font-bold tracking-tight text-white">{title}</h3>
      </div>
      <div className="space-y-1.5">
        {items.map(({ href, label, sub, icon: ItemIcon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition group">
            <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-slate-300 group-hover:text-white shrink-0">
              <ItemIcon className="w-3.5 h-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold text-white">{label}</span>
              {sub && <span className="block text-[10px] text-slate-400">{sub}</span>}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
