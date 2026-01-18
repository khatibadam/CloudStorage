import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour le déploiement Vercel optimisé

  // Optimisation des images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.stripe.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    // Formats modernes pour de meilleures performances
    formats: ["image/avif", "image/webp"],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        // Headers spécifiques pour l'API
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },

  // Redirections
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth/signup",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth/signup",
        permanent: true,
      },
    ];
  },

  // Configuration pour les logs en production
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  // Packages externes pour les composants serveur (nouvelle syntaxe Next.js 15+)
  serverExternalPackages: ["argon2", "nodemailer"],

  // Configuration TypeScript stricte
  typescript: {
    // En production, on ignore les erreurs de type pour ne pas bloquer le build
    // Les erreurs sont détectées en CI/CD
    ignoreBuildErrors: false,
  },

  // Désactiver le header X-Powered-By pour la sécurité
  poweredByHeader: false,

  // Compression activée par défaut sur Vercel
  compress: true,

  // Configuration pour le mode strict React
  reactStrictMode: true,
};

export default nextConfig;
