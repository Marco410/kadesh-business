"use client";

import PanelShell from "kadesh/components/panel/PanelShell";
import StripeCreditPurchaseWrapper from "kadesh/components/panel/creditos/StripeCreditPurchaseWrapper";

export default function CompraCreditosPage() {
  return (
    <PanelShell selectedTab="creditos" title="Comprar créditos">
      <div className="mx-auto max-w-7xl">
        <StripeCreditPurchaseWrapper />
      </div>
    </PanelShell>
  );
}
