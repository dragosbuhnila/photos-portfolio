/** @type {import('next').NextConfig} */
const isStatic = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  ...(isStatic ? { output: 'export', trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
  ...(isStatic && process.env.BASE_PATH ? { basePath: process.env.BASE_PATH } : {}),
};

module.exports = nextConfig;
