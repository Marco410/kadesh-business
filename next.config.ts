import path from "node:path";

import type { NextConfig } from "next";

/** Una sola instancia en el bundle (evita dos I18nContext y placeholders en-US en HeroUI DatePicker). */
const reactAriaI18nRoot = path.join(process.cwd(), "node_modules/@react-aria/i18n");

const nextConfig: NextConfig = {
  // Turbopack no acepta rutas absolutas aquí (las trata como relativas al archivo → error).
  turbopack: {
    resolveAlias: {
      "@react-aria/i18n": "./node_modules/@react-aria/i18n",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-aria/i18n": reactAriaI18nRoot,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMAGE_DOMAIN || "localhost",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/clientes-para-:nicho",
        destination: "/clientes-para/:nicho",
      },
    ];
  },
};

export default nextConfig;
