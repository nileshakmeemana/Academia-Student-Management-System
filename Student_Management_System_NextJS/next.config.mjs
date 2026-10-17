/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';


// Content Security Policy: only this site's own scripts/styles/API, plus Google Fonts.
// ('unsafe-inline' is needed for the inline scripts Next.js emits without nonces.)
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  // HTTPS-only for two years, on the deployed site (not on http://localhost).
  ...(process.env.VERCEL ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }] : []),
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The API (Express, in server/) is served by pages/api/[...path].js on the same
  // domain, so no proxy/rewrite is needed and the httpOnly auth cookie stays first-party.
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'express'],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
