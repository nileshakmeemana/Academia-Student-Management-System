'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AuthCardHeader, BackLink, PublicHeader } from '@/components/PublicShell';
import AccountFields from '@/components/AccountFields';
import PersonFields from '@/components/PersonFields';
import { FormError, LABEL, cx } from '@/components/ui';
import { api, formToObject } from '@/lib/api';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!role) {
      setError('Choose whether you are registering as a student or a teacher.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api('/auth/register', { method: 'POST', body: { ...formToObject(e.currentTarget), role } });
      router.push('/login?registered=1');
    } catch (err) {
      setError(err.message);
      setBusy(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <>
      <PublicHeader />
      <section className="w-full flex-1 flex items-center justify-center py-12 px-6 sm:px-10">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <BackLink />
          <div className="bg-white rounded-card-lg p-8 sm:p-10 shadow-float space-y-6">
            <AuthCardHeader title="Create your account" subtitle="Register as a student or a teacher" />

            <form onSubmit={onSubmit} className="space-y-4">
              <FormError message={error} />
              <div>
                <div className={LABEL}>Register as</div>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Register as">
                  {ROLES.map((r) => (
                    <button key={r.value} type="button" role="radio" aria-checked={role === r.value}
                      onClick={() => { setRole(r.value); setError(''); }}
                      className={cx(
                        'py-2 px-3 text-xs rounded-xl border transition text-center',
                        role === r.value ? 'font-semibold border-slate-900 bg-[#1e2229] text-white' : 'font-medium border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      )}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <AccountFields />

              {role && (
                <div className="pt-2 space-y-4">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{role === 'teacher' ? 'Teacher details' : 'Student details'}</div>
                  <PersonFields role={role} />
                </div>
              )}

              <button type="submit" disabled={busy}
                className="w-full h-10 rounded-xl bg-[#65d33a] hover:bg-[#5ec435] text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-subtle disabled:opacity-60">
                <span>{busy ? 'Creating account…' : 'Register'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" strokeWidth={2.5} />
              </button>
            </form>

            <div className="text-center text-xs text-slate-500">
              Already have an account?
              <Link href="/login" className="font-bold text-slate-900 hover:underline ml-1">Sign in here</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
