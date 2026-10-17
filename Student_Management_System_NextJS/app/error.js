'use client';

import Link from 'next/link';
import { AuthLayout } from '@/components/PublicShell';
import { btnClass } from '@/components/ui';

// error.jsp / error-500.jsp
export default function GlobalError({ error, reset }) {
  return (
    <AuthLayout title="An error has occurred" subtitle={error?.message || 'Something went wrong. Please try again later.'}>
      <div className="mt-7 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => reset()} className={btnClass('secondary')}>Try again</button>
        <Link href="/" className={btnClass('primary')}>Go to home</Link>
      </div>
    </AuthLayout>
  );
}
