import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // 1. Disable aggressive caching
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  // 2. Add strict exclusion rules
  workboxOptions: {
    disableDevLogs: true,
    exclude: [/middleware-manifest\.json$/], // Fixes common Next.js PWA issues
    runtimeCaching: [
      {
        // NEVER cache the AI chat or API routes
        urlPattern: /\/api\/chat\//,
        handler: 'NetworkOnly',
      },
      {
        urlPattern: /\/api\/.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 // 1 day
          }
        }
      },
      {
        // Standard cache for other assets
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 1 Month
          }
        }
      }
    ]
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withPWA(nextConfig);
