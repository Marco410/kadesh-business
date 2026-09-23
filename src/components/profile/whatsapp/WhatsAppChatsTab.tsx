"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { WhatsappIcon } from "@hugeicons/core-free-icons";
import { useUser } from "kadesh/utils/UserContext";
import ClientLeadAutocomplete from "kadesh/components/shared/ClientLeadAutocomplete";
import WhatsAppChatPanel from "./WhatsAppChatPanel";

/** Tab "Chats": elige un lead y ve/manda mensajes de WhatsApp con él, sin salir del panel. */
export function WhatsAppChatsTab() {
  const { user } = useUser();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-8">
      <ClientLeadAutocomplete
        userId={user?.id ?? ""}
        selectedLeadId={selectedLeadId}
        onSelectedLeadIdChange={setSelectedLeadId}
        label="Lead"
        placeholder="Buscar lead por nombre"
      />

      <div className="mt-4">
        {selectedLeadId ? (
          <WhatsAppChatPanel
            key={selectedLeadId}
            leadId={selectedLeadId}
            className="h-[520px] overflow-hidden rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a]"
          />
        ) : (
          <div className="flex h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#e0e0e0] text-center dark:border-[#3a3a3a]">
            <span className="flex size-12 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
              <HugeiconsIcon icon={WhatsappIcon} size={22} />
            </span>
            <p className="max-w-xs text-sm text-[#616161] dark:text-[#b0b0b0]">
              Elige un lead arriba para ver su conversación de WhatsApp (mensajes recibidos,
              enviados e importados).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
