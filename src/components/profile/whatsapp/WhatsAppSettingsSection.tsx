"use client";

import { useState } from "react";
import FeatureBetaBadge from "kadesh/components/profile/sales/planes/FeatureBetaBadge";
import { WhatsAppChatsTab } from "./WhatsAppChatsTab";
import { WhatsAppConfigTab } from "./WhatsAppConfigTab";

type WhatsAppTab = "chats" | "config";

export interface WhatsAppSettingsSectionProps {
  companyId: string | null;
  /** El plan actual de la empresa tiene WhatsApp marcado en beta. */
  beta?: boolean;
  /**
   * `whatsapp.configurar`: ve Configuración y puede conectar Meta.
   * Con solo `whatsapp.ver` entra a Chats (lo que el backend le deje ver).
   */
  canConfigure?: boolean;
}

/**
 * Contenedor de WhatsApp Business: "Chats" y, si hay permiso, "Configuración".
 * Sin permiso de configurar arranca en Chats.
 */
export function WhatsAppSettingsSection({
  companyId,
  beta = false,
  canConfigure = false,
}: WhatsAppSettingsSectionProps) {
  const [tab, setTab] = useState<WhatsAppTab>(
    canConfigure ? "config" : "chats",
  );

  const tabs: Array<{ id: WhatsAppTab; label: string }> = canConfigure
    ? [
        { id: "chats", label: "Chats" },
        { id: "config", label: "Configuración" },
      ]
    : [{ id: "chats", label: "Chats" }];

  const activeTab =
    !canConfigure && tab === "config" ? "chats" : tab;

  return (
    <div className="flex flex-col gap-4">
      {beta && activeTab === "chats" ? (
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-[#212121] dark:text-white">
            WhatsApp Business
          </h2>
          <FeatureBetaBadge />
        </div>
      ) : null}
      {tabs.length > 1 ? (
        <div
          role="tablist"
          aria-label="WhatsApp Business"
          className="inline-flex self-start rounded-xl bg-black/5 p-1 dark:bg-white/10"
        >
          {tabs.map((item) => {
            const selected = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={`h-10 min-w-28 rounded-lg px-4 text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                  selected
                    ? "bg-white text-[#212121] shadow-sm dark:bg-[#3a3a3a] dark:text-white"
                    : "text-[#616161] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {activeTab === "chats" ? (
        <WhatsAppChatsTab companyId={companyId} />
      ) : (
        <WhatsAppConfigTab companyId={companyId} beta={beta} />
      )}
    </div>
  );
}
