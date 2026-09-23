"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Attachment01Icon, FileAttachmentIcon, SentIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  BUSINESS_LEAD_WHATSAPP_STATUS_QUERY,
  SEND_WHATSAPP_MEDIA_MESSAGE_MUTATION,
  SEND_WHATSAPP_MESSAGE_MUTATION,
  START_WHATSAPP_CONVERSATION_MUTATION,
  WHATSAPP_MESSAGES_QUERY,
  whatsappConversationWhere,
  type BusinessLeadWhatsappStatusResponse,
  type BusinessLeadWhatsappStatusVariables,
  type SendWhatsAppMediaMessageResponse,
  type SendWhatsAppMediaMessageVariables,
  type SendWhatsAppMessageResponse,
  type SendWhatsAppMessageVariables,
  type StartWhatsAppConversationResponse,
  type StartWhatsAppConversationVariables,
  type WhatsAppMessageItem,
  type WhatsAppMessagesResponse,
  type WhatsAppMessagesVariables,
} from "./queries";

const POLL_INTERVAL_MS = 5000;
const STATUS_POLL_MS = 15000;
const MEDIA_ACCEPT = "image/*,.pdf,.doc,.docx,.xls,.xlsx";

/** Con quién es la conversación: un cliente del CRM o alguien del propio equipo. */
export type WhatsAppChatTarget = { kind: "lead" | "team"; id: string };

export interface WhatsAppChatPanelProps {
  target: WhatsAppChatTarget;
  /** false pausa el polling (p. ej. modal cerrado o tab no visible). */
  active?: boolean;
  className?: string;
}

function templateStatusMessage(templateStatus: string | null): string {
  if (templateStatus === "rejected") {
    return "La plantilla para iniciar conversaciones fue rechazada por Meta. Contacta a soporte de Kadesh.";
  }
  if (templateStatus === "pending") {
    return "Tu plantilla para iniciar conversaciones está pendiente de aprobación de Meta. Vuelve en un rato.";
  }
  if (templateStatus === "approved") {
    return "";
  }
  return "Conecta WhatsApp en \"Configuración\" para poder escribirle primero.";
}

/**
 * Lista de mensajes + composer para un lead. Usado tanto dentro del modal (LeadCrmActions)
 * como embebido en el tab "Chats" del panel de WhatsApp Business.
 *
 * Si el lead nunca ha escrito (o hace más de 24h que no lo hace), WhatsApp no deja mandar texto
 * libre — solo una plantilla aprobada por Meta puede iniciar la conversación (regla de la
 * plataforma). En ese caso se muestra "Iniciar conversación" en vez del composer.
 */
