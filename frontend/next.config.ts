import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slashes for static hosting
  trailingSlash: true,
};

export default nextConfig;
