"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { ChangelogReleaseBody } from "kadesh/components/changelog";
import { formatDateShort } from "kadesh/utils/format-date";
import { cn } from "kadesh/utils/cn";
import { AdminDrawer, AdminSegmented, InfoTip } from "../ui";
import {
  CREATE_RELEASE_MUTATION,
  DELETE_RELEASE_MUTATION,
  UPDATE_RELEASE_MUTATION,
  type AdminRelease,
} from "./releases-queries";
import { RELEASE_AUDIENCE, RELEASE_PRODUCT_ITEMS } from "./constants";

type Product = AdminRelease["product"];

const fieldClass =
  "w-full rounded-xl border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-[#212121] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white";
const labelClass = "flex items-center gap-1 text-xs font-medium text-[#616161] dark:text-[#b0b0b0]";
const secondaryButton =
  "h-11 rounded-xl border border-[#e0e0e0] px-4 text-sm font-semibold text-[#212121] hover:border-orange-300 disabled:opacity-60 dark:border-[#3a3a3a] dark:text-white cursor-pointer";
const primaryButton =
  "h-11 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer";

const todayYmd = () => new Date().toLocaleDateString("en-CA");
/** Mediodía del día elegido: así la fecha no se corre por la zona horaria. */
const ymdToIso = (ymd: string) => new Date(`${ymd}T12:00:00`).toISOString();
const isoToYmd = (iso: string) => new Date(iso).toLocaleDateString("en-CA");

type Draft = {
  version: string;
  product: Product;
  title: string;
  body: string;
  date: string;
  notifyByEmail: boolean;
};

function initialDraft(release: AdminRelease | null): Draft {
  return {
    version: release?.version ?? "",
    product: release?.product ?? "saas",
    title: release?.title ?? "",
    body: release?.body ?? "",
    date: release ? isoToYmd(release.releasedAt) : todayYmd(),
    notifyByEmail: release?.notifyByEmail ?? true,
  };
}

/**
 * Crear o editar una novedad. Se guarda como borrador o se publica; si al publicar va a mandar
 * correo, primero pide confirmar y dice a quién le llega. El correo sale una sola vez, al pasar a
 * publicada (ver kadesh-back `SystemRelease.hooks.ts`).
 */
