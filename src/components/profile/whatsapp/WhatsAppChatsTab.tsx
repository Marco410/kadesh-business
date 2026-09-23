"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  WHATSAPP_CONVERSATIONS_QUERY,
  type WhatsAppConversationSummary,
  type WhatsAppConversationsResponse,
  type WhatsAppConversationsVariables,
} from "./queries";
import WhatsAppChatPanel from "./WhatsAppChatPanel";
import WhatsAppNewConversationModal from "./WhatsAppNewConversationModal";

const CONVERSATIONS_POLL_MS = 8000;

type ConversationRow = WhatsAppConversationSummary & { isNew?: boolean };

/** Tab "Chats": bandeja estilo WhatsApp — lista de clientes con conversación a la izquierda, el
 * chat abierto a la derecha, y un botón para arrancar una conversación con un cliente nuevo. */
export function WhatsAppChatsTab({ companyId }: { companyId: string | null }) {
  const [selected, setSelected] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [manualLeads, setManualLeads] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const { data, loading, error } = useQuery<
    WhatsAppConversationsResponse,
    WhatsAppConversationsVariables
  >(WHATSAPP_CONVERSATIONS_QUERY, {
    variables: { companyId: companyId ?? "" },
    skip: !companyId,
    pollInterval: CONVERSATIONS_POLL_MS,
    fetchPolicy: "cache-and-network",
  });

  const conversations = useMemo<ConversationRow[]>(() => {
    const fetched = data?.whatsappConversations.conversations ?? [];
    const byLeadId = new Map<string, ConversationRow>();
    for (const c of fetched) byLeadId.set(c.leadId, c);
    // Clientes agregados en esta sesión que todavía no tienen ningún mensaje: se muestran
    // igual (para poder abrirles el chat), marcados como "Nuevo", hasta que el back los
    // recoja solo por tener ya un mensaje real.
    for (const lead of manualLeads) {
      if (byLeadId.has(lead.id)) continue;
      byLeadId.set(lead.id, {
        leadId: lead.id,
        leadName: lead.name,
        lastMessageBody: "",
        lastMessageAt: "",
        lastMessageDirection: "unknown",
        isNew: true,
      });
    }
    return Array.from(byLeadId.values()).sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return -1;
      if (!b.lastMessageAt) return 1;
      return (
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    });
  }, [data, manualLeads]);

  return (
    <div className="flex h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
      <WhatsAppNewConversationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onCreated={(lead) => {
          setManualLeads((prev) => [lead, ...prev.filter((l) => l.id !== lead.id)]);
          setSelected(lead);
          setIsNewModalOpen(false);
        }}
      />

      <aside
        className={`w-full shrink-0 flex-col border-r border-[#e0e0e0] dark:border-[#3a3a3a] sm:flex sm:w-80 ${
          selected ? "hidden" : "flex"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#e0e0e0] p-4 dark:border-[#3a3a3a]">
          <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
            Conversaciones
          </h3>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-xs font-semibold text-white hover:bg-orange-600"
          >
            <HugeiconsIcon icon={Add01Icon} size={14} />
            Nueva
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error ? (
            <p className="p-4 text-sm text-red-600 dark:text-red-400">
              No se pudieron cargar las conversaciones.
            </p>
          ) : loading && conversations.length === 0 ? (
            <div className="flex justify-center py-8">
              <span className="size-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
                <HugeiconsIcon icon={WhatsappIcon} size={18} />
              </span>
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                Todavía no hay conversaciones. Empieza una con &quot;Nueva&quot;.
              </p>
            </div>
          ) : (
            <ul>
              {conversations.map((c) => {
                const isSelected = selected?.id === c.leadId;
                const preview = c.isNew
                  ? "Sin mensajes todavía"
                  : c.lastMessageDirection === "outbound"
                    ? `Tú: ${c.lastMessageBody}`
                    : c.lastMessageBody;
                return (
                  <li key={c.leadId}>
                    <button
                      type="button"
                      onClick={() => setSelected({ id: c.leadId, name: c.leadName })}
                      className={`flex w-full flex-col gap-0.5 border-b border-[#f0f0f0] px-4 py-3 text-left transition-colors dark:border-[#2a2a2a] ${
                        isSelected
                          ? "bg-orange-500/10"
                          : "hover:bg-black/[0.03] dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-[#212121] dark:text-white">
                          {c.leadName}
                        </span>
                        {c.isNew ? (
                          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            Nuevo
                          </span>
                        ) : (
                          <span className="shrink-0 text-[11px] text-[#9e9e9e]">
                            {formatDateShort(c.lastMessageAt)}
                          </span>
                        )}
                      </span>
                      <span className="truncate text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {preview}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <div
        className={`min-w-0 flex-1 flex-col sm:flex ${selected ? "flex" : "hidden"}`}
      >
        {selected ? (
          <>
            <div className="flex items-center gap-2 border-b border-[#e0e0e0] p-4 dark:border-[#3a3a3a]">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-[#616161] hover:bg-black/5 sm:hidden dark:text-[#b0b0b0] dark:hover:bg-white/10"
                aria-label="Volver a conversaciones"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
              </button>
              <h3 className="truncate text-sm font-semibold text-[#212121] dark:text-white">
                {selected.name}
              </h3>
            </div>
            <WhatsAppChatPanel
              key={selected.id}
              leadId={selected.id}
              className="min-h-0 flex-1"
            />
          </>
        ) : (
          <div className="hidden h-full flex-col items-center justify-center gap-3 text-center sm:flex">
            <span className="flex size-12 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
              <HugeiconsIcon icon={WhatsappIcon} size={22} />
            </span>
            <p className="max-w-xs text-sm text-[#616161] dark:text-[#b0b0b0]">
              Elige una conversación de la izquierda, o empieza una nueva.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
