import type { NextConfig } from 'next';

const adminConsoleUrl = process.env.ADMIN_CONSOLE_URL || 'http://localhost:3001';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/admin/:path*',
        destination: `${adminConsoleUrl}/:path*`,
        permanent: false,
        basePath: false,
      },
      {
        source: '/admin',
        destination: adminConsoleUrl,
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
