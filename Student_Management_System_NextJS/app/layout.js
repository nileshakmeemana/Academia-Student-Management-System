import './globals.css';
import { ToastProvider } from '@/components/Toast';
import { BRAND, PRODUCT } from '@/lib/brand';

export const metadata = {
  title: `${BRAND} · ${PRODUCT}`,
  description: 'Manage student data, courses, grades and attendance in one place.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full flex flex-col bg-[#eceef0] text-slate-900 selection:bg-slate-900 selection:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
