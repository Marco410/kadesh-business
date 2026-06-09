"use client";

import { Footer, Navigation } from "kadesh/components/layout";
import StripeCreditPurchaseWrapper from "kadesh/components/panel/creditos/StripeCreditPurchaseWrapper";

export default function CompraCreditosPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 pt-20 sm:px-6 lg:px-8">
        <StripeCreditPurchaseWrapper />
      </main>
      <Footer />
    </div>
  );
}
