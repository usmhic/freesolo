import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const SPRING_BOOT_API_URL = process.env.SPRING_BOOT_API_URL;

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      // Proxy all /api/** requests to the Spring Boot API
      {
        source: '/api/:path*',
        destination: `${SPRING_BOOT_API_URL}/api/:path*`,
      },
      // Fumadocs MDX
      {
        source: '/docs/:path*.mdx',
        destination: '/llms.mdx/docs/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        // Forward auth cookies from browser to the Spring Boot proxy
        source: '/api/:path*',
        headers: [
          { key: 'X-Forwarded-Proto', value: 'https' },
        ],
      },
    ];
  },
};

export default withMDX(config);