export default function ReleaseEditor({
  release,
  open,
  onClose,
  onSaved,
}: {
  /** null = novedad nueva. */
  release: AdminRelease | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => initialDraft(release));
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [create, { loading: creating }] = useMutation(CREATE_RELEASE_MUTATION);
  const [update, { loading: updating }] = useMutation(UPDATE_RELEASE_MUTATION);
  const [remove, { loading: removing }] = useMutation(DELETE_RELEASE_MUTATION);
  const busy = creating || updating || removing;
  const published = Boolean(release?.isPublished);
  const emailed = Boolean(release?.emailedAt);
  const canSave = draft.version.trim().length > 0 && Boolean(draft.date);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const save = async (isPublished: boolean) => {
    const data = {
      version: draft.version.trim(),
      product: draft.product,
      title: draft.title.trim() || null,
      body: draft.body.trim() || null,
      releasedAt: ymdToIso(draft.date),
      notifyByEmail: draft.notifyByEmail,
      isPublished,
    };
    try {
      if (release) await update({ variables: { id: release.id, data } });
      else await create({ variables: { data } });
      const willEmail = isPublished && !published && draft.notifyByEmail && !emailed;
      sileo.success({
        title: isPublished
          ? willEmail
            ? "Novedad publicada. Se está mandando el correo."
            : "Novedad publicada."
          : published
            ? "Novedad despublicada."
            : "Borrador guardado.",
      });
      onSaved();
      onClose();
    } catch (error) {
      sileo.error({ title: error instanceof Error ? error.message : "No se pudo guardar la novedad" });
    }
  };

  const publish = () => {
    if (draft.notifyByEmail && !emailed && !confirmPublish) {
      setConfirmPublish(true);
      return;
    }
    void save(true);
  };

  const destroy = async () => {
    if (!release) return;
    try {
      await remove({ variables: { id: release.id } });
      sileo.success({ title: "Novedad eliminada." });
      onSaved();
      onClose();
    } catch (error) {
      sileo.error({ title: error instanceof Error ? error.message : "No se pudo eliminar" });
    }
  };

  return (
    <AdminDrawer
      open={open}
      onClose={onClose}
      ariaLabel={release ? "Editar novedad" : "Nueva novedad"}
      title={release ? `Editar v${release.version}` : "Nueva novedad"}
      subtitle={published ? "Publicada" : release ? "Borrador" : "Se guarda como borrador hasta que la publiques"}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSave && !busy) void save(published);
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>
              Versión <span className="text-red-500">*</span>
              <InfoTip label="Versión">
                Número o etiqueta de la versión, por ejemplo 1.8.0. Sale grande en la tarjeta de la novedad.
              </InfoTip>
            </span>
            <input value={draft.version} onChange={(e) => set("version", e.target.value)} placeholder="1.8.0" className={fieldClass} maxLength={40} required />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>
              Fecha
              <InfoTip label="Fecha">La fecha que se muestra en la novedad. Las más recientes salen primero.</InfoTip>
            </span>
            <input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} className={cn(fieldClass, "h-11")} required />
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelClass}>
            ¿Para quién es?
            <InfoTip label="¿Para quién es?">
              Negocios = el panel de ventas (CRM). Pet = la app de mascotas. Ambas = sale en las dos y el correo llega a todos.
            </InfoTip>
          </span>
          <AdminSegmented ariaLabel="Producto" items={RELEASE_PRODUCT_ITEMS} value={draft.product} onChange={(value) => set("product", value)} />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Título</span>
          <input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ej.: Analítica de ventas para tu equipo"
            className={fieldClass}
            maxLength={120}
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className={labelClass}>
              Qué cambió
              <InfoTip label="Cómo escribir las notas">
                Deja una línea en blanco entre párrafos. Empieza una línea con &quot;- &quot; para hacer una lista y
                encierra palabras entre **dobles asteriscos** para ponerlas en negritas. Usa &quot;Vista previa&quot; para ver
                cómo queda.
              </InfoTip>
            </span>
            <AdminSegmented
              ariaLabel="Escribir o ver"
              items={[
                { id: "write", label: "Escribir" },
                { id: "preview", label: "Vista previa" },
              ]}
              value={mode}
              onChange={setMode}
            />
          </div>
          {mode === "write" ? (
            <textarea
              value={draft.body}
              onChange={(e) => set("body", e.target.value)}
              rows={10}
              placeholder={"Qué hay de nuevo, en palabras de tus clientes.\n\n- **Analítica**: mide tu tasa de cierre.\n- Arreglamos …"}
              className={fieldClass}
            />
          ) : (
            <div className="min-h-[14rem] rounded-xl border border-[#e0e0e0] p-4 dark:border-[#3a3a3a]">
              <p className="font-mono text-xs font-bold text-orange-600 dark:text-orange-300">v{draft.version || "0.0.0"}</p>
              <p className="mt-1 text-lg font-bold text-[#212121] dark:text-white">
                {draft.title.trim() || `Versión ${draft.version || "…"}`}
              </p>
              <div className="mt-3">
                {draft.body.trim() ? (
                  <ChangelogReleaseBody body={draft.body} />
                ) : (
                  <p className="text-sm text-[#9e9e9e]">Escribe las notas para ver cómo quedan.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm text-[#424242] dark:text-[#e0e0e0] cursor-pointer">
          <input
            type="checkbox"
            checked={draft.notifyByEmail}
            disabled={emailed}
            onChange={(e) => set("notifyByEmail", e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-orange-500"
          />
          <span>
            Avisar por correo al publicar
            <span className="block text-xs text-[#616161] dark:text-[#b0b0b0]">
              {emailed
                ? `El correo ya se mandó el ${formatDateShort(release!.emailedAt!, false)}. No se vuelve a mandar.`
                : published
                  ? "Ya está publicada: editarla no manda correo."
                  : `Le llega a ${RELEASE_AUDIENCE[draft.product]}, una sola vez. Quítalo para publicar sin correo (por ejemplo, un arreglo chico).`}
            </span>
          </span>
        </label>

        {confirmPublish ? (
          <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
            <p className="font-semibold">¿Publicar y mandar el correo?</p>
            <p className="mt-1">
              Le llega a {RELEASE_AUDIENCE[draft.product]}. No se puede deshacer.
            </p>
            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" onClick={() => setConfirmPublish(false)} className={secondaryButton}>
                Revisar otra vez
              </button>
              <button type="button" disabled={busy || !canSave} onClick={() => void save(true)} className={primaryButton}>
                Sí, publicar y mandar
              </button>
            </div>
          </div>
        ) : null}

        {confirmDelete ? (
          <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            <p className="font-semibold">¿Eliminar esta novedad?</p>
            <p className="mt-1">Deja de verse en el panel. Si ya se mandó el correo, ese no se puede recuperar.</p>
            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" onClick={() => setConfirmDelete(false)} className={secondaryButton}>
                Cancelar
              </button>
              <button type="button" disabled={busy} onClick={() => void destroy()} className="h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer">
                Sí, eliminar
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 border-t border-[#f0f0f0] pt-4 dark:border-[#2a2a2a] sm:flex-row sm:items-center sm:justify-between">
          {release && !confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="h-11 rounded-xl px-2 text-sm font-semibold text-red-600 hover:underline dark:text-red-400 cursor-pointer">
              Eliminar
            </button>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {published ? (
              <>
                <button type="button" disabled={busy} onClick={() => void save(false)} className={secondaryButton}>
                  Despublicar
                </button>
                <button type="submit" disabled={busy || !canSave} className={primaryButton}>
                  Guardar cambios
                </button>
              </>
            ) : (
              <>
                <button type="button" disabled={busy || !canSave} onClick={() => void save(false)} className={secondaryButton}>
                  Guardar borrador
                </button>
                {!confirmPublish ? (
                  <button type="button" disabled={busy || !canSave} onClick={publish} className={primaryButton}>
                    {draft.notifyByEmail && !emailed ? "Publicar y avisar" : "Publicar"}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </form>
    </AdminDrawer>
  );
}
