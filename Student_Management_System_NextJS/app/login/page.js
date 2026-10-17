'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { AUTH_TABS, AuthLayout, PasswordInput } from '@/components/PublicShell';
import { useToast } from '@/components/Toast';
import { FormError, INPUT, LABEL, btnClass, cx } from '@/components/ui';
import { api } from '@/lib/api';

const HOME = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' };
const DEMO = [
  { role: 'Admin', username: 'admin', password: '123' },
  { role: 'Teacher', username: 'teacher', password: '123' },
  { role: 'Student', username: 'nilesh', password: '32915NNAmcc' },
];

function LoginForm() {
  const params = useSearchParams();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const NOTICE = {
      logout: ['You have been signed out.', 'info'],
      all: ['You have been signed out on all devices.', 'info'],
      timeout: ['You were signed out after a period of inactivity.', 'info'],
      expired: ['Your session has expired. Please sign in again.', 'info'],
      revoked: ['You were signed out because your password or account changed. Please sign in again.', 'error'],
    };
    if (params.get('registered')) toast('Registration successful. Please login.', 'ok');
    else if (NOTICE[params.get('message')]) toast(...NOTICE[params.get('message')]);
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
    <>
      <form onSubmit={onSubmit} className="mt-7 space-y-[18px]">
        <FormError message={error} />
        <div>
          <label className={LABEL} htmlFor="username">Username or email</label>
          <input id="username" name="username" required autoComplete="username" placeholder="Enter your username or email" className={INPUT}
            value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className={LABEL} htmlFor="password">Password</label>
          <PasswordInput id="password" name="password" required autoComplete="current-password" placeholder="••••••••••••" className={INPUT}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="pt-1">
          <button type="submit" disabled={busy} className={cx(btnClass('primary'), 'w-full disabled:opacity-70')}>
            {busy && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>

      {/* Demo accounts (the credentials login.jsp listed) */}
      <div className="mt-6">
        <div className="flex items-center gap-3 text-13 text-slate-500">
          <span className="h-px flex-1 bg-slate-200" />Or try a demo account<span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          {DEMO.map((d) => (
            <button key={d.role} type="button" onClick={() => { setUsername(d.username); setPassword(d.password); setError(''); }}
              className={cx(btnClass('secondary'), '!h-auto py-2 flex-col !gap-0')} title={`${d.username} / ${d.password}`}>
              <span>{d.role}</span>
              <span className="text-xs font-medium text-slate-500 truncate max-w-full">{d.username}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-7 text-center text-13 text-slate-600">
        Don’t have an account? <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">Sign up</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout title="Log in to your account" subtitle="Welcome back! Please enter your details." tabs={AUTH_TABS('login')}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
