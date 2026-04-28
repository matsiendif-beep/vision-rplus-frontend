/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Autoriser les images venant de domaines externes si besoin
  images: {
    remotePatterns: [],
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
