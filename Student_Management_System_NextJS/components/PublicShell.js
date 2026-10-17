'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Menu, Phone, X } from 'lucide-react';
import { BrandLogo, LogoMark, btnClass, cx } from './ui';
import { BRAND, PRODUCT } from '@/lib/brand';

const SECTIONS = [
  { href: '/#features', label: 'Features' },
  { href: '/#workspaces', label: 'Workspaces' },
  { href: '/#contact', label: 'Contact' },
];

// Landing header from academia.html: sticky, blurred, border appears on scroll.
export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    const onResize = () => window.innerWidth > 900 && setOpen(false);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <header
      className={cx(
        'sticky top-0 z-50 bg-white/85 backdrop-blur-md backdrop-saturate-[1.8] border-b transition-colors',
        scrolled || open ? 'border-slate-200' : 'border-transparent'
      )}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-7 h-16 flex items-center gap-8">
        <Link href="/" aria-label={`${BRAND} home`}>
          <BrandLogo />
        </Link>

        <nav className="hidden min-[901px]:flex gap-1" aria-label="Primary">
          {SECTIONS.map((s) => (
            <a key={s.href} href={s.href} className="px-3 py-2 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-700 transition">
              {s.label}
            </a>
          ))}
        </nav>

        <div className="hidden min-[901px]:flex ml-auto items-center gap-2">
          <Link href="/login" className={btnClass('ghost')}>Dashboard</Link>
          <Link href="/login" className={btnClass('ghost')}>Sign in</Link>
          <Link href="/register" className={btnClass('primary')}>Create account</Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="min-[901px]:hidden ml-auto w-10 h-10 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="min-[901px]:hidden absolute inset-x-0 top-16 bg-white border-b border-slate-200 shadow-lg px-4 pt-3 pb-5">
          {[...SECTIONS, { href: '/login', label: 'Dashboard' }].map((s) => (
            <a key={s.label} href={s.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-md text-[15px] font-semibold text-slate-700 hover:bg-slate-50">
              {s.label}
            </a>
          ))}
          <div className="grid gap-2.5 mt-3">
            <Link href="/register" className={cx(btnClass('primary'), 'h-11 text-[15px]')}>Create account</Link>
            <Link href="/login" className={cx(btnClass('secondary'), 'h-11 text-[15px]')}>Sign in</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer id="contact" className="border-t border-slate-200 pt-10 pb-8 scroll-mt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-7">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start justify-between gap-8">
          <div>
            <Link href="/"><BrandLogo /></Link>
            <p className="mt-3 text-sm leading-[22px] text-slate-600 max-w-[280px]">
              {PRODUCT} — courses, grades and attendance in one place.
            </p>
          </div>
          <div className="grid gap-2.5">
            <a href="mailto:info@sms.edu" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <Mail className="w-[18px] h-[18px] text-slate-400" />info@sms.edu
            </a>
            <a href="tel:+94787223917" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
              <Phone className="w-[18px] h-[18px] text-slate-400" />+94 78 722 3917
            </a>
          </div>
          <nav className="flex flex-wrap gap-x-7 gap-y-3" aria-label="Footer">
            <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-slate-700">Home</Link>
            <Link href="/register" className="text-sm font-semibold text-slate-600 hover:text-slate-700">Register</Link>
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-700">Sign in</Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-4 text-13 text-slate-500">
          <span>© {new Date().getFullYear()} {BRAND}. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

// Centered auth layout (login / sign up / 404) from academia.html.
export function AuthLayout({ title, subtitle, tabs, width = 'max-w-[360px]', children }) {
  return (
    <main className="relative min-h-screen flex justify-center px-3.5 pt-16 pb-7 sm:pt-[84px] sm:pb-11 bg-white">
      <Link
        href="/"
        className="absolute top-3 left-2 sm:top-[18px] sm:left-5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-13 font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-700"
      >
        <ArrowLeft className="w-4 h-4 text-slate-400" />Back to home
      </Link>

      <div className={cx('w-full', width)}>
        <div className="text-center">
          <Link href="/" className="inline-flex" aria-label={`${BRAND} home`}>
            <LogoMark size="w-8 h-8" />
          </Link>
          <h1 className="mt-5 text-xl font-semibold tracking-[-0.01em] text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-[22px] text-slate-600">{subtitle}</p>}
        </div>

        {tabs && (
          <nav className="mt-6 grid grid-cols-2 bg-slate-50 border border-slate-200 rounded-[7px]" aria-label="Authentication">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                aria-current={t.active ? 'page' : undefined}
                className={cx(
                  '-m-px h-8 grid place-items-center rounded-md border text-13 font-semibold transition-colors',
                  t.active ? 'bg-white text-slate-700 border-slate-300 shadow-xs' : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        )}

        {children}
      </div>
    </main>
  );
}

export const AUTH_TABS = (active) => [
  { href: '/register', label: 'Sign up', active: active === 'register' },
  { href: '/login', label: 'Log in', active: active === 'login' },
];

// Password input with the mockup's eye toggle.
export function PasswordInput({ className, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className={cx(className, 'pr-10', !show && 'tracking-[0.12em] placeholder:tracking-normal')} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md grid place-items-center text-slate-400 hover:text-slate-500 hover:bg-slate-50"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.743 5.092C11.149 5.032 11.569 5 12 5c5.105 0 8.455 4.505 9.58 6.287.137.215.205.323.243.49a1.17 1.17 0 0 1 0 .447c-.038.166-.107.274-.244.492-.3.474-.757 1.141-1.363 1.865M6.724 6.715c-2.162 1.467-3.63 3.504-4.303 4.57-.137.217-.205.325-.243.492a1.173 1.173 0 0 0 0 .446c.038.167.106.274.242.49C3.546 14.495 6.895 19 12 19c2.059 0 3.832-.732 5.289-1.723M3 3l18 18M9.879 9.879a3 3 0 1 0 4.243 4.243" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.42 12.713c-.136-.215-.204-.323-.242-.49a1.173 1.173 0 0 1 0-.446c.038-.167.106-.274.242-.49C3.546 9.505 6.895 5 12 5s8.455 4.505 9.58 6.287c.137.215.205.323.243.49.029.125.029.322 0 .446-.038.167-.106.274-.242.49C20.455 14.495 17.105 19 12 19c-5.106 0-8.455-4.505-9.58-6.287Z" /><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>
        )}
      </button>
    </div>
  );
}
