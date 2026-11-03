"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon, Calendar03Icon } from "@hugeicons/core-free-icons";
import VendedoresCalendarioTab from "./VendedoresCalendarioTab";
import VendedoresListTab from "./VendedoresListTab";

const VENDEDORES_TABS = ["vendedores", "calendario"] as const;
type VendedoresTab = (typeof VENDEDORES_TABS)[number];

interface VendedoresSectionProps {
  userId: string;
}

export default function VendedoresSection({ userId }: VendedoresSectionProps) {
  const [activeTab, setActiveTab] = useState<VendedoresTab>("vendedores");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 p-1 rounded-xl border border-dash-line bg-dash-surface-2 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("vendedores")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "vendedores"
              ? "bg-dash-surface text-dash-ink shadow-sm"
              : "text-dash-muted hover:text-dash-ink"
          }`}
        >
          <HugeiconsIcon icon={UserIcon} size={18} />
          Vendedores
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("calendario")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "calendario"
              ? "bg-dash-surface text-dash-ink shadow-sm"
              : "text-dash-muted hover:text-dash-ink"
          }`}
        >
          <HugeiconsIcon icon={Calendar03Icon} size={18} />
          Calendario
        </button>
      </div>

      {activeTab === "calendario" ? (
        <VendedoresCalendarioTab userId={userId} />
      ) : (
        <VendedoresListTab userId={userId} />
      )}
    </div>
  );
}