export default function WhatsAppChatPanel({
  target,
  active = true,
  className = "",
}: WhatsAppChatPanelProps) {
  const leadId = target.kind === "lead" ? target.id : null;
  const teamMemberId = target.kind === "team" ? target.id : null;
  const targetVariables = { businessLeadId: leadId, teamMemberId };
  const messagesWhere = whatsappConversationWhere(target);
  const [draft, setDraft] = useState("");
  const [justStarted, setJustStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data, loading, startPolling, stopPolling } = useQuery<
    WhatsAppMessagesResponse,
    WhatsAppMessagesVariables
  >(WHATSAPP_MESSAGES_QUERY, {
    variables: { where: messagesWhere },
    skip: !active || !target.id,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (!active || !target.id) return;
    startPolling(POLL_INTERVAL_MS);
    return () => stopPolling();
  }, [active, target.id, startPolling, stopPolling]);

  const {
    data: statusData,
    loading: statusLoading,
    refetch: refetchStatus,
  } = useQuery<BusinessLeadWhatsappStatusResponse, BusinessLeadWhatsappStatusVariables>(
    BUSINESS_LEAD_WHATSAPP_STATUS_QUERY,
    {
      variables: targetVariables,
      skip: !active || !target.id,
      fetchPolicy: "cache-and-network",
      pollInterval: active ? STATUS_POLL_MS : 0,
    },
  );
  const status = statusData?.businessLeadWhatsappStatus;
  const canReplyFreely = status?.canReplyFreely ?? false;
  const templateStatus = status?.templateStatus ?? "none";

  const messages = data?.techWhatsAppMessages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const messagesQueryOptions = {
    query: WHATSAPP_MESSAGES_QUERY,
    variables: { where: messagesWhere },
  };
  const statusQueryOptions = {
    query: BUSINESS_LEAD_WHATSAPP_STATUS_QUERY,
    variables: targetVariables,
  };

  const [sendMessage, { loading: sending }] = useMutation<
    SendWhatsAppMessageResponse,
    SendWhatsAppMessageVariables
  >(SEND_WHATSAPP_MESSAGE_MUTATION, { refetchQueries: [messagesQueryOptions] });

  const [sendMedia, { loading: sendingMedia }] = useMutation<
    SendWhatsAppMediaMessageResponse,
    SendWhatsAppMediaMessageVariables
  >(SEND_WHATSAPP_MEDIA_MESSAGE_MUTATION, { refetchQueries: [messagesQueryOptions] });

  const [startConversation, { loading: starting }] = useMutation<
    StartWhatsAppConversationResponse,
    StartWhatsAppConversationVariables
  >(START_WHATSAPP_CONVERSATION_MUTATION, {
    refetchQueries: [messagesQueryOptions, statusQueryOptions],
  });

  const busy = sending || sendingMedia;

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || busy) return;
    try {
      const result = await sendMessage({ variables: { ...targetVariables, body } });
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

  const handleFileSelected = async (file: File | undefined) => {
    if (!file || busy) return;
    try {
      const result = await sendMedia({
        variables: { ...targetVariables, media: file, caption: draft.trim() || null },
      });
      const payload = result.data?.sendWhatsAppMediaMessage;
      if (!payload?.success) {
        sileo.error({ title: payload?.message || "No se pudo enviar el archivo" });
        return;
      }
      setDraft("");
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo enviar el archivo",
      });
    }
  };

  const handleStartConversation = async () => {
    try {
      const result = await startConversation({ variables: targetVariables });
      const payload = result.data?.startWhatsAppConversation;
      if (!payload?.success) {
        sileo.error({ title: payload?.message || "No se pudo iniciar la conversación" });
        return;
      }
      sileo.success({ title: payload.message || "Conversación iniciada" });
      // El mensaje ya se mandó, pero canReplyFreely sigue en false (mandar una plantilla no
      // abre la ventana libre, solo la respuesta del lead la abre) — sin este flag el botón se
      // ve exactamente igual de clicable y nada avisa que ya se mandó, así que un doble clic
      // (o el lag de hasta 5s del polling de mensajes) puede mandar el saludo dos veces.
      setJustStarted(true);
      setTimeout(() => setJustStarted(false), 8000);
      await refetchStatus();
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo iniciar la conversación",
      });
    }
  };

  const lastMessage = messages[messages.length - 1];
  const alreadySentFirstMessage =
    !canReplyFreely && (justStarted || lastMessage?.direction === "outbound");

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
            const isTemplate = msg.messageKind === "template";
            const tags = [
              isImported ? "importado" : null,
              isTemplate ? "inicio de conversación" : null,
              msg.status === "failed" ? "no enviado" : null,
            ].filter(Boolean);
            const tagText = tags.length > 0 ? ` · ${tags.join(" · ")}` : "";

            const mediaContent =
              msg.mediaType === "image" && msg.mediaUrl ? (
                <img
                  src={msg.mediaUrl}
                  alt={msg.mediaFileName || "Imagen"}
                  className="mb-1.5 max-h-64 w-full rounded-lg object-cover"
                />
              ) : msg.mediaType === "document" && msg.mediaUrl ? (
                <a
                  href={msg.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-1.5 flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-sm font-medium hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                >
                  <HugeiconsIcon icon={FileAttachmentIcon} size={16} className="shrink-0" />
                  <span className="truncate">{msg.mediaFileName || "Documento"}</span>
                </a>
              ) : null;

            if (msg.direction === "unknown") {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="max-w-[85%] rounded-2xl border border-dashed border-[#e0e0e0] bg-white/60 px-4 py-2 text-sm dark:border-[#3a3a3a] dark:bg-[#2a2a2a]/60">
                    {msg.senderLabel && (
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                        {msg.senderLabel}
                      </p>
                    )}
                    {mediaContent}
                    {msg.body && (
                      <p className="whitespace-pre-wrap break-words text-[#212121] dark:text-white">
                        {msg.body}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-[#616161] dark:text-[#9e9e9e]">
                      {formatDateShort(msg.createdAt)}
                      {tagText}
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
                  {mediaContent}
                  {msg.body && <p className="whitespace-pre-wrap break-words">{msg.body}</p>}
                  <p className="mt-1 text-[10px] text-[#616161] dark:text-[#9e9e9e]">
                    {formatDateShort(msg.createdAt)}
                    {tagText}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {statusLoading && !statusData ? (
        <div className="flex justify-center border-t border-[#e0e0e0] bg-white p-3 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
          <span className="size-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      ) : canReplyFreely ? (
        <div className="p-3 border-t border-[#e0e0e0] dark:border-[#3a3a3a] flex items-end gap-2 bg-white dark:bg-[#1e1e1e]">
          <input
            ref={fileInputRef}
            type="file"
            accept={MEDIA_ACCEPT}
            className="hidden"
            onChange={(e) => {
              void handleFileSelected(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-lg p-2.5 text-[#616161] transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 dark:text-[#b0b0b0] dark:hover:bg-white/10"
            aria-label="Adjuntar imagen o documento"
          >
            <HugeiconsIcon icon={Attachment01Icon} size={20} />
          </button>
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
            disabled={busy}
            className="flex-1 resize-none rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] px-3 py-2 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={busy || !draft.trim()}
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
      ) : (
        <div className="p-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a] bg-white text-center dark:bg-[#1e1e1e]">
          {templateStatus === "approved" ? (
            <>
              <button
                type="button"
                onClick={() => void handleStartConversation()}
                disabled={starting || justStarted}
                className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {starting
                  ? "Enviando..."
                  : alreadySentFirstMessage
                    ? "Reenviar mensaje de inicio"
                    : "Iniciar conversación"}
              </button>
              <p className="mt-2 text-xs text-[#9e9e9e] dark:text-[#888]">
                {alreadySentFirstMessage
                  ? "Ya le mandaste el mensaje de inicio. Podrás escribir libre en cuanto te conteste; si no contesta, puedes reenviarlo."
                  : "WhatsApp exige este mensaje fijo para iniciar la plática con un lead nuevo."}
              </p>
            </>
          ) : (
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
              {templateStatusMessage(templateStatus)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
