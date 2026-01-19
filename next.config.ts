import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = withPWA({
  reactStrictMode: true,
  images: {
    domains: ["workshop-app.test","dev.mtikarawang.com","mtikarawang.com","mobile.mtikarawang.com"],
    unoptimized: true,
  },
  // Server Actions dan API Routes body size limit
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
});

module.exports = nextConfig;
