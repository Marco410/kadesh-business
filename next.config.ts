import path from "node:path";

import type { NextConfig } from "next";

/** Una sola instancia en el bundle (evita dos I18nContext y placeholders en-US en HeroUI DatePicker). */
const reactAriaI18nRoot = path.join(process.cwd(), "node_modules/@react-aria/i18n");
const internationalizedDateRoot = path.join(
  process.cwd(),
  "node_modules/@internationalized/date",
);

const sharedResolveAlias = {
  "@react-aria/i18n": reactAriaI18nRoot,
  "@internationalized/date": internationalizedDateRoot,
} as const;

const nextConfig: NextConfig = {
  // Turbopack no acepta rutas absolutas aquí (las trata como relativas al archivo → error).
  turbopack: {
    resolveAlias: {
      "@react-aria/i18n": "./node_modules/@react-aria/i18n",
      "@internationalized/date": "./node_modules/@internationalized/date",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...sharedResolveAlias,
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
