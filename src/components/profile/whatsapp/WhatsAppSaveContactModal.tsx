"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApolloClient, useMutation } from "@apollo/client";
import { sileo } from "sileo";
import {
  ADD_OWN_LEAD_MUTATION,
  type AddOwnLeadResult,
  type AddOwnLeadVariables,
} from "kadesh/components/profile/sales/lead";
import {
  LINK_WHATSAPP_CONTACT_TO_LEAD_MUTATION,
  WHATSAPP_CONVERSATIONS_QUERY,
  type LinkWhatsAppContactToLeadResponse,
  type LinkWhatsAppContactToLeadVariables,
} from "./queries";

export interface WhatsAppSaveContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Teléfono tal como llegó (con lada). */
  phone: string;
  /** Últimos 10 dígitos: con esto se enlazan los mensajes que ya llegaron. */
  phoneKey: string;
  /** Nombre de perfil de WhatsApp, si lo mandó; si no, vacío. */
  suggestedName: string;
  onSaved: (client: { id: string; name: string }) => void;
}

/**
 * Convierte en cliente un número que escribió solo: crea el cliente (mismo `addOwnLead` del
 * CRM) y enlaza el historial que ya tenía, para que la conversación pase a ser la del cliente
 * en vez de quedarse como "número nuevo".
 */
export default function WhatsAppSaveContactModal({
  isOpen,
  onClose,
  phone,
  phoneKey,
  suggestedName,
  onSaved,
}: WhatsAppSaveContactModalProps) {
  const client = useApolloClient();
  const [name, setName] = useState(suggestedName);

  const [addOwnLead, { loading: creating }] = useMutation<
    AddOwnLeadResult,
    AddOwnLeadVariables
  >(ADD_OWN_LEAD_MUTATION);
  const [linkContact, { loading: linking }] = useMutation<
    LinkWhatsAppContactToLeadResponse,
    LinkWhatsAppContactToLeadVariables
  >(LINK_WHATSAPP_CONTACT_TO_LEAD_MUTATION);

  const busy = creating || linking;
  const canSave = name.trim().length > 0 && !busy;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      const created = await addOwnLead({
        variables: {
          input: { businessName: name.trim(), phone, source: "WhatsApp" },
        },
      });
      const payload = created.data?.addOwnLead;
      if (!payload?.success || !payload.leadId) {
        sileo.error({ title: payload?.message || "No se pudo guardar el cliente" });
        return;
      }

      const linked = await linkContact({
        variables: { businessLeadId: payload.leadId, phone: phoneKey },
      });
      if (!linked.data?.linkWhatsAppContactToLead.success) {
        // El cliente ya existe: no se pierde nada, solo el historial previo queda aparte.
        sileo.error({
          title: "Cliente guardado, pero no se pudo enlazar la conversación anterior",
        });
      }

      await client.refetchQueries({ include: [WHATSAPP_CONVERSATIONS_QUERY] });
      onSaved({ id: payload.leadId, name: name.trim() });
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo guardar el cliente",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div data-body-scroll-lock
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50"
            onClick={() => !busy && onClose()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div
              className="pointer-events-auto w-full max-w-sm rounded-3xl border border-dash-line bg-dash-surface p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-dash-ink">
                Guardar como cliente
              </h3>
              <p className="mt-1 text-sm text-dash-muted">
                Esta conversación pasa a ser la de tu cliente y queda en Clientes.
              </p>

              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-medium text-dash-muted">
                  Nombre
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={busy}
                  autoFocus
                  placeholder="Ej. Juan Pérez"
                  className="w-full rounded-lg border border-dash-line bg-dash-surface px-3 py-2.5 text-sm text-dash-ink placeholder:text-dash-faint focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
                />
              </label>
              <p className="mt-2 text-xs text-dash-muted">
                Teléfono: <span className="font-medium">{phone}</span>
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={busy}
                  className="h-10 rounded-lg px-4 text-sm font-semibold text-dash-muted hover:bg-dash-hover disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={!canSave}
                  className="h-10 rounded-full dash-grad-accent px-4 text-sm font-semibold text-white hover:shadow-dash-accent-lift disabled:cursor-not-allowed disabled:opacity-60 shadow-dash-accent"
                >
                  {busy ? "Guardando..." : "Guardar cliente"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
