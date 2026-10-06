import Link from 'next/link';
import { AuthCardHeader, BackLink, PublicHeader } from '@/components/PublicShell';

// error-404.jsp
export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <section className="w-full flex-1 flex items-center justify-center py-12 px-6 sm:px-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          <BackLink />
          <div className="bg-white rounded-card-lg p-8 sm:p-10 shadow-float space-y-6">
            <AuthCardHeader title="Page not found" subtitle="The page you are looking for doesn't exist or has been moved." />
            <Link href="/" className="w-full h-10 rounded-xl bg-[#1e2229] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-subtle">
              Go to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
