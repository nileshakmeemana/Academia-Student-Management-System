'use client';

import { cx } from '@/components/ui';

const ACTIVE = {
  Present: 'border-[#65d33a] bg-[#65d33a] text-slate-950 font-bold',
  Late: 'border-amber-500 bg-amber-500 text-white font-bold',
  Absent: 'border-rose-500 bg-rose-500 text-white font-bold',
};

// Present / Late / Absent, styled like the mockup's role selector buttons.
export default function StatusPicker({ name, value, onChange, label }) {
  return (
    <div className="inline-grid grid-cols-3 gap-1.5" role="radiogroup" aria-label={label}>
      {['Present', 'Late', 'Absent'].map((st) => (
        <label key={st} className="cursor-pointer">
          <input type="radio" className="sr-only peer" name={name} value={st} checked={value === st} onChange={() => onChange(st)} />
          <span
            className={cx(
              'block py-1.5 px-3 text-[11px] rounded-xl border transition text-center peer-focus-visible:ring-2 peer-focus-visible:ring-slate-900',
              value === st ? ACTIVE[st] : 'font-medium border-slate-200 bg-white text-slate-700 hover:border-slate-400'
            )}
          >
            {st}
          </span>
        </label>
      ))}
    </div>
  );
}
