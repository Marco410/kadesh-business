"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  SEND_WHATSAPP_MESSAGE_MUTATION,
  WHATSAPP_MESSAGES_QUERY,
  type SendWhatsAppMessageResponse,
  type SendWhatsAppMessageVariables,
  type WhatsAppMessageItem,
  type WhatsAppMessagesResponse,
  type WhatsAppMessagesVariables,
} from "./queries";

const POLL_INTERVAL_MS = 5000;

export interface WhatsAppChatPanelProps {
  leadId: string;
  /** false pausa el polling (p. ej. modal cerrado o tab no visible). */
  active?: boolean;
  className?: string;
}

/**
 * Lista de mensajes + composer para un lead. Usado tanto dentro del modal (LeadCrmActions)
 * como embebido en el tab "Chats" del panel de WhatsApp Business.
 */
export default function WhatsAppChatPanel({
  leadId,
  active = true,
  className = "",
}: WhatsAppChatPanelProps) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data, loading, startPolling, stopPolling } = useQuery<
    WhatsAppMessagesResponse,
    WhatsAppMessagesVariables
  >(WHATSAPP_MESSAGES_QUERY, {
    variables: { businessLeadId: leadId },
    skip: !active || !leadId,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!active || !leadId) return;
    startPolling(POLL_INTERVAL_MS);
    return () => stopPolling();
  }, [active, leadId, startPolling, stopPolling]);

  const messages = data?.techWhatsAppMessages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const [sendMessage, { loading: sending }] = useMutation<
    SendWhatsAppMessageResponse,
    SendWhatsAppMessageVariables
  >(SEND_WHATSAPP_MESSAGE_MUTATION, {
    refetchQueries: [
      { query: WHATSAPP_MESSAGES_QUERY, variables: { businessLeadId: leadId } },
    ],
  });

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    try {
      const result = await sendMessage({ variables: { businessLeadId: leadId, body } });
      const payload = result.data?.sendWhatsAppMessage;
      if (!payload?.success) {
        sileo.error({ title: payload?.message || "No se pudo enviar el mensaje" });
        return;
      }
      setDraft("");
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo enviar el mensaje",
      });
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-3 bg-[#f5f5f5] dark:bg-[#161616]">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-6">
            <span className="animate-spin size-8 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-4 text-center">
            Todavía no hay mensajes con este lead.
          </p>
        ) : (
          messages.map((msg: WhatsAppMessageItem) => {
            const isImported = msg.source === "imported";
            const importedTag = isImported ? " · importado" : "";

            if (msg.direction === "unknown") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="max-w-[85%] rounded-2xl border border-dashed border-[#e0e0e0] bg-white/60 px-4 py-2 text-sm dark:border-[#3a3a3a] dark:bg-[#2a2a2a]/60">
                    {msg.senderLabel && (
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                        {msg.senderLabel}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words text-[#212121] dark:text-white">
                      {msg.body}
                    </p>
                    <p className="mt-1 text-[10px] text-[#616161] dark:text-[#9e9e9e]">
                      {formatDateShort(msg.createdAt)}
                      {importedTag}
                    </p>
                  </div>
                </div>
              );
            }

            const isOutbound = msg.direction === "outbound";
            return (
              <div
                key={msg.id}
                className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isOutbound
                      ? "bg-[#DCF8C6] dark:bg-emerald-900/40 text-[#212121] dark:text-white rounded-br-sm"
                      : "bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-white rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                  <p className="mt-1 text-[10px] text-[#616161] dark:text-[#9e9e9e]">
                    {formatDateShort(msg.createdAt)}
                    {msg.status === "failed" ? " · no enviado" : ""}
                    {importedTag}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-[#e0e0e0] dark:border-[#3a3a3a] flex items-end gap-2 bg-white dark:bg-[#1e1e1e]">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          rows={1}
          placeholder="Escribe un mensaje..."
          disabled={sending}
          className="flex-1 resize-none rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] px-3 py-2 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending || !draft.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 p-2.5 text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Enviar mensaje"
        >
          {sending ? (
            <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <HugeiconsIcon icon={SentIcon} size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
