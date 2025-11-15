import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Отключаем Turbopack для стабильности
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
