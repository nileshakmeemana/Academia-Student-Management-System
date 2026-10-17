import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/PublicShell';
import { btnClass, cx } from '@/components/styles';

// error-404.jsp
export default function NotFound() {
  return (
    <AuthLayout title="Page not found" subtitle="The page you are looking for doesn't exist or has been moved.">
      <div className="mt-7 grid grid-cols-2 gap-3">
        <Link href="/login" className={btnClass('secondary')}><ArrowLeft className="w-4 h-4" />Dashboard</Link>
        <Link href="/" className={cx(btnClass('primary'))}>Go to home</Link>
      </div>
    </AuthLayout>
  );
}
