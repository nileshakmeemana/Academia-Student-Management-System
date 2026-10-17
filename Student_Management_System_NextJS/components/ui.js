'use client';

// Building blocks in the style of academia.html (gray/brand scales, skeuomorphic
// buttons, bordered cards, tag badges). Page code only uses these exports.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, LoaderCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from './Toast';

// Plain class helpers and the logo live in ./styles so server components can use them too.
import { BrandLogo, LogoMark, btnClass, cx } from './styles';
export { BrandLogo, LogoMark, btnClass, cx };

export function Button({ variant = 'primary', className, children, type = 'button', ...props }) {
  return (
    <button type={type} className={cx(btnClass(variant), 'disabled:opacity-60 disabled:cursor-not-allowed', className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ variant = 'primary', className, children, ...props }) {
  return (
    <Link className={cx(btnClass(variant), className)} {...props}>
      {children}
    </Link>
  );
}

/* ---------- cards ---------- */
export function Card({ className, children }) {
  return <div className={cx('bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 min-w-0', className)}>{children}</div>;
}

// Icon tile from the mockup's "Start creating content" cards.
export function IconTile({ icon: Icon, size = 'w-10 h-10', className }) {
  return (
    <span className={cx(size, 'rounded-lg bg-white shadow-skeuo text-slate-700 flex items-center justify-center shrink-0', className)}>
      <Icon className="w-[18px] h-[18px]" />
    </span>
  );
}

// Card header with a divider; actions on the right.
export function CardHeader({ icon, title, subtitle, children }) {
  return (
    <div className="card-head -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-5 px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <IconTile icon={icon} />}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 truncate">{title}</h2>
          {subtitle && <div className="text-sm text-slate-600 truncate">{subtitle}</div>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

// Section heading used outside cards ("Start creating content", "Top members").
export function SectionHead({ title, subtitle, children, className }) {
  return (
    <div className={cx('flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

/* ---------- metrics ---------- */
// Big number with label (mockup "MRR" / "Total members").
export function Metric({ label, value, note, size = 'lg', children }) {
  return (
    <div className="min-w-0">
      <div className="text-13 font-medium text-slate-600">{label}</div>
      <div className="flex items-start gap-1.5 mt-1.5">
        {value != null && (
          <div className={cx('font-semibold tracking-[-0.02em] text-slate-900 tabular-nums truncate', size === 'lg' ? 'text-[30px] leading-10' : 'text-2xl leading-8')}>
            {value}
          </div>
        )}
        {note && <span className="text-13 font-medium text-emerald-600 mt-1 whitespace-nowrap">{note}</span>}
      </div>
      {children}
    </div>
  );
}

export function KpiGrid({ children, cols = 4 }) {
  const map = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' };
  return <div className={cx('grid grid-cols-1 gap-4 lg:gap-5', map[cols])}>{children}</div>;
}

export function Kpi({ icon, label, value, note, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex items-start justify-between gap-4 min-w-0">
      <Metric label={label} value={value} note={note} size="md">{children}</Metric>
      {icon && <IconTile icon={icon} size="w-9 h-9" />}
    </div>
  );
}

// Horizontal stat strip (mockup stats column at tablet width).
export function StatStrip({ items }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl border border-slate-200 shadow-xs overflow-hidden bg-slate-200 gap-px">
      {items.map((it) => (
        <div key={it.label} className="bg-white p-4 sm:p-5 min-w-0">
          <Metric label={it.label} value={it.value} note={it.note} size="md">{it.children}</Metric>
        </div>
      ))}
    </div>
  );
}

// Mockup "overview": big metric + chart on the left, a stats column on the right
// (the column becomes a bordered strip below xl, like the mockup at tablet width).
export function Overview({ metric, chart, stats }) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_224px] gap-6 xl:gap-7">
      <div className="grid grid-cols-1 md:grid-cols-[176px_minmax(0,1fr)] gap-5 md:gap-7">
        <div>{metric}</div>
        <div className="min-w-0">{chart}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 xl:content-start rounded-xl xl:rounded-none border xl:border-0 border-slate-200 shadow-xs xl:shadow-none divide-y sm:divide-y-0 sm:divide-x xl:divide-x-0 divide-slate-200 xl:gap-5">
        {stats.map((st) => (
          <div key={st.label} className="p-4 sm:p-5 xl:p-0 min-w-0">
            <Metric label={st.label} value={st.value} note={st.note} size="md">{st.children}</Metric>
          </div>
        ))}
      </div>
    </section>
  );
}

// Main column + 224px side column (mockup "content-grid")
export function ContentGrid({ main, side }) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_224px] gap-8 xl:gap-7 items-start">
      <div className="min-w-0 space-y-8">{main}</div>
      <aside className="min-w-0 space-y-8 xl:pt-0 border-t xl:border-t-0 border-slate-200 pt-6">{side}</aside>
    </section>
  );
}

// Side-column list title (mockup "Top members")
export function SideTitle({ children }) {
  return <h2 className="text-sm font-medium text-slate-900">{children}</h2>;
}

export function MiniStat({ value, label, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-lg border border-slate-200 px-3 py-2.5">
      <div className="text-13 text-slate-600">{label}</div>
      <div className={cx(tone, 'text-lg font-semibold tabular-nums mt-0.5')}>{value}</div>
    </div>
  );
}

/* ---------- badges (mockup "tag": bordered chip with a coloured dot) ---------- */
const TONES = {
  emerald: 'bg-emerald-500',
  blue: 'bg-[#2e90fa]',
  teal: 'bg-[#15b79e]',
  cyan: 'bg-[#06aed4]',
  amber: 'bg-[#f79009]',
  rose: 'bg-[#f04438]',
  brand: 'bg-brand-500',
  indigo: 'bg-[#6172f3]',
  pink: 'bg-[#ee46bc]',
  orange: 'bg-[#ef6820]',
  slate: 'bg-slate-400',
};

export function Beacon({ tone = 'slate', pulse = false, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-slate-300 bg-white shadow-xs text-13 font-medium text-slate-700 whitespace-nowrap">
      <span className={cx('w-1.5 h-1.5 rounded-full shrink-0', TONES[tone] || TONES.slate, pulse && 'beacon-pulse')} />
      <span>{children}</span>
    </span>
  );
}
export const Badge = Beacon;

/* ---------- avatars (gray circle with initials, like the mockup's fallbacks) ---------- */
export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() || '?';

export function Avatar({ name = '', size = 'w-9 h-9 text-13', online = false }) {
  return (
    <span className={cx(size, 'relative rounded-full bg-slate-100 text-slate-600 font-semibold flex items-center justify-center shrink-0 ring-1 ring-inset ring-black/[0.08]')}>
      {initials(name)}
      {online && <span className="absolute -right-px -bottom-px w-2.5 h-2.5 rounded-full bg-emerald-500 ring-[1.5px] ring-white" />}
    </span>
  );
}

export function PersonCell({ name, sub }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar name={name} />
      <div className="min-w-0">
        <div className="font-medium text-slate-900 truncate">{name}</div>
        {sub && <div className="text-slate-600 truncate">{sub}</div>}
      </div>
    </div>
  );
}

export function TeacherCell({ name }) {
  if (!name) return <Beacon tone="amber">Not assigned</Beacon>;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <Avatar name={name} size="w-6 h-6 text-[10px]" />
      <span className="text-slate-700 truncate">{name}</span>
    </div>
  );
}

