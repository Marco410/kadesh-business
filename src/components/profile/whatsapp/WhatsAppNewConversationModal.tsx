"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import {
  ADD_OWN_LEAD_MUTATION,
  type AddOwnLeadResult,
  type AddOwnLeadVariables,
} from "kadesh/components/profile/sales/lead";

const inputClass =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60";

export interface WhatsAppNewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** El lead se crea aquí mismo (nombre + teléfono); avisa al padre para abrir su chat. */
  onCreated: (lead: { id: string; name: string }) => void;
}

/**
 * Alta rápida de un cliente solo con nombre y teléfono, para poder escribirle por WhatsApp de
 * inmediato sin llenar el formulario completo de "Agregar cliente". Usa el mismo addOwnLead.
 */
export default function WhatsAppNewConversationModal({
  isOpen,
  onClose,
  onCreated,
}: WhatsAppNewConversationModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [addOwnLead, { loading }] = useMutation<
    AddOwnLeadResult,
    AddOwnLeadVariables
  >(ADD_OWN_LEAD_MUTATION);

  const canSave = name.trim().length > 0 && phone.trim().length > 0;

  const handleClose = () => {
    if (loading) return;
    setName("");
    setPhone("");
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
      onCreated({ id: payload.leadId, name: name.trim() });
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
              <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
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
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
