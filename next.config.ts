import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig = withPWA({
  reactStrictMode: true,
  images: {
    domains: ["workshop-app.test","dev.mtikarawang.com","mtikarawang.com","mobile.mtikarawang.com"], // 🧩 tambahkan domain backend kamu
    unoptimized: true,
  },
  
});

module.exports = nextConfig;
