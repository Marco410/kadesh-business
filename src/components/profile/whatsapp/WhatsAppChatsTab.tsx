"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  UserGroupIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
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

const CONVERSATIONS_POLL_MS = 8000;

type ConversationRow = WhatsAppConversationSummary & { isNew?: boolean };

type SelectedConversation = {
  target: WhatsAppChatTarget;
  name: string;
};

/** Tab "Chats": bandeja estilo WhatsApp — conversaciones a la izquierda (clientes y equipo), el
 * chat abierto a la derecha, y alta rápida para arrancar una conversación nueva. */
export function WhatsAppChatsTab({ companyId }: { companyId: string | null }) {
  const { user } = useUser();
  const canAssign = isAdminCompanyUser(user) || isPlatformAdminUser(user);

  const [selected, setSelected] = useState<SelectedConversation | null>(null);
  const [manualChats, setManualChats] = useState<SelectedConversation[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

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
      const id = c.leadId ?? c.teamMemberId;
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
        kind: chat.target.kind,
        name: chat.name,
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
          c.kind === selected.target.kind &&
          (c.leadId ?? c.teamMemberId) === selected.target.id,
      ) ?? null
    : null;

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
    <div className="flex h-[70vh] min-h-[420px] overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
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
                const id = (c.leadId ?? c.teamMemberId) as string;
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
                        setSelected({ target: { kind: c.kind, id }, name: c.name })
                      }
                      className={`flex w-full flex-col gap-0.5 border-b border-[#f0f0f0] px-4 py-3 text-left transition-colors dark:border-[#2a2a2a] ${
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
                              className="shrink-0 text-[#616161] dark:text-[#b0b0b0]"
                            />
                          ) : null}
                          <span className="truncate text-sm font-semibold text-[#212121] dark:text-white">
                            {c.name}
                          </span>
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
                      {c.kind === "team" ? (
                        <span className="text-[11px] font-medium text-[#616161] dark:text-[#b0b0b0]">
                          Chat interno
                        </span>
                      ) : c.assignedToName ? (
                        <span className="truncate text-[11px] text-[#616161] dark:text-[#b0b0b0]">
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
            <div className="flex flex-wrap items-center gap-2 border-b border-[#e0e0e0] p-4 dark:border-[#3a3a3a]">
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
              {selected.target.kind === "team" ? (
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-medium text-[#616161] dark:bg-white/10 dark:text-[#b0b0b0]">
                  Chat interno
                </span>
              ) : canAssign ? (
                <label className="ml-auto flex items-center gap-2 text-xs text-[#616161] dark:text-[#b0b0b0]">
                  <span className="hidden sm:inline">Asignado a</span>
                  <select
                    value={selectedRow?.assignedToId ?? ""}
                    disabled={assigning}
                    onChange={(e) => void handleAssign(e.target.value || null)}
                    className="h-9 max-w-44 rounded-lg border border-[#e0e0e0] bg-white px-2 text-xs text-[#212121] disabled:opacity-60 dark:border-[#3a3a3a] dark:bg-[#121212] dark:text-white"
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
                <span className="ml-auto text-xs text-[#616161] dark:text-[#b0b0b0]">
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
            <p className="max-w-xs text-sm text-[#616161] dark:text-[#b0b0b0]">
              Elige una conversación de la izquierda, o empieza una nueva.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
