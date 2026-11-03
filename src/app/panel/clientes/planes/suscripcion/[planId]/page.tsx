"use client";

import PanelShell from "kadesh/components/panel/PanelShell";
import StripeSubscriptionWrapper from "kadesh/components/profile/sales/planes/StripeSubscriptionWrapper";

export default function SuscripcionPage() {
  return (
    <PanelShell selectedTab="planes" title="Suscribirse">
      <div className="mx-auto max-w-7xl">
        <StripeSubscriptionWrapper />
      </div>
    </PanelShell>
  );
}
