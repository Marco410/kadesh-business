"use client";

import PanelShell from "kadesh/components/panel/PanelShell";
import AgregarVendedorSection from "kadesh/components/profile/sales/agregar-vendedor/AgregarVendedorSection";

export default function AgregarVendedorPage() {
  return (
    <PanelShell selectedTab="vendedores" title="Agregar vendedor">
      <div className="pb-6">
        <AgregarVendedorSection />
      </div>
    </PanelShell>
  );
}
