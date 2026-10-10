import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 输出独立部署产物，便于 Docker / VPS 自托管（对 Vercel 部署无影响）
  output: 'standalone',
  // Enable React Strict Mode for better error handling
  reactStrictMode: true,
  // Optimize images with next/image
  images: {
    // Allow optimization for these domains (add your CDN or external domains)
    domains: [
      // Example: 'cdn.example.com',
      // If you use Vercel Image Optimization, you can leave empty for same-host
    ],
    // Configure device sizes for responsive images
    deviceSizes: [640, 768, 1024, 1280, 1600, 1920],
    // Minimum cache timeout for static images (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Paths for next/image loader (if using custom loader)
    // path: '/_next/image',
  },
  // SWC minification is enabled by default in Next.js 12+
  // swcMinify: true,
  // Experimental features (optional)
  experimental: {
    // Enable app router instrumentation (if needed)
    // instrumentationHook: true,
    // Enable server components external packages (if needed)
    // serverComponentsExternalPackages: ['mongoose'],
  },
  // Custom headers for security (can also be done via middleware)
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  // Optimize package imports (optional)
  // transpilePackages: ['ui'],
};

export default nextConfig;
