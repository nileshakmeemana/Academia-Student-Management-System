'use client';

import { cx } from '@/components/ui';

const ACTIVE = {
  Present: 'bg-emerald-50 text-emerald-700 shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_0_0_1.5px_#079455]',
  Late: 'bg-amber-50 text-amber-700 shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_0_0_1.5px_#dc6803]',
  Absent: 'bg-rose-50 text-rose-700 shadow-[0_1px_2px_rgba(10,13,18,0.05),inset_0_0_0_1.5px_#d92d20]',
};
const DOT = { Present: 'bg-emerald-500', Late: 'bg-[#f79009]', Absent: 'bg-[#f04438]' };

// Present / Late / Absent, styled like the mockup's "I am a" role picker.
export default function StatusPicker({ name, value, onChange, label }) {
  return (
    <div className="inline-grid grid-cols-3 gap-2" role="radiogroup" aria-label={label}>
      {['Present', 'Late', 'Absent'].map((st) => (
        <label key={st} className="cursor-pointer">
          <input type="radio" className="sr-only peer" name={name} value={st} checked={value === st} onChange={() => onChange(st)} />
          <span
            className={cx(
              'h-8 px-3 flex items-center justify-center gap-1.5 text-13 font-semibold rounded-lg transition peer-focus-visible:ring-4 peer-focus-visible:ring-brand-500/25',
              value === st ? ACTIVE[st] : 'bg-white text-slate-700 shadow-skeuo hover:bg-slate-50'
            )}
          >
            <span className={cx('w-1.5 h-1.5 rounded-full', value === st ? DOT[st] : 'bg-slate-300')} />
            {st}
          </span>
        </label>
      ))}
    </div>
  );
}
