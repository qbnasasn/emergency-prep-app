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
    // Exclude API routes and build files from the service worker cache
    exclude: [/middleware-manifest\.json$/, /api\/.*$/],
    runtimeCaching: [
      {
        // NEVER cache the AI chat or API routes
        urlPattern: /\/api\/chat\//,
        handler: "NetworkOnly",
      },
      {
        urlPattern: /\/api\/.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
        },
      },
      {
        // Standard cache for other assets
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 1 Month
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
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
