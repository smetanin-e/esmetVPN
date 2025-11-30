import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ['vpn.esmet.store', 'localhost:3001'],
    },
  },
};

export default nextConfig;
