"use client";

import { Footer, Navigation } from "kadesh/components/layout";
import SuscripcionSection from "kadesh/components/profile/sales/planes/SuscripcionSection";

export default function SuscripcionPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <SuscripcionSection />
      </main>
      <Footer />
    </div>
  );
}
