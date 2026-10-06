/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The API (Express, in server/) is served by pages/api/[...path].js on the same
  // domain, so no proxy/rewrite is needed and the httpOnly auth cookie stays first-party.
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'express'],
  },
};

export default nextConfig;
