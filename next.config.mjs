import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // CRITICAL: Disable aggressive caching to prevent storage quota errors
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    exclude: [/middleware-manifest\.json$/, /api\/.*$/],
    runtimeCaching: [
      {
        // FIX 1: Catches /api/chat correctly (no trailing slash)
        // FIX 2: Uses NetworkOnly to STOP caching the AI
        urlPattern: /\/api\/.*/,
        handler: "NetworkOnly",
      },
      {
        // Cache images normally
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "images",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  // Increase body size limit for API routes to handle larger syncs
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default withPWA(nextConfig);
