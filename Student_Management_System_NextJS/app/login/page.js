'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AuthCardHeader, BackLink, PublicHeader } from '@/components/PublicShell';
import { useToast } from '@/components/Toast';
import { FormError, INPUT, LABEL } from '@/components/ui';
import { api } from '@/lib/api';

const HOME = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
const DEMO = [
  { role: 'Admin', username: 'admin', password: '123' },
  { role: 'Teacher', username: 'teacher', password: '123' },
  { role: 'Student', username: 'nilesh', password: '32915NNAmcc' },
];

function LoginCard() {
  const params = useSearchParams();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get('registered')) toast('Registration successful. Please login.', 'ok');
    else if (params.get('message') === 'logout') toast('You have been signed out.', 'info');
  }, [params, toast]);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user } = await api('/auth/login', { method: 'POST', body: { username, password } });
      toast(`Welcome back, ${user.username}. Redirecting…`, 'ok');
      window.location.href = HOME[user.role] || '/';
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <section className="w-full flex-1 flex items-center justify-center py-12 px-6 sm:px-10">
      <div className="w-full max-w-md mx-auto space-y-6">
        <BackLink />
        <div className="bg-white rounded-card-lg p-8 sm:p-10 shadow-float space-y-6">
          <AuthCardHeader title="Sign in to your account" subtitle="Access your courses, grades and attendance" />

          <form onSubmit={onSubmit} className="space-y-4">
            <FormError message={error} />
            <div>
              <label className={LABEL} htmlFor="username">Username</label>
              <input id="username" name="username" required autoComplete="username" placeholder="e.g. nilesh" className={INPUT}
                value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="password">Password</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••••••" className={INPUT}
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" disabled={busy}
              className="w-full h-10 rounded-xl bg-[#1e2229] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-subtle disabled:opacity-60">
              <span>{busy ? 'Signing in…' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" strokeWidth={2.5} />
            </button>

            {/* Demo accounts (the credentials login.jsp listed), styled as the mockup's SSO row */}
            <div className="pt-4 text-center space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Demo accounts</div>
              <div className="grid grid-cols-3 gap-2.5">
                {DEMO.map((d) => (
                  <button key={d.role} type="button" onClick={() => { setUsername(d.username); setPassword(d.password); setError(''); }}
                    className="py-2 px-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 text-xs font-medium flex flex-col items-center justify-center transition hover:bg-slate-50">
                    <span className="font-semibold text-slate-900">{d.role}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-full">{d.username} / {d.password}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>

          <div className="text-center text-xs text-slate-500">
            New here?
            <Link href="/register" className="font-bold text-slate-900 hover:underline ml-1">Create an account</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <>
      <PublicHeader />
      <Suspense fallback={null}>
        <LoginCard />
      </Suspense>
    </>
  );
}
