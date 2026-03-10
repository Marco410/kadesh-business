"use client";

import { Footer, Navigation } from "kadesh/components/layout";
import AgregarVendedorSection from "kadesh/components/profile/sales/agregar-vendedor/AgregarVendedorSection";

export default function AgregarVendedorPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <main className="pt-20 pb-12">
        <AgregarVendedorSection />
      </main>
      <Footer />
    </div>
  );
}
