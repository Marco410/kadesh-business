"use client";

import { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Upload02Icon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { useUser } from "kadesh/utils/UserContext";
import ClientLeadAutocomplete from "kadesh/components/shared/ClientLeadAutocomplete";
import {
  IMPORT_WHATSAPP_CHAT_EXPORT_MUTATION,
  PREVIEW_WHATSAPP_CHAT_EXPORT_QUERY,
  type ImportWhatsAppChatExportResponse,
  type ImportWhatsAppChatExportVariables,
  type PreviewWhatsAppChatExportResponse,
  type PreviewWhatsAppChatExportVariables,
} from "./queries";

type ImportRow = {
  rowId: string;
  file: File;
  content: string | null;
  previewLoading: boolean;
  previewError: string | null;
  messageCount: number | null;
  senderNames: string[];
  selectedSender: string;
  leadId: string | null;
  status: "idle" | "importing" | "done" | "error";
  resultMessage: string | null;
};

let rowCounter = 0;

export function WhatsAppChatImportSection() {
  const { user } = useUser();
  const client = useApolloClient();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);

  const [importChatExport] = useMutation<
    ImportWhatsAppChatExportResponse,
    ImportWhatsAppChatExportVariables
  >(IMPORT_WHATSAPP_CHAT_EXPORT_MUTATION);

  const updateRow = (rowId: string, patch: Partial<ImportRow>) => {
    setRows((prev) => prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)));
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newRows: ImportRow[] = Array.from(fileList).map((file) => ({
      rowId: `row-${rowCounter++}`,
      file,
      content: null,
      previewLoading: true,
      previewError: null,
      messageCount: null,
      senderNames: [],
      selectedSender: "",
      leadId: null,
      status: "idle",
      resultMessage: null,
    }));
    setRows((prev) => [...prev, ...newRows]);

    for (const row of newRows) {
      try {
        const content = await row.file.text();
        const result = await client.query<
          PreviewWhatsAppChatExportResponse,
          PreviewWhatsAppChatExportVariables
        >({
          query: PREVIEW_WHATSAPP_CHAT_EXPORT_QUERY,
          variables: { content },
          fetchPolicy: "no-cache",
        });
        const payload = result.data?.previewWhatsAppChatExport;
        updateRow(row.rowId, {
          content,
          previewLoading: false,
          previewError: payload?.success ? null : payload?.message || "No se pudo leer el archivo",
          messageCount: payload?.messageCount ?? 0,
          senderNames: payload?.senderNames ?? [],
        });
      } catch (err) {
        updateRow(row.rowId, {
          previewLoading: false,
          previewError: err instanceof Error ? err.message : "No se pudo leer el archivo",
        });
      }
    }
  };

  const readyRows = rows.filter((r) => r.leadId && r.content && r.status !== "done");

  const handleImportAll = async () => {
    if (readyRows.length === 0) return;
    setImporting(true);
    for (const row of readyRows) {
      updateRow(row.rowId, { status: "importing" });
      try {
        const result = await importChatExport({
          variables: {
            businessLeadId: row.leadId as string,
            fileName: row.file.name,
            content: row.content as string,
            leadSenderName: row.selectedSender || null,
          },
        });
        const payload = result.data?.importWhatsAppChatExport;
        if (!payload?.success) {
          updateRow(row.rowId, {
            status: "error",
            resultMessage: payload?.message || "No se pudo importar",
          });
          continue;
        }
        updateRow(row.rowId, { status: "done", resultMessage: payload.message });
      } catch (err) {
        updateRow(row.rowId, {
          status: "error",
          resultMessage: err instanceof Error ? err.message : "No se pudo importar",
        });
      }
    }
    setImporting(false);
    sileo.success({ title: "Importación terminada" });
  };

  return (
    <div className="mt-8 rounded-xl border border-[#e0e0e0] bg-white p-5 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
      <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
        Importar historial de chats
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
        Sube el .txt que exporta WhatsApp por conversación (en el chat, menú → Más → Exportar
        chat). Elige a qué lead pertenece cada archivo antes de importar.
      </p>

      <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#e0e0e0] px-4 py-2.5 text-sm font-medium text-[#616161] transition-colors hover:border-orange-400 hover:text-orange-600 dark:border-[#3a3a3a] dark:text-[#b0b0b0] dark:hover:text-orange-400">
        <HugeiconsIcon icon={Upload02Icon} size={18} />
        Elegir archivos .txt
        <input
          type="file"
          accept=".txt"
          multiple
          className="hidden"
          onChange={(e) => {
            void handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {rows.length > 0 && (
        <div className="mt-5 space-y-4">
          {rows.map((row) => (
            <div
              key={row.rowId}
              className="rounded-lg border border-[#e0e0e0] p-4 dark:border-[#3a3a3a]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-[#212121] dark:text-white">
                  {row.file.name}
                </span>
                {row.status === "done" && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} />
                    Importado
                  </span>
                )}
              </div>

              {row.previewLoading ? (
                <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">Leyendo...</p>
              ) : row.previewError ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{row.previewError}</p>
              ) : (
                <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
                  {row.messageCount} mensajes detectados
                </p>
              )}

              {!row.previewError && !row.previewLoading && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <ClientLeadAutocomplete
                    userId={user?.id ?? ""}
                    selectedLeadId={row.leadId}
                    onSelectedLeadIdChange={(id) => updateRow(row.rowId, { leadId: id })}
                    label="Lead"
                    placeholder="Buscar lead por nombre"
                  />
                  {row.senderNames.length > 0 && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]">
                        ¿Cuál de estos eres tú? (opcional)
                      </label>
                      <select
                        value={row.selectedSender}
                        onChange={(e) => updateRow(row.rowId, { selectedSender: e.target.value })}
                        className="w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#212121] dark:border-[#3a3a3a] dark:bg-[#121212] dark:text-white"
                      >
                        <option value="">Sin identificar</option>
                        {row.senderNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {row.resultMessage && (
                <p
                  className={`mt-2 text-xs ${
                    row.status === "error"
                      ? "text-red-600 dark:text-red-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {row.resultMessage}
                </p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => void handleImportAll()}
            disabled={importing || readyRows.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importing ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Importando...
              </>
            ) : (
              `Importar todo (${readyRows.length})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
