import type { NextConfig } from "next";
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
};

export default nextConfig;
