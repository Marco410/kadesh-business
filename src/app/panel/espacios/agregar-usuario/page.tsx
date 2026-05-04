"use client";

import { Footer, Navigation } from "kadesh/components/layout";
import AgregarUsuarioCompanySection from "kadesh/components/profile/sales/workspaces/members/AgregarUsuarioCompanySection";

export default function AgregarUsuarioCompanyPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <main className="pt-20 pb-12">
        <AgregarUsuarioCompanySection />
      </main>
      <Footer />
    </div>
  );
}
