// Class helpers and the brand logo, usable from server and client components.
import { BRAND } from '@/lib/brand';

export const cx = (...c) => c.filter(Boolean).join(' ');

/* ---------- brand ---------- */
// Brand logo using public/Logo.png (dimensions: 2208x456, ~4.84:1 aspect ratio)
export function LogoMark({ size = 'h-7', className = '' }) {
  const heightClass = size.includes('h-')
    ? size.split(' ').find((s) => s.startsWith('h-')) || 'h-7'
    : 'h-7';
  return (
    <img
      src="/Logo.png"
      alt={BRAND}
      className={cx(heightClass, 'w-auto object-contain shrink-0', className)}
    />
  );
}

export function BrandLogo({ size = 'h-7', className = '', imgClassName = '' }) {
  const heightClass = size.includes('h-')
    ? size.split(' ').find((s) => s.startsWith('h-')) || 'h-7'
    : 'h-7';
  return (
    <span className={cx('inline-flex items-center shrink-0', className)}>
      <img
        src="/Logo.png"
        alt={BRAND}
        className={cx(heightClass, 'w-auto object-contain shrink-0', imgClassName)}
      />
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
  danger: ['danger', 'md'],
  rowDark: ['primary', 'sm'],
  rowLight: ['secondary', 'sm'],
  rowDanger: ['danger', 'sm'],
};
export const btnClass = (variant = 'primary') => {
  const [kind, size] = VARIANTS[variant] || VARIANTS.primary;
  return cx(BASE, SIZE[size], KIND[kind]);
};

