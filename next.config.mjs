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
    exclude: [/middleware-manifest\.json$/, /\/api\/.*$/],
    runtimeCaching: [
      {
        // NetworkOnly for API calls ensures we never cache DB data in the Service Worker
        urlPattern: /\/api\/.*/,
        handler: 'NetworkOnly',
      },
      {
        // StaleWhileRevalidate for images/static assets
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'images',
          expiration: {
            maxEntries: 50, // Limit to 50 images to save space
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
          },
        },
      },
    ],
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
  // Increase body size limit for API routes to handle larger syncs
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default withPWA(nextConfig);
