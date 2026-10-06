'use client';

import Link from 'next/link';

// error.jsp / error-500.jsp
export default function GlobalError({ error, reset }) {
  return (
    <section className="w-full flex-1 flex items-center justify-center py-12 px-6 sm:px-10">
      <div className="w-full max-w-md bg-white rounded-card-lg p-8 sm:p-10 shadow-float space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-950 tracking-tight">An error has occurred</h2>
          <p className="text-xs text-slate-500">{error?.message || 'Something went wrong. Please try again later.'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={() => reset()} className="h-10 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-medium transition hover:bg-slate-50">Try Again</button>
          <Link href="/" className="h-10 rounded-xl bg-[#1e2229] hover:bg-black text-white text-xs font-semibold flex items-center justify-center transition">Go to Home</Link>
        </div>
      </div>
    </section>
  );
}
