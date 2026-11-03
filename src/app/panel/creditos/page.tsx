"use client";

import PanelShell from "kadesh/components/panel/PanelShell";
import { CreditsSection } from "kadesh/components/panel/creditos";

export default function CreditosPage() {
  return (
    <PanelShell selectedTab="creditos" title="Créditos">
      <div className="mx-auto max-w-7xl">
        <CreditsSection />
      </div>
    </PanelShell>
  );
}
