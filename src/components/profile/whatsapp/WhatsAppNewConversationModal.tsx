"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import {
  ADD_OWN_LEAD_MUTATION,
  type AddOwnLeadResult,
  type AddOwnLeadVariables,
} from "kadesh/components/profile/sales/lead";
import {
  COMPANY_WHATSAPP_TEAM_QUERY,
  type CompanyWhatsappTeamResponse,
  type CompanyWhatsappTeamVariables,
} from "./queries";
import type { WhatsAppChatTarget } from "./WhatsAppChatPanel";

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60";

type Mode = "cliente" | "equipo";

export interface WhatsAppNewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string | null;
  /** Abre el chat recién creado (cliente nuevo) o elegido (compañero de equipo). */
  onCreated: (conversation: { target: WhatsAppChatTarget; name: string }) => void;
}

/**
 * Arranca una conversación: con un cliente nuevo (alta rápida de nombre + teléfono, usando el
 * mismo `addOwnLead` del CRM) o con alguien del equipo (chat interno; no se crea nada, solo se
 * abre el chat con su teléfono de perfil).
 */
export default function WhatsAppNewConversationModal({
  isOpen,
  onClose,
  companyId,
  onCreated,
}: WhatsAppNewConversationModalProps) {
  const [mode, setMode] = useState<Mode>("cliente");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [addOwnLead, { loading }] = useMutation<
    AddOwnLeadResult,
    AddOwnLeadVariables
  >(ADD_OWN_LEAD_MUTATION);

  const { data: teamData, loading: teamLoading } = useQuery<
    CompanyWhatsappTeamResponse,
    CompanyWhatsappTeamVariables
  >(COMPANY_WHATSAPP_TEAM_QUERY, {
    variables: { companyId: companyId ?? "" },
    skip: !isOpen || !companyId,
    fetchPolicy: "cache-and-network",
  });
  const members = teamData?.companyWhatsappTeam.members ?? [];

  const canSave = name.trim().length > 0 && phone.trim().length > 0;

  const handleClose = () => {
    if (loading) return;
    setName("");
    setPhone("");
    setMode("cliente");
    onClose();
  };

  const handleSave = async () => {
    if (!canSave || loading) return;
    try {
      const result = await addOwnLead({
        variables: {
          input: {
            businessName: name.trim(),
            phone: phone.trim(),
            source: "WhatsApp",
          },
        },
      });
      const payload = result.data?.addOwnLead;
      if (!payload?.success || !payload.leadId) {
        sileo.error({ title: payload?.message || "No se pudo agregar el cliente" });
        return;
      }
      onCreated({
        target: { kind: "lead", id: payload.leadId },
        name: name.trim(),
      });
      setName("");
      setPhone("");
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo agregar el cliente",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[80]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-[#e0e0e0] bg-white p-5 shadow-2xl pointer-events-auto dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-[#212121] dark:text-white">
                Nueva conversación
              </h3>

              <div
                role="tablist"
                aria-label="Tipo de conversación"
                className="mt-3 inline-flex rounded-lg bg-black/5 p-1 dark:bg-white/10"
              >
                {(["cliente", "equipo"] as const).map((item) => {
                  const selected = mode === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setMode(item)}
                      className={`h-8 rounded-md px-3 text-xs font-semibold transition-colors ${
                        selected
                          ? "bg-white text-[#212121] shadow-sm dark:bg-[#3a3a3a] dark:text-white"
                          : "text-[#616161] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:text-white"
                      }`}
                    >
                      {item === "cliente" ? "Cliente" : "Mi equipo"}
                    </button>
                  );
                })}
              </div>

              {mode === "cliente" ? (
                <>
                  <p className="mt-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
                    Agrega el cliente con su nombre y teléfono para poder escribirle. Queda
                    guardado en tus clientes.
                  </p>

                  <div className="mt-4 flex flex-col gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
                        Nombre
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                        autoFocus
                        placeholder="Ej. Juan Pérez"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
                        Teléfono (con lada)
                      </span>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                        placeholder="Ej. +52 55 1234 5678"
                        className={inputClass}
                      />
                    </label>
                  </div>

                  <p className="mt-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
                    Si este cliente nunca te ha escrito, al abrir su chat vas a ver un botón
                    &quot;Iniciar conversación&quot; en vez del cuadro de texto — así arranca la
                    plática sin que tengas que hacer nada desde tu WhatsApp normal.
                  </p>

                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="h-10 rounded-lg px-4 text-sm font-semibold text-[#616161] hover:bg-[#f5f5f5] disabled:opacity-60 dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={!canSave || loading}
                      className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? "Agregando..." : "Agregar y abrir chat"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
                    Escríbele por WhatsApp a alguien de tu equipo. Se usa el teléfono de su
                    perfil; el chat solo lo ven esa persona y tú.
                  </p>

                  <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a]">
                    {teamLoading && members.length === 0 ? (
                      <div className="flex justify-center py-6">
                        <span className="size-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                      </div>
                    ) : members.length === 0 ? (
                      <p className="p-4 text-center text-sm text-[#616161] dark:text-[#b0b0b0]">
                        No hay nadie más en tu empresa todavía.
                      </p>
                    ) : (
                      <ul>
                        {members.map((member) => (
                          <li key={member.id}>
                            <button
                              type="button"
                              disabled={!member.canReceiveWhatsapp}
                              onClick={() =>
                                onCreated({
                                  target: { kind: "team", id: member.id },
                                  name: member.name,
                                })
                              }
                              className="flex w-full flex-col items-start gap-0.5 border-b border-[#f0f0f0] px-4 py-3 text-left transition-colors last:border-0 hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2a2a2a] dark:hover:bg-white/5"
                            >
                              <span className="text-sm font-semibold text-[#212121] dark:text-white">
                                {member.name}
                              </span>
                              <span className="text-xs text-[#616161] dark:text-[#b0b0b0]">
                                {member.canReceiveWhatsapp
                                  ? member.phone
                                  : "Sin teléfono en su perfil"}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="h-10 rounded-lg px-4 text-sm font-semibold text-[#616161] hover:bg-[#f5f5f5] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
