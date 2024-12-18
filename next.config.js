/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config) => {
      config.resolve.fallback = { fs: false };
      return config;
    },
  }

  module.exports = nextConfig
