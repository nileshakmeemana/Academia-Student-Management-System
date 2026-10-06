'use client';

import { useRef, useState } from 'react';
import { Field, INPUT } from './ui';

const BAR_COLORS = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-[#65d33a]'];
const LABELS = ['Weak', 'Moderate', 'Good', 'Strong'];

// The mockup's password strength meter (informational only, like the original app
// there is no enforced password rule).
export function StrengthMeter({ value }) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return (
    <>
      <div className="mt-2 flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${value && score > i ? BAR_COLORS[i] : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="text-[10px] font-semibold text-slate-400 mt-1">
        {value ? `Strength: ${LABELS[score - 1] || 'Weak'}` : 'Use 8+ characters with a capital, a number and a symbol'}
      </div>
    </>
  );
}

// Username / email / password / confirm, with the "Passwords don't match"
// custom validity the JSP pages wired up in script.js.
export default function AccountFields({ idPrefix = '' }) {
  const confirm = useRef(null);
  const [pw, setPw] = useState('');
  const check = (next) => {
    if (!confirm.current) return;
    confirm.current.setCustomValidity(next !== confirm.current.value ? "Passwords don't match" : '');
  };
  const id = (n) => `${idPrefix}${n}`;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Username" htmlFor={id('username')}>
        <input className={INPUT} id={id('username')} name="username" required maxLength={50} autoComplete="username" placeholder="e.g. kasun" />
      </Field>
      <Field label="Email" htmlFor={id('email')}>
        <input className={INPUT} type="email" id={id('email')} name="email" required maxLength={100} autoComplete="email" placeholder="name@example.com" />
      </Field>
      <div>
        <Field label="Password" htmlFor={id('password')}>
          <input className={INPUT} type="password" id={id('password')} name="password" required autoComplete="new-password"
            value={pw} onChange={(e) => { setPw(e.target.value); check(e.target.value); }} placeholder="Create a password" />
        </Field>
        <StrengthMeter value={pw} />
      </div>
      <Field label="Confirm Password" htmlFor={id('confirmPassword')}>
        <input className={INPUT} type="password" id={id('confirmPassword')} name="confirmPassword" required ref={confirm}
          onInput={() => check(pw)} autoComplete="new-password" placeholder="Repeat the password" />
      </Field>
    </div>
  );
}
