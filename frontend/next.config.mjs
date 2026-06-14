/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // Disable powered-by header for security
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Tree-shake lucide-react icons
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Build as standalone for Docker/VPS deployment (includes all dependencies)
  output: 'standalone',

  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    }];
  },

  async rewrites() {
    // In production, NEXT_PUBLIC_API_URL env var points to the backend
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiBase}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
