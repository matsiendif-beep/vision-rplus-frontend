/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Autoriser les images venant de domaines externes si besoin
  images: {
    remotePatterns: [],
  },

  // Proxy local dev : redirige /api/v1/* vers le backend NestJS (port 3000)
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) return [];
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3000/api/v1/:path*',
      },
    ];
  },

  // En-têtes de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
