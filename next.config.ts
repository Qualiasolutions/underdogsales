import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,

  // Experimental optimizations
  experimental: {
    // Tree-shake specific packages for smaller bundles
    optimizePackageImports: ['lucide-react', 'motion/react'],
  },
};

export default nextConfig;
