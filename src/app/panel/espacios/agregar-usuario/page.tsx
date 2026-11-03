"use client";

import PanelShell from "kadesh/components/panel/PanelShell";
import AgregarUsuarioCompanySection from "kadesh/components/profile/sales/workspaces/members/AgregarUsuarioCompanySection";

export default function AgregarUsuarioCompanyPage() {
  return (
    <PanelShell selectedTab="workspaces" title="Agregar usuario">
      <div className="pb-6">
        <AgregarUsuarioCompanySection />
      </div>
    </PanelShell>
  );
}
