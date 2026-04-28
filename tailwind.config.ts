import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:       '#1a2744',
          'navy-700': '#243058',
          'navy-600': '#2d3d6e',
          orange:     '#e07b2a',
          'orange-400': '#f09040',
          'orange-100': 'rgba(224,123,42,0.10)',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f5f7fa',
          tertiary:  '#eef1f7',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card:  '0 1px 4px rgba(26,39,68,0.07), 0 4px 16px rgba(26,39,68,0.05)',
        'card-hover': '0 4px 12px rgba(26,39,68,0.12), 0 8px 32px rgba(26,39,68,0.08)',
        sidebar: '2px 0 16px rgba(26,39,68,0.12)',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '20px' },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.3s ease',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
