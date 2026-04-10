// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'marketplace-uploads.s3.amazonaws.com',
      'lh3.googleusercontent.com',    // Google avatars
      'graph.facebook.com',           // Facebook avatars
    ],
  },
  // SEO: trailing slash for consistent URLs
  trailingSlash: false,

  // Performance: enable compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      { source: '/dashboard', destination: '/dashboard/buyer', permanent: false },
    ];
  },
};

module.exports = nextConfig;

// ─────────────────────────────────────────────────────────────
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#0a0a0f',
          900: '#111118',
          800: '#1a1a24',
          700: '#252530',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(10px)', opacity: '0' },
                   to:   { transform: 'translateY(0)',    opacity: '1' } },
      },
    },
  },
  plugins: [],
};

export default config;
