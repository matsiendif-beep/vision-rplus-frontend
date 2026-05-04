/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Autoriser les images venant de domaines externes si besoin
  images: {
    remotePatterns: [],
  },

  // Proxy : redirige /api/v1/* vers le backend (Railway en prod, localhost en dev local)
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL || 'https://vision-rplus-backend-production.up.railway.app';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backend}/api/v1/:path*`,
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
