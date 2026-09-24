"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Attachment01Icon, FileAttachmentIcon, SentIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  BUSINESS_LEAD_WHATSAPP_STATUS_QUERY,
  SEND_WHATSAPP_MEDIA_MESSAGE_MUTATION,
  SEND_WHATSAPP_MESSAGE_MUTATION,
  START_WHATSAPP_CONVERSATION_MUTATION,
  WHATSAPP_MESSAGES_PAGE_SIZE,
  WHATSAPP_MESSAGES_QUERY,
  WHATSAPP_NEWEST_FIRST,
  WHATSAPP_OLDEST_FIRST,
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
const NEAR_EDGE_PX = 120;
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
/** Junta lotes de mensajes sin repetir ninguno (por id), en orden cronológico. */
function mergeMessages(
  current: WhatsAppMessageItem[],
  incoming: WhatsAppMessageItem[],
  position: "start" | "end",
): WhatsAppMessageItem[] {
  const known = new Set(current.map((m) => m.id));
  const fresh = incoming.filter((m) => !known.has(m.id));
  if (fresh.length === 0) return current;
  return position === "start" ? [...fresh, ...current] : [...current, ...fresh];
}

export default function WhatsAppChatPanel({
  target,
  active = true,
  className = "",
}: WhatsAppChatPanelProps) {
  const { kind, id: targetId } = target;
  const leadId = kind === "lead" ? targetId : null;
  const teamMemberId = kind === "team" ? targetId : null;
  const targetVariables = { businessLeadId: leadId, teamMemberId };
  const client = useApolloClient();

  const [draft, setDraft] = useState("");
  const [justStarted, setJustStarted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Los mensajes se traen de a páginas: al abrir, solo los ÚLTIMOS; los anteriores se piden al
  // subir con el scroll. Antes se traían los 200 más viejos y se bajaba con animación hasta el
  // final, así que se veía el arranque de la conversación y no lo reciente.
  const [messages, setMessages] = useState<WhatsAppMessageItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const olderInFlight = useRef(false);
  // Qué hacer con el scroll cuando cambie la lista (se decide justo antes de cambiarla).
  const scrollIntent = useRef<"bottom" | "bottom-smooth" | "keep-position" | null>(null);
  const heightBeforePrepend = useRef(0);

  const fetchMessages = useCallback(
    async (variables: Omit<WhatsAppMessagesVariables, "where">) => {
      const result = await client.query<WhatsAppMessagesResponse, WhatsAppMessagesVariables>({
        query: WHATSAPP_MESSAGES_QUERY,
        variables: { where: whatsappConversationWhere({ kind, id: targetId }), ...variables },
        fetchPolicy: "network-only",
      });
      return [...result.data.techWhatsAppMessages];
    },
    [client, kind, targetId],
  );

  // Primera página: los últimos mensajes, ya posicionados abajo (sin animación).
  useEffect(() => {
    if (!active || !targetId) return;
    let cancelled = false;
    void (async () => {
      try {
        const page = await fetchMessages({
          orderBy: WHATSAPP_NEWEST_FIRST,
          take: WHATSAPP_MESSAGES_PAGE_SIZE,
        });
        if (cancelled) return;
        scrollIntent.current = "bottom";
        setMessages(page.reverse());
        setHasMore(page.length === WHATSAPP_MESSAGES_PAGE_SIZE);
      } catch {
        // sin red: se queda vacío y el polling lo reintenta al siguiente ciclo
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, targetId, fetchMessages]);

  const newestId = messages[messages.length - 1]?.id ?? null;

  const isNearBottom = () => {
    const el = scrollRef.current;
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_EDGE_PX;
  };

  /** Trae lo que llegó después del último mensaje que tenemos. `forceScroll` = lo mandé yo. */
  const syncNewer = useCallback(
    async (forceScroll: boolean) => {
      try {
        const fresh = newestId
          ? await fetchMessages({
              orderBy: WHATSAPP_OLDEST_FIRST,
              take: 100,
              skip: 1,
              cursor: { id: newestId },
            })
          : await fetchMessages({
              orderBy: WHATSAPP_NEWEST_FIRST,
              take: WHATSAPP_MESSAGES_PAGE_SIZE,
            }).then((page) => page.reverse());
        if (fresh.length === 0) return;
        // Solo baja solo si ya estabas abajo (o si lo mandaste tú): si subiste a leer el
        // historial, un mensaje nuevo no te jala de regreso.
        scrollIntent.current = forceScroll || isNearBottom() ? "bottom-smooth" : null;
        setMessages((prev) => mergeMessages(prev, fresh, "end"));
      } catch {
        // el siguiente ciclo lo reintenta
      }
    },
    [fetchMessages, newestId],
  );

  useEffect(() => {
    if (!active || !targetId || !loaded) return;
    const timer = setInterval(() => void syncNewer(false), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [active, targetId, loaded, syncNewer]);

  /** Trae la página anterior a la más vieja que tenemos, sin mover lo que estás leyendo. */
  const loadOlder = async () => {
    const oldestId = messages[0]?.id;
    if (!oldestId || olderInFlight.current || !hasMore) return;
    olderInFlight.current = true;
    setLoadingOlder(true);
    try {
      const page = await fetchMessages({
        orderBy: WHATSAPP_NEWEST_FIRST,
        take: WHATSAPP_MESSAGES_PAGE_SIZE,
        skip: 1,
        cursor: { id: oldestId },
      });
      heightBeforePrepend.current = scrollRef.current?.scrollHeight ?? 0;
      scrollIntent.current = "keep-position";
      setMessages((prev) => mergeMessages(prev, page.reverse(), "start"));
      setHasMore(page.length === WHATSAPP_MESSAGES_PAGE_SIZE);
    } catch {
      // se puede volver a intentar subiendo otra vez
    } finally {
      olderInFlight.current = false;
      setLoadingOlder(false);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop < NEAR_EDGE_PX) void loadOlder();
  };

  useLayoutEffect(() => {
    const el = scrollRef.current;
    const intent = scrollIntent.current;
    scrollIntent.current = null;
    if (!el || !intent) return;
    if (intent === "bottom") {
      el.scrollTop = el.scrollHeight;
    } else if (intent === "bottom-smooth") {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } else {
      el.scrollTop += el.scrollHeight - heightBeforePrepend.current;
    }
  }, [messages]);

  const {
    data: statusData,
    loading: statusLoading,
    refetch: refetchStatus,
  } = useQuery<BusinessLeadWhatsappStatusResponse, BusinessLeadWhatsappStatusVariables>(
    BUSINESS_LEAD_WHATSAPP_STATUS_QUERY,
    {
      variables: targetVariables,
      skip: !active || !targetId,
      fetchPolicy: "cache-and-network",
      pollInterval: active ? STATUS_POLL_MS : 0,
    },
  );
  const status = statusData?.businessLeadWhatsappStatus;
  const canReplyFreely = status?.canReplyFreely ?? false;
  const templateStatus = status?.templateStatus ?? "none";

  const [sendMessage, { loading: sending }] = useMutation<
    SendWhatsAppMessageResponse,
    SendWhatsAppMessageVariables
  >(SEND_WHATSAPP_MESSAGE_MUTATION);

  const [sendMedia, { loading: sendingMedia }] = useMutation<
    SendWhatsAppMediaMessageResponse,
    SendWhatsAppMediaMessageVariables
  >(SEND_WHATSAPP_MEDIA_MESSAGE_MUTATION);

  const [startConversation, { loading: starting }] = useMutation<
    StartWhatsAppConversationResponse,
    StartWhatsAppConversationVariables
  >(START_WHATSAPP_CONVERSATION_MUTATION, {
    refetchQueries: [
      { query: BUSINESS_LEAD_WHATSAPP_STATUS_QUERY, variables: targetVariables },
    ],
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
        // aun si falló se guarda como "no enviado": se muestra en el chat
        await syncNewer(true);
        return;
      }
      setDraft("");
      await syncNewer(true);
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
        await syncNewer(true);
        return;
      }
      setDraft("");
      await syncNewer(true);
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
      await Promise.all([refetchStatus(), syncNewer(true)]);
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
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-3 bg-[#f5f5f5] dark:bg-[#161616]"
      >
        {hasMore && messages.length > 0 ? (
          <div className="flex justify-center pb-1">
            {loadingOlder ? (
              <span className="size-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            ) : (
              <button
                type="button"
                onClick={() => void loadOlder()}
                className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-[#616161] hover:bg-black/10 dark:bg-white/10 dark:text-[#b0b0b0] dark:hover:bg-white/15"
              >
                Ver mensajes anteriores
              </button>
            )}
          </div>
        ) : null}
        {!loaded ? (
          <div className="flex justify-center py-6">
            <span className="animate-spin size-8 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] py-4 text-center">
            Todavía no hay mensajes en esta conversación.
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
