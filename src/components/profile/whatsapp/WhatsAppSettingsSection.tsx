"use client";

import { useState } from "react";
import FeatureBetaBadge from "kadesh/components/profile/sales/planes/FeatureBetaBadge";
import { WhatsAppChatsTab } from "./WhatsAppChatsTab";
import { WhatsAppConfigTab } from "./WhatsAppConfigTab";

const WHATSAPP_TABS = [
  { id: "chats", label: "Chats" },
  { id: "config", label: "Configuración" },
] as const;

type WhatsAppTab = (typeof WHATSAPP_TABS)[number]["id"];

export interface WhatsAppSettingsSectionProps {
  companyId: string | null;
  /** El plan actual de la empresa tiene WhatsApp marcado en beta. */
  beta?: boolean;
}

/**
 * Contenedor de WhatsApp Business: "Chats" (conversación por lead, sin salir del panel) y
 * "Configuración" (conectar la Cloud API de Meta — BYOK, cada empresa trae su propia App).
 * Arranca en Configuración porque sin credenciales conectadas no hay nada que ver en Chats.
 */
export function WhatsAppSettingsSection({
  companyId,
  beta = false,
}: WhatsAppSettingsSectionProps) {
  const [tab, setTab] = useState<WhatsAppTab>("config");

  return (
    <div className="flex flex-col gap-4">
      {beta && tab === "chats" ? (
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-[#212121] dark:text-white">
            WhatsApp Business
          </h2>
          <FeatureBetaBadge />
        </div>
      ) : null}
      <div
        role="tablist"
        aria-label="WhatsApp Business"
        className="inline-flex self-start rounded-xl bg-black/5 p-1 dark:bg-white/10"
      >
        {WHATSAPP_TABS.map((item) => {
          const selected = item.id === tab;
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

      {tab === "chats" ? (
        <WhatsAppChatsTab companyId={companyId} />
      ) : (
        <WhatsAppConfigTab companyId={companyId} beta={beta} />
      )}
    </div>
  );
}
