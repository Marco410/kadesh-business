"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  UserGroupIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import { useUser } from "kadesh/utils/UserContext";
import { isAdminCompanyUser, isPlatformAdminUser } from "kadesh/utils/user-roles";
import {
  ASSIGN_WHATSAPP_CONVERSATION_MUTATION,
  COMPANY_WHATSAPP_TEAM_QUERY,
  WHATSAPP_CONVERSATIONS_QUERY,
  type AssignWhatsAppConversationResponse,
  type AssignWhatsAppConversationVariables,
  type CompanyWhatsappTeamResponse,
  type CompanyWhatsappTeamVariables,
  type WhatsAppConversationSummary,
  type WhatsAppConversationsResponse,
  type WhatsAppConversationsVariables,
} from "./queries";
import WhatsAppChatPanel, { type WhatsAppChatTarget } from "./WhatsAppChatPanel";
import WhatsAppNewConversationModal from "./WhatsAppNewConversationModal";
import WhatsAppSaveContactModal from "./WhatsAppSaveContactModal";

const CONVERSATIONS_POLL_MS = 8000;

type ConversationRow = WhatsAppConversationSummary & { isNew?: boolean };

/** Id con el que se abre el chat: el del cliente, el del compañero, o los últimos 10 dígitos. */
function conversationId(c: WhatsAppConversationSummary): string {
  return (c.leadId ?? c.teamMemberId ?? c.phoneKey) as string;
}

type SelectedConversation = {
  target: WhatsAppChatTarget;
  name: string;
  /** Teléfono conocido al abrir (p. ej. recién agregado); la lista lo trae del back. */
  phone?: string | null;
};

/** Tab "Chats": bandeja estilo WhatsApp — conversaciones a la izquierda (clientes y equipo), el
 * chat abierto a la derecha, y alta rápida para arrancar una conversación nueva. */
