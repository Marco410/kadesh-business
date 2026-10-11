"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PinIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { cn } from "kadesh/utils/cn";
import { formatDate } from "kadesh/utils/format-date";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminSectionCard,
  formatPersonName,
} from "../../../ui";
import {
  ADMIN_COMPANY_NOTES_QUERY,
  CREATE_COMPANY_NOTE_MUTATION,
  DELETE_COMPANY_NOTE_MUTATION,
  UPDATE_COMPANY_NOTE_MUTATION,
  type AdminCompanyNote,
  type AdminCompanyNotesResponse,
} from "../../ops-queries";

const MAX_LENGTH = 4000;

/**
 * Notas internas de Kadesh sobre la empresa (llamadas, acuerdos, por qué se le extendió la
 * prueba…). El cliente nunca las ve. Las fijadas van arriba.
 */
export default function CompanyNotes({ companyId }: { companyId: string }) {
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const { data, loading, error, refetch } = useQuery<AdminCompanyNotesResponse>(
    ADMIN_COMPANY_NOTES_QUERY,
    { variables: { companyId }, fetchPolicy: "cache-and-network" },
  );
  const [createNote, { loading: saving }] = useMutation(CREATE_COMPANY_NOTE_MUTATION);
  const [updateNote] = useMutation(UPDATE_COMPANY_NOTE_MUTATION);
  const [deleteNote] = useMutation(DELETE_COMPANY_NOTE_MUTATION);

  const notes = useMemo(() => {
    const list = [...(data?.saasCompanyNotes ?? [])];
    // Fijadas primero; dentro de cada grupo, la más reciente arriba (ya viene así del back).
    return list.sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));
  }, [data?.saasCompanyNotes]);

  const save = async () => {
    const text = body.trim();
    if (!text) return;
    try {
      await createNote({
        variables: { data: { company: { connect: { id: companyId } }, body: text, pinned } },
      });
      setBody("");
      setPinned(false);
      await refetch();
      sileo.success({ title: "Nota guardada" });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "No se pudo guardar la nota" });
    }
  };

  const togglePin = async (note: AdminCompanyNote) => {
    try {
      await updateNote({ variables: { id: note.id, data: { pinned: !note.pinned } } });
      await refetch();
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "No se pudo actualizar la nota" });
    }
  };

  const remove = async (note: AdminCompanyNote) => {
    if (!window.confirm("¿Borrar esta nota? No se puede deshacer.")) return;
    try {
      await deleteNote({ variables: { id: note.id } });
      await refetch();
      sileo.success({ title: "Nota borrada" });
    } catch (err) {
      sileo.error({ title: err instanceof Error ? err.message : "No se pudo borrar la nota" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminSectionCard
        title="Nueva nota"
        description="Solo la ve el equipo de Kadesh. Queda registrado quién la escribió."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="flex flex-col gap-3"
        >
          <label htmlFor="company-note-body" className="sr-only">
            Texto de la nota
          </label>
          <textarea
            id="company-note-body"
            value={body}
            maxLength={MAX_LENGTH}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Ej.: Llamamos el lunes, quieren probar WhatsApp antes de pagar. Les extendimos 7 días."
            className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#212121] placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex min-h-11 items-center gap-2 text-sm text-[#616161] dark:text-[#b0b0b0] cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 accent-orange-500"
              />
              Fijar arriba
            </label>
            <button
              type="submit"
              disabled={saving || !body.trim()}
              className="h-11 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              Guardar nota
            </button>
          </div>
        </form>
      </AdminSectionCard>

      {error ? (
        <AdminErrorState message={error.message} />
      ) : loading && notes.length === 0 ? (
        <AdminLoadingRows rows={3} />
      ) : notes.length === 0 ? (
        <AdminEmptyState
          title="Sin notas todavía"
          description="Anota aquí lo que el equipo de Kadesh tiene que saber de este cliente."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className={cn(
                "rounded-2xl border bg-white p-4 dark:bg-[#1e1e1e]",
                note.pinned
                  ? "border-orange-300 dark:border-orange-500/40"
                  : "border-[#e0e0e0] dark:border-[#3a3a3a]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 whitespace-pre-wrap break-words text-sm text-[#212121] dark:text-white">
                  {note.body}
                </p>
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => togglePin(note)}
                    aria-label={note.pinned ? "Desfijar nota" : "Fijar nota"}
                    aria-pressed={Boolean(note.pinned)}
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer",
                      note.pinned ? "text-orange-600 dark:text-orange-400" : "text-[#9e9e9e]",
                    )}
                  >
                    <HugeiconsIcon icon={PinIcon} size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(note)}
                    aria-label="Borrar nota"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#9e9e9e] hover:bg-red-500/10 hover:text-red-600 cursor-pointer"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={18} />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-[#9e9e9e]">
                {note.author ? formatPersonName(note.author.name, note.author.lastName) : "Kadesh"}
                {note.createdAt ? ` · ${formatDate(note.createdAt)}` : ""}
                {note.pinned ? " · Fijada" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
