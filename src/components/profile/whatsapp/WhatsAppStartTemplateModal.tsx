"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import {
  COMPANY_WHATSAPP_TEMPLATES_QUERY,
  type CompanyWhatsappTemplatesResponse,
  type CompanyWhatsappTemplatesVariables,
  type WhatsappTemplateOption,
} from "./queries";

export interface WhatsAppStartTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Mismos argumentos del chat: con eso el backend resuelve la empresa y el destinatario. */
  targetVariables: CompanyWhatsappTemplatesVariables;
  sending: boolean;
  onSend: (input: {
    templateName: string;
    templateLanguage: string;
    templateParams: string[];
  }) => Promise<void>;
}

/** `{{1}}` → el valor escrito, para que se vea exactamente lo que le va a llegar. */
function renderPreview(bodyText: string, params: string[]): string {
  return bodyText.replace(/\{\{\s*(\d+)\s*\}\}/g, (match, index) => {
    const value = params[Number(index) - 1];
    return value?.trim() ? value : match;
  });
}

/**
 * Elegir qué plantilla mandar al iniciar una conversación, y con qué datos.
 *
 * Antes se mandaba siempre la plantilla que crea Kadesh ("te escribe {empresa}"), lo que en un
 * chat interno con el equipo sonaba a mensaje de ventas. Se elige siempre a mano: el catálogo
 * sale en vivo de Meta, así que sólo aparecen las plantillas realmente aprobadas.
 */
export default function WhatsAppStartTemplateModal({
  isOpen,
  onClose,
  targetVariables,
  sending,
  onSend,
}: WhatsAppStartTemplateModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50"
            onClick={() => !sending && onClose()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            {/* El contenido vive en su propio componente, montado solo mientras el modal está
                abierto: así la plantilla elegida y lo escrito se reinician solos al cerrar. */}
            <TemplatePicker
              targetVariables={targetVariables}
              sending={sending}
              onClose={onClose}
              onSend={onSend}
            />
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function TemplatePicker({
  targetVariables,
  sending,
  onClose,
  onSend,
}: Omit<WhatsAppStartTemplateModalProps, "isOpen">) {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  /** Lo que el usuario escribió, por plantilla: cambiar de plantilla no arrastra los valores. */
  const [edits, setEdits] = useState<Record<string, string[]>>({});

  const { data, loading, error } = useQuery<
    CompanyWhatsappTemplatesResponse,
    CompanyWhatsappTemplatesVariables
  >(COMPANY_WHATSAPP_TEMPLATES_QUERY, {
    variables: targetVariables,
    fetchPolicy: "cache-and-network",
  });

  const payload = data?.companyWhatsappTemplates;
  const templates = useMemo(() => payload?.templates ?? [], [payload]);
  const recipientName = payload?.recipientName ?? "";
  const companyName = payload?.companyName ?? "";

  const selected: WhatsappTemplateOption | null =
    templates.find((t) => t.name === selectedName) ?? templates[0] ?? null;

  // La convención de la plantilla que crea Kadesh ({{1}} destinatario, {{2}} empresa) se usa
  // como propuesta para cualquier plantilla; son campos editables, no una imposición.
  const defaults = useMemo(
    () =>
      selected
        ? Array.from({ length: selected.variableCount }, (_, i) => {
            if (i === 0) return recipientName;
            if (i === 1) return companyName;
            return "";
          })
        : [],
    [selected, recipientName, companyName],
  );

  const params = selected ? (edits[selected.name] ?? defaults) : [];

  const setParam = (index: number, value: string) => {
    if (!selected) return;
    setEdits((prev) => ({
      ...prev,
      [selected.name]: params.map((p, i) => (i === index ? value : p)),
    }));
  };

  const canSend = Boolean(selected) && params.every((p) => p.trim()) && !sending;

  const handleSend = async () => {
    if (!selected || !canSend) return;
    await onSend({
      templateName: selected.name,
      templateLanguage: selected.language,
      templateParams: params.map((p) => p.trim()),
    });
  };

  return (
    <div
      className="pointer-events-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-2xl dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="border-b border-[#e0e0e0] p-5 dark:border-[#3a3a3a]">
        <h3 className="text-lg font-bold text-[#212121] dark:text-white">
          Elige el mensaje de inicio
        </h3>
        <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
          Para escribir primero{recipientName ? ` a ${recipientName}` : ""}, Meta sólo permite
          plantillas aprobadas. Estas son las de tu cuenta.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {loading && templates.length === 0 ? (
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            Cargando tus plantillas...
          </p>
        ) : error || payload?.success === false ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {payload?.message || "No se pudieron leer las plantillas de Meta"}
          </p>
        ) : templates.length === 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            No tienes ninguna plantilla aprobada. Créala en WhatsApp Manager y aparecerá aquí en
            cuanto Meta la apruebe.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {templates.map((template) => {
                const isSelected = selected?.name === template.name;
                return (
                  <li key={`${template.name}-${template.language}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedName(template.name)}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        isSelected
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                          : "border-[#e0e0e0] hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:hover:bg-[#2a2a2a]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#212121] dark:text-white">
                          {template.name}
                        </span>
                        <span className="shrink-0 text-[10px] uppercase tracking-wide text-[#9e9e9e]">
                          {template.language}
                        </span>
                      </span>
                      <span className="mt-1 block line-clamp-2 text-xs text-[#616161] dark:text-[#b0b0b0]">
                        {template.bodyText}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {selected && selected.variableCount > 0 ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
                  Datos que pide esta plantilla
                </p>
                {params.map((value, index) => (
                  <label key={index} className="block">
                    <span className="mb-1 block text-xs text-[#9e9e9e]">
                      {`{{${index + 1}}}`}
                    </span>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setParam(index, e.target.value)}
                      disabled={sending}
                      className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#212121] placeholder:text-[#9e9e9e] focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 dark:border-[#3a3a3a] dark:bg-[#121212] dark:text-white"
                    />
                  </label>
                ))}
              </div>
            ) : null}

            {selected ? (
              <div className="mt-4 rounded-xl border border-[#e0e0e0] bg-[#f5f5f5] p-3 dark:border-[#3a3a3a] dark:bg-[#121212]">
                <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
                  Así le va a llegar
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-[#212121] dark:text-white">
                  {selected.headerText ? `${selected.headerText}\n\n` : ""}
                  {renderPreview(selected.bodyText, params)}
                  {selected.footerText ? `\n\n${selected.footerText}` : ""}
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-[#e0e0e0] p-4 dark:border-[#3a3a3a]">
        <button
          type="button"
          onClick={onClose}
          disabled={sending}
          className="h-10 rounded-lg px-4 text-sm font-semibold text-[#616161] hover:bg-[#f5f5f5] disabled:opacity-60 dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!canSend}
          className="h-10 rounded-lg bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? "Enviando..." : "Enviar mensaje"}
        </button>
      </div>
    </div>
  );
}