/* ---------- tables (full-bleed inside a Card) ---------- */
export function Table({ head, children, minWidth = 640 }) {
  return (
    <div className="-mx-5 sm:-mx-6 last:-mb-5 sm:last:-mb-6 overflow-x-auto [.card-head+&]:-mt-5 [.card-head+&_thead_tr]:border-t-0">
      <table className="w-full text-sm" style={{ minWidth }}>
        <thead>
          <tr className="bg-slate-50 border-y border-slate-200 [&>th:first-child]:pl-5 sm:[&>th:first-child]:pl-6 [&>th:last-child]:pr-5 sm:[&>th:last-child]:pr-6">
            {head.map((h, i) => {
              const label = typeof h === 'string' ? h : h.label;
              const right = typeof h === 'object' && h.right;
              return (
                <th key={i} className={cx('py-3 px-4 text-xs font-medium text-slate-600 whitespace-nowrap', right ? 'text-right' : 'text-left')}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors [&>td:first-child]:pl-5 sm:[&>td:first-child]:pl-6 [&>td:last-child]:pr-5 sm:[&>td:last-child]:pr-6">
      {children}
    </tr>
  );
}

export function Td({ children, className, right = false }) {
  return <td className={cx('py-3.5 px-4 align-middle text-slate-600', right && 'text-right', className)}>{children}</td>;
}

export function RowActions({ children }) {
  return <div className="flex items-center justify-end gap-2">{children}</div>;
}

export function IdChip({ children }) {
  return <span className="text-sm font-medium text-slate-500 tabular-nums">#{children}</span>;
}

/* ---------- list rows (mockup "Top members") ---------- */
export function ListRow({ icon: Icon, avatar, title, sub, href, children }) {
  const body = (
    <>
      <div className="flex items-center gap-3 min-w-0">
        {avatar ? (
          <Avatar name={avatar} />
        ) : (
          <span className="w-9 h-9 rounded-full bg-slate-100 ring-1 ring-inset ring-black/[0.06] flex items-center justify-center text-slate-500 shrink-0">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-900 leading-[18px]">{title}</div>
          {sub && <div className="text-sm text-slate-600 mt-px">{sub}</div>}
        </div>
      </div>
      {children}
    </>
  );
  const cls = 'flex items-center justify-between gap-3 py-2 -mx-2 px-2 rounded-lg transition-colors';
  return href ? <Link href={href} className={cx(cls, 'hover:bg-slate-50')}>{body}</Link> : <div className={cls}>{body}</div>;
}

/* ---------- key/value rows ---------- */
export function KV({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="min-w-0 font-medium text-slate-900 text-right truncate">{children}</span>
    </div>
  );
}

/* ---------- action cards (mockup "Start creating content") ---------- */
export function ActionCards({ items, cols = 'sm:grid-cols-2' }) {
  return (
    <div className={cx('grid grid-cols-1 gap-4 lg:gap-5', cols)}>
      {items.map(({ href, label, sub, icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex items-center gap-3.5 p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 hover:shadow-hover transition min-w-0"
        >
          <IconTile icon={icon} size="w-[42px] h-[42px]" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-slate-700">{label}</span>
            {sub && <span className="block text-sm text-slate-600 mt-px">{sub}</span>}
          </span>
          <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0 transition group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ))}
    </div>
  );
}
// Kept for older imports.
export const DarkLinks = ({ items }) => <ActionCards items={items} cols="" />;

/* ---------- segmented control (mockup "12 months / 30 days / …") ---------- */
export function Segmented({ items, value, onChange, label, className }) {
  return (
    <div className={cx('inline-flex flex-wrap max-w-full bg-slate-50 border border-slate-200 rounded-[9px]', className)} role="tablist" aria-label={label}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.value)}
            className={cx(
              '-m-px h-[34px] px-3 rounded-lg border text-sm font-semibold whitespace-nowrap transition-colors tabular-nums',
              active ? 'bg-white text-slate-700 border-slate-300 shadow-xs' : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- bars ---------- */
export function Meter({ value, color = 'bg-brand-600' }) {
  return (
    <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden min-w-[80px]">
      <div className={cx('h-full rounded-full transition-all', color)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

// Column chart in the brand purple, with light gridlines like the mockup chart.
export function BarChart({ bars, emptyLabel = 'No data yet.', height = 'h-48' }) {
  const max = Math.max(0, ...bars.map((b) => b.value));
  if (!bars.length || max === 0) return <Empty>{emptyLabel}</Empty>;
  return (
    <div>
      <div className={cx('relative', height)}>
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => <div key={i} className="border-t border-slate-100" />)}
        </div>
        <div className="relative h-full flex items-end justify-around gap-3 px-1">
          {bars.map((b) => (
            <div key={b.label} className="flex-1 max-w-[56px] h-full flex flex-col items-center justify-end gap-1.5 group min-w-0" title={`${b.label}: ${b.value}`}>
              <span className="text-xs font-semibold text-slate-700 tabular-nums">{b.value}</span>
              <div
                className="w-full rounded-t-md bg-brand-600 group-hover:bg-brand-700 transition-colors"
                style={{ height: `${Math.max(3, (b.value / max) * 82)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-around gap-3 px-1 mt-2.5">
        {bars.map((b) => (
          <span key={b.label} className="flex-1 max-w-[56px] text-center text-xs text-slate-600 truncate">{b.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- form fields (mockup auth input) ---------- */
export const INPUT =
  'w-full px-3 py-[9px] text-sm leading-5 bg-white border border-slate-300 rounded-lg shadow-xs text-slate-900 placeholder:text-slate-500 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 [&[readonly]]:bg-slate-50 [&[readonly]]:text-slate-600 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';
export const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5';

export function Field({ label, htmlFor, className, hint, required = false, children }) {
  return (
    <div className={className}>
      <label className={LABEL} htmlFor={htmlFor}>
        {label}
        {required && <span className="text-brand-600">*</span>}
      </label>
      {children}
      {hint && <div className="text-sm text-slate-600 mt-1.5">{hint}</div>}
    </div>
  );
}

/* ---------- states ---------- */
export function Loading({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
      <LoaderCircle className="w-4 h-4 animate-spin text-brand-600" />
      {label}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="py-12 text-center text-sm text-slate-600 space-y-4 flex flex-col items-center">{children}</div>;
}

export function ErrorCard({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-xl border border-rose-300 bg-rose-50/60 p-4 flex items-start gap-3 text-sm" role="alert">
      <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">!</span>
      <span className="font-medium text-rose-700">{message}</span>
    </div>
  );
}

// Inline form error
export function FormError({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2.5 text-sm font-medium text-rose-700 bg-rose-50/60 border border-rose-300 rounded-lg px-3.5 py-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-[7px]" />
      {message}
    </div>
  );
}

// Group label inside forms ("Student details")
export function FormSection({ children }) {
  return <div className="text-sm font-semibold text-slate-900 pt-2 pb-2 border-b border-slate-200">{children}</div>;
}

/* ---------- helpers ---------- */
// Client-side filter that matches any visible column, like the JSP table search scripts.
export function matches(query, ...values) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;
  return values.some((v) => v != null && String(v).toLowerCase().includes(q));
}

// Success / error feedback goes through the toast.
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
