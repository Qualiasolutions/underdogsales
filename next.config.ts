import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';
import { resolve } from 'path';

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,

  // Exclude test-only packages from server bundle
  serverExternalPackages: ['@playwright/test', 'playwright-core', 'playwright'],

  // Turbopack configuration
  turbopack: {
    root: resolve(__dirname),
  },

  // Experimental optimizations
  experimental: {
    // Tree-shake specific packages for smaller bundles
    optimizePackageImports: ['lucide-react', 'motion/react'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.vapi.ai https://vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.vapi.ai wss://api.vapi.ai https://*.daily.co wss://*.daily.co https://api.openai.com https://openrouter.ai https://*.sentry.io https://*.ingest.sentry.io",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
              "frame-src 'self' https://vercel.live",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress source map upload logs
  silent: true,
  // Upload source maps for better stack traces
  widenClientFileUpload: true,
  // Automatically tree-shake Sentry logger statements
  disableLogger: true,
});
