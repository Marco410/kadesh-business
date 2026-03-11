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
      <div className="flex gap-1 p-1 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a] w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("vendedores")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "vendedores"
              ? "bg-white dark:bg-[#1e1e1e] text-[#212121] dark:text-white shadow-sm"
              : "text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-white"
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
              ? "bg-white dark:bg-[#1e1e1e] text-[#212121] dark:text-white shadow-sm"
              : "text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-white"
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