export function WhatsAppChatsTab({ companyId }: { companyId: string | null }) {
  const { user } = useUser();
  const canAssign = isAdminCompanyUser(user) || isPlatformAdminUser(user);

  const [selected, setSelected] = useState<SelectedConversation | null>(null);
  const [manualChats, setManualChats] = useState<SelectedConversation[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSaveContactOpen, setIsSaveContactOpen] = useState(false);

  const conversationsQueryOptions = {
    query: WHATSAPP_CONVERSATIONS_QUERY,
    variables: { companyId: companyId ?? "" },
  };

  const { data, loading, error } = useQuery<
    WhatsAppConversationsResponse,
    WhatsAppConversationsVariables
  >(WHATSAPP_CONVERSATIONS_QUERY, {
    variables: { companyId: companyId ?? "" },
    skip: !companyId,
    pollInterval: CONVERSATIONS_POLL_MS,
    fetchPolicy: "cache-and-network",
  });

  const { data: teamData } = useQuery<
    CompanyWhatsappTeamResponse,
    CompanyWhatsappTeamVariables
  >(COMPANY_WHATSAPP_TEAM_QUERY, {
    variables: { companyId: companyId ?? "" },
    skip: !companyId || !canAssign,
  });
  const teamMembers = teamData?.companyWhatsappTeam.members ?? [];

  const [assignConversation, { loading: assigning }] = useMutation<
    AssignWhatsAppConversationResponse,
    AssignWhatsAppConversationVariables
  >(ASSIGN_WHATSAPP_CONVERSATION_MUTATION, {
    refetchQueries: [conversationsQueryOptions],
  });

  const conversations = useMemo<ConversationRow[]>(() => {
    const fetched = data?.whatsappConversations.conversations ?? [];
    const byKey = new Map<string, ConversationRow>();
    const keyOf = (kind: string, id: string) => `${kind}:${id}`;

    for (const c of fetched) {
      const id = conversationId(c);
      if (id) byKey.set(keyOf(c.kind, id), c);
    }
    // Chats abiertos en esta sesión que todavía no tienen ningún mensaje: se muestran igual
    // (para poder escribirles), marcados como "Nuevo", hasta que el back los recoja solo.
    for (const chat of manualChats) {
      const key = keyOf(chat.target.kind, chat.target.id);
      if (byKey.has(key)) continue;
      byKey.set(key, {
        leadId: chat.target.kind === "lead" ? chat.target.id : null,
        teamMemberId: chat.target.kind === "team" ? chat.target.id : null,
        phoneKey: chat.target.kind === "phone" ? chat.target.id : null,
        kind: chat.target.kind,
        name: chat.name,
        phone: chat.phone ?? null,
        assignedToId: null,
        assignedToName: null,
        lastMessageBody: "",
        lastMessageAt: "",
        lastMessageDirection: "unknown",
        isNew: true,
      });
    }

    return Array.from(byKey.values()).sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return -1;
      if (!b.lastMessageAt) return 1;
      return (
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    });
  }, [data, manualChats]);

  const selectedRow = selected
    ? conversations.find(
        (c) =>
          c.kind === selected.target.kind && conversationId(c) === selected.target.id,
      ) ?? null
    : null;

  // El teléfono de la lista (dato vivo del back) gana; el de al abrir cubre chats recién creados.
  const chatPhone = selectedRow?.phone ?? selected?.phone ?? null;

  const handleAssign = async (salesPersonId: string | null) => {
    if (!selected || selected.target.kind !== "lead") return;
    try {
      const result = await assignConversation({
        variables: { businessLeadId: selected.target.id, salesPersonId },
      });
      const payload = result.data?.assignWhatsAppConversation;
      if (!payload?.success) {
        sileo.error({ title: payload?.message || "No se pudo asignar el chat" });
        return;
      }
      sileo.success({ title: payload.message });
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo asignar el chat",
      });
    }
  };

  return (
    <div className="flex h-[70vh] min-h-[420px] overflow-hidden rounded-3xl border border-dash-line bg-dash-surface shadow-sm">
      <WhatsAppNewConversationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        companyId={companyId}
        onCreated={(conversation) => {
          setManualChats((prev) => [
            conversation,
            ...prev.filter(
              (c) =>
                !(
                  c.target.kind === conversation.target.kind &&
                  c.target.id === conversation.target.id
                ),
            ),
          ]);
          setSelected(conversation);
          setIsNewModalOpen(false);
        }}
      />

      {selected?.target.kind === "phone" ? (
        <WhatsAppSaveContactModal
          key={selected.target.id}
          isOpen={isSaveContactOpen}
          onClose={() => setIsSaveContactOpen(false)}
          phone={chatPhone ?? `+${selected.target.id}`}
          phoneKey={selected.target.id}
          // Sin nombre de perfil el nombre de la fila es el teléfono: no sirve de sugerencia.
          suggestedName={
            selectedRow && selectedRow.name !== selectedRow.phone ? selectedRow.name : ""
          }
          onSaved={(client) => {
            const saved = { target: { kind: "lead" as const, id: client.id }, name: client.name, phone: chatPhone };
            setManualChats((prev) => [saved, ...prev.filter((c) => c.target.id !== client.id)]);
            setSelected(saved);
            setIsSaveContactOpen(false);
          }}
        />
      ) : null}

      <aside
        className={`w-full shrink-0 flex-col border-r border-dash-line sm:flex sm:w-80 ${
          selected ? "hidden" : "flex"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-dash-line p-4">
          <h3 className="text-sm font-semibold text-dash-ink">
            Conversaciones
          </h3>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full dash-grad-accent px-3 text-xs font-semibold text-white hover:shadow-dash-accent-lift shadow-dash-accent"
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
              <p className="text-sm text-dash-muted">
                Todavía no hay conversaciones. Empieza una con &quot;Nueva&quot;.
              </p>
            </div>
          ) : (
            <ul>
              {conversations.map((c) => {
                const id = conversationId(c);
                const isSelected =
                  selected?.target.kind === c.kind && selected?.target.id === id;
                const preview = c.isNew
                  ? "Sin mensajes todavía"
                  : c.lastMessageDirection === "outbound"
                    ? `Tú: ${c.lastMessageBody}`
                    : c.lastMessageBody;
                return (
                  <li key={`${c.kind}:${id}`}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelected({
                          target: { kind: c.kind, id },
                          name: c.name,
                          phone: c.phone,
                        })
                      }
                      className={`flex w-full flex-col gap-0.5 border-b border-dash-line px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? "bg-orange-500/10"
                          : "hover:bg-black/[0.03] dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          {c.kind === "team" ? (
                            <HugeiconsIcon
                              icon={UserGroupIcon}
                              size={14}
                              className="shrink-0 text-dash-muted"
                            />
                          ) : null}
                          <span className="truncate text-sm font-semibold text-dash-ink">
                            {c.name}
                          </span>
                        </span>
                        {c.isNew ? (
                          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            Nuevo
                          </span>
                        ) : (
                          <span className="shrink-0 text-[11px] text-dash-faint">
                            {formatDateShort(c.lastMessageAt)}
                          </span>
                        )}
                      </span>
                      <span className="truncate text-xs text-dash-muted">
                        {preview}
                      </span>
                      {c.kind === "team" ? (
                        <span className="text-[11px] font-medium text-dash-muted">
                          Chat interno
                        </span>
                      ) : c.kind === "phone" ? (
                        <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                          Número nuevo · aún no es cliente
                        </span>
                      ) : c.assignedToName ? (
                        <span className="truncate text-[11px] text-dash-muted">
                          Asignado a {c.assignedToName}
                        </span>
                      ) : canAssign ? (
                        <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                          Sin asignar
                        </span>
                      ) : null}
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
            <div className="flex flex-wrap items-center gap-2 border-b border-dash-line p-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-dash-muted hover:bg-dash-hover sm:hidden"
                aria-label="Volver a conversaciones"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
              </button>
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                {selected.target.kind === "lead" ? (
                  <Link
                    href={Routes.panelLead(selected.target.id)}
                    title="Ver detalles del cliente"
                    className="truncate text-sm font-semibold text-dash-ink hover:text-orange-500 hover:underline dark:hover:text-orange-400"
                  >
                    {selected.name}
                  </Link>
                ) : (
                  <h3 className="truncate text-sm font-semibold text-dash-ink">
                    {selected.name}
                  </h3>
                )}
                {chatPhone ? (
                  <span className="shrink-0 text-xs text-dash-muted">
                    {chatPhone}
                  </span>
                ) : null}
              </div>
              {selected.target.kind === "team" ? (
                <span className="rounded-full bg-dash-surface-2 px-2 py-0.5 text-[11px] font-medium text-dash-muted">
                  Chat interno
                </span>
              ) : selected.target.kind === "phone" ? (
                canAssign ? (
                  <button
                    type="button"
                    onClick={() => setIsSaveContactOpen(true)}
                    className="ml-auto h-9 rounded-full dash-grad-accent px-3 text-xs font-semibold text-white hover:shadow-dash-accent-lift shadow-dash-accent"
                  >
                    Guardar como cliente
                  </button>
                ) : null
              ) : canAssign ? (
                <label className="ml-auto flex items-center gap-2 text-xs text-dash-muted">
                  <span className="hidden sm:inline">Asignado a</span>
                  <select
                    value={selectedRow?.assignedToId ?? ""}
                    disabled={assigning}
                    onChange={(e) => void handleAssign(e.target.value || null)}
                    className="h-9 max-w-44 rounded-lg border border-dash-line bg-dash-surface px-2 text-xs text-dash-ink disabled:opacity-60"
                  >
                    <option value="">Nadie (solo admins)</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : selectedRow?.assignedToName ? (
                <span className="ml-auto text-xs text-dash-muted">
                  Asignado a {selectedRow.assignedToName}
                </span>
              ) : null}
            </div>
            <WhatsAppChatPanel
              key={`${selected.target.kind}:${selected.target.id}`}
              target={selected.target}
              className="min-h-0 flex-1"
            />
          </>
        ) : (
          <div className="hidden h-full flex-col items-center justify-center gap-3 text-center sm:flex">
            <span className="flex size-12 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
              <HugeiconsIcon icon={WhatsappIcon} size={22} />
            </span>
            <p className="max-w-xs text-sm text-dash-muted">
              Elige una conversación de la izquierda, o empieza una nueva.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
