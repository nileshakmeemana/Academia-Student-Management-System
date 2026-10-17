// Class helpers and the brand logo, usable from server and client components.
import { BRAND } from '@/lib/brand';

export const cx = (...c) => c.filter(Boolean).join(' ');

/* ---------- brand ---------- */
// The mockup's logo: white tile with a purple orb, plus the wordmark.
export function LogoMark({ size = 'w-7 h-7' }) {
  return (
    <span className={cx('logo-mark', size)} aria-hidden="true">
      <span />
    </span>
  );
}

export function BrandLogo({ size = 'w-7 h-7', className = 'text-base' }) {
  return (
    <span className={cx('inline-flex items-center gap-2 font-semibold tracking-[-0.01em] text-slate-900', className)}>
      <LogoMark size={size} />
      {BRAND}
    </span>
  );
}

/* ---------- buttons ---------- */
const BASE = 'inline-flex items-center justify-center gap-1.5 font-semibold whitespace-nowrap [&_svg]:shrink-0 transition focus-visible:outline-none focus-visible:shadow-focus';
const SIZE = {
  md: 'h-10 px-3.5 text-sm rounded-lg',
  sm: 'h-8 px-3 text-13 rounded-md',
};
const KIND = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-skeuo-brand',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-800 shadow-skeuo [&_svg]:text-slate-400',
  danger: 'bg-white hover:bg-rose-50 text-rose-700 shadow-skeuo [&_svg]:text-rose-500',
  ghost: 'text-slate-600 hover:bg-slate-50 hover:text-slate-700 [&_svg]:text-slate-400',
};
// Old variant names map onto the mockup's primary / secondary buttons.
const VARIANTS = {
  primary: ['primary', 'md'],
  secondary: ['secondary', 'md'],
  pill: ['primary', 'md'],
  dark: ['primary', 'md'],
  green: ['primary', 'md'],
  white: ['secondary', 'md'],
  outline: ['secondary', 'md'],
  ghost: ['ghost', 'md'],
  rowDark: ['primary', 'sm'],
  rowLight: ['secondary', 'sm'],
  rowDanger: ['danger', 'sm'],
};
export const btnClass = (variant = 'primary') => {
  const [kind, size] = VARIANTS[variant] || VARIANTS.primary;
  return cx(BASE, SIZE[size], KIND[kind]);
};

