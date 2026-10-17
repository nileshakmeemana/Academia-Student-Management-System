'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ClipboardCheck, LoaderCircle } from 'lucide-react';
import { AUTH_TABS, AuthLayout } from '@/components/PublicShell';
import AccountFields from '@/components/AccountFields';
import PersonFields from '@/components/PersonFields';
import { FormError, FormSection, LABEL, btnClass, cx } from '@/components/ui';
import { api, formToObject } from '@/lib/api';

// Students and teachers can self-register (admins are created by an admin), like the original app.
const ROLES = [
  { value: 'student', label: 'Student', icon: BookOpen },
  { value: 'teacher', label: 'Teacher', icon: ClipboardCheck },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
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
    <AuthLayout title="Create an account" subtitle="Join Academia as a student or a teacher." tabs={AUTH_TABS('register')} width="max-w-[480px]">
      <form onSubmit={onSubmit} className="mt-7 space-y-[18px]">
        <FormError message={error} />

        <fieldset>
          <legend className={LABEL}>I am a</legend>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map(({ value, label, icon: Icon }) => (
              <label key={value} className="cursor-pointer">
                <input type="radio" name="role-pick" value={value} checked={role === value} onChange={() => setRole(value)} className="sr-only peer" />
                <span
                  className={cx(
                    'h-[38px] flex items-center justify-center gap-1.5 rounded-lg text-13 font-semibold transition peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25',
                    role === value
                      ? 'bg-brand-50 text-brand-700 shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_0_0_1.5px_#7f56d9] [&_svg]:text-brand-600'
                      : 'bg-white text-slate-700 shadow-skeuo hover:bg-slate-50 [&_svg]:text-slate-400'
                  )}
                >
                  <Icon className="w-4 h-4" />{label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <AccountFields />

        <FormSection>{role === 'teacher' ? 'Teacher details' : 'Student details'}</FormSection>
        <PersonFields role={role} />

        <div className="pt-1">
          <button type="submit" disabled={busy} className={cx(btnClass('primary'), 'w-full disabled:opacity-70')}>
            {busy && <LoaderCircle className="w-4 h-4 animate-spin" />}
            {busy ? 'Creating account…' : 'Get started'}
          </button>
        </div>
      </form>

      <p className="mt-7 text-center text-13 text-slate-600">
        Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">Log in</Link>
      </p>
    </AuthLayout>
  );
}
