/** @type {import('next').NextConfig} */
const isStatic = process.env.STATIC_EXPORT === 'true';
const rawBasePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = isStatic && rawBasePath && rawBasePath !== '/'
  ? (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`).replace(/\/$/, '')
  : '';

const nextConfig = {
  ...(isStatic ? { output: 'export', trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
  ...(basePath ? { basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

module.exports = nextConfig;
