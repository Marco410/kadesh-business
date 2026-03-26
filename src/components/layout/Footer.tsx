"use client";

import Link from 'next/link';
import Logo from '../shared/Logo';
import { NICHE_TARGET_MAPPING } from 'kadesh/components/profile/sales/constants';

const FOOTER_LINKS = {
  producto: [
    { label: "Cómo funciona", href: "/#demo" },
    { label: "Planes", href: "/#precios" },
    { label: "Contacto", href: "/contacto" },
  ],
  legal: [
    { label: "Términos y condiciones", href: "/terminos" },
    { label: "Privacidad", href: "/privacidad" },
  ],
};

const NICHE_FOOTER_LINKS = Object.entries(NICHE_TARGET_MAPPING)
  .slice(0, 6)
  .map(([key, value]) => ({
    href: `/clientes-para-${key}`,
    label: value.title,
  }));

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 dark:bg-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Logo className="mb-4" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Prospección B2B inteligente. Extrae leads desde Google Maps y gestiona ventas en un CRM integrado.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-white font-bold mb-4">Producto</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.producto.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nichos SEO */}
          <div>
            <h4 className="text-white font-bold mb-4">Encuentra tus clientes</h4>
            <ul className="space-y-2">
              {NICHE_FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} KADESH. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-sm text-center md:text-right">
              Hecho con ❤️ para equipos de ventas B2B
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

