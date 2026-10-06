import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from './ui';
import { PRODUCT } from '@/lib/brand';

// Global header + landing footer from the mockup (header.jsp / footer.jsp content).
export function PublicHeader({ showNav = false }) {
  return (
    <header className="sticky top-0 z-40 bg-[#eceef0]/95 backdrop-blur-md">
      <div className="w-full px-6 sm:px-10 lg:px-12 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <BrandLogo className="w-36 h-auto" />
        </Link>

        {showNav && (
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-950 transition">Features</a>
            <a href="#workspaces" className="hover:text-slate-950 transition">Workspaces</a>
            <a href="#contact" className="hover:text-slate-950 transition">Contact</a>
          </nav>
        )}

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-xl hover:bg-white/80 transition">
            <span>Dashboard</span>
          </Link>
          <Link href="/login" className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-xl hover:bg-white/80 transition">
            Sign In
          </Link>
          <Link href="/register" className="h-9 px-4 rounded-xl bg-[#1e2229] hover:bg-black text-white text-xs font-semibold flex items-center gap-2 shadow-subtle transition active:scale-[0.98]">
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer id="contact" className="w-full px-6 sm:px-10 lg:px-12 py-10 mt-12 bg-[#e4e7ea]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="w-28 h-auto" />
          <div>
            <span className="text-slate-500 ml-1">· {PRODUCT}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 beacon-pulse" />
            <a href="mailto:info@sms.edu" className="font-medium text-slate-700 hover:text-slate-900 transition">info@sms.edu</a>
          </span>
          <span className="text-slate-400">+94 78 722 3917</span>
        </div>

        <div className="flex items-center gap-6 font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-900 transition">Home</Link>
          <Link href="/register" className="hover:text-slate-900 transition">Register</Link>
          <Link href="/login" className="hover:text-slate-900 font-semibold transition text-slate-950">Sign In</Link>
        </div>
      </div>
    </footer>
  );
}

export function BackLink() {
  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950 transition group">
        <svg className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        <span>Return to Overview</span>
      </Link>
    </div>
  );
}

// Card header used by the sign-in and register cards
export function AuthCardHeader({ title, subtitle }) {
  return (
    <div className="flex items-center">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-950 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}
