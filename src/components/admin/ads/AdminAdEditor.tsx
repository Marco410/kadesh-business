"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { sileo } from "sileo";
import { cn } from "kadesh/utils/cn";
import { adminErrorText } from "../errors";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { centsToInput, formatCents, inputToCents } from "../store/constants";
import {
  AdminButton,
  AdminLoadingRows,
  AdminModal,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
  adminTextareaClass,
} from "../ui";
import AdPreviewCard from "./AdPreviewCard";
import {
  AD_KIND,
  AD_KIND_OPTIONS,
  AD_PAYMENT_METHOD_OPTIONS,
  AD_PAYMENT_STATUS_OPTIONS,
  AD_PERIOD_PRESETS,
  AD_PLACEMENT_LABELS,
  AD_PLACEMENT_OPTIONS,
  AD_PLACEMENT_WARNING,
  AD_RADIUS_KM,
  AD_STATUS_OPTIONS,
  AD_SUGGESTED_PLACEMENTS,
  AD_CUSTOM_TONE_DEFAULT,
  AD_TEXT_LIMITS,
  AD_TONES,
  AD_WEIGHT,
  adKindTarget,
  addDaysYmd,
  formatCtr,
  isPresetTone,
  mxTodayYmd,
  normalizeHexTone,
  type AdKind,
  type AdTone,
} from "./constants";
import {
  ADMIN_AD_QUERY,
  ADMIN_AD_STATS_QUERY,
  ADMIN_AD_TARGETS_QUERY,
  CREATE_AD_MUTATION,
  UPDATE_AD_MUTATION,
  type AdminAdDetail,
  type AdminAdStats,
  type AdminAdTarget,
} from "./queries";

/** Biggest image accepted (the card shows it 316 × 112 px). */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type Target = { id: string; label: string; lat: number | null; lng: number | null };

type Draft = {
  kind: AdKind;
  status: string;
  title: string;
  body: string;
  brandLabel: string;
  ctaLabel: string;
  /** A name of `AD_TONES` or a custom `#rrggbb`. */
  tone: string;
  /** What is typed in «Personalizado» (applied to `tone` once it is a valid color). */
  customTone: string;
  url: string;
  target: Target | null;
  placements: string[];
  startDate: string;
  endDate: string;
  weight: string;
  geoScope: "national" | "radius";
  lat: string;
  lng: string;
  radiusKm: string;
  zoneLabel: string;
  advertiserName: string;
  advertiserContact: string;
  price: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentNote: string;
  imageUrl: string | null;
  imageFile: File | null;
  /** Object URL of `imageFile`, for the preview before it is uploaded. */
  imagePreview: string | null;
  removeImage: boolean;
};

function emptyDraft(): Draft {
  return {
    kind: AD_KIND.BRAND,
    status: "draft",
    title: "",
    body: "",
    brandLabel: "",
    ctaLabel: "",
    tone: "orange",
    customTone: AD_CUSTOM_TONE_DEFAULT,
    url: "",
    target: null,
    placements: [...AD_SUGGESTED_PLACEMENTS.brand],
    startDate: mxTodayYmd(),
    endDate: addDaysYmd(mxTodayYmd(), 29),
    weight: "5",
    geoScope: "national",
    lat: "",
    lng: "",
    radiusKm: "15",
    zoneLabel: "",
    advertiserName: "",
    advertiserContact: "",
    price: "",
    paymentStatus: "pending",
    paymentMethod: "",
    paymentNote: "",
    imageUrl: null,
    imageFile: null,
    imagePreview: null,
    removeImage: false,
  };
}

function draftFrom(ad: AdminAdDetail): Draft {
  const ref = ad.storeProduct ?? ad.petPlace ?? ad.animal;
  return {
    kind: (ad.kind as AdKind) ?? AD_KIND.BRAND,
    status: ad.status ?? "draft",
    title: ad.title ?? "",
    body: ad.body ?? "",
    brandLabel: ad.brandLabel ?? "",
    ctaLabel: ad.ctaLabel ?? "",
    tone: isPresetTone(ad.tone) ? ad.tone : (normalizeHexTone(ad.tone) ?? "orange"),
    customTone: isPresetTone(ad.tone) ? AD_CUSTOM_TONE_DEFAULT : (normalizeHexTone(ad.tone) ?? AD_CUSTOM_TONE_DEFAULT),
    url: ad.url ?? "",
    target: ref ? { id: ref.id, label: ref.name || ref.slug || "Sin nombre", lat: null, lng: null } : null,
    placements: ad.placements ?? [],
    startDate: ad.startDate ?? "",
    endDate: ad.endDate ?? "",
    weight: String(ad.weight ?? 5),
    geoScope: ad.geoScope === "radius" ? "radius" : "national",
    lat: ad.lat != null ? String(ad.lat) : "",
    lng: ad.lng != null ? String(ad.lng) : "",
    radiusKm: ad.radiusKm != null ? String(ad.radiusKm) : "15",
    zoneLabel: ad.zoneLabel ?? "",
    advertiserName: ad.advertiserName ?? "",
    advertiserContact: ad.advertiserContact ?? "",
    price: ad.priceCents ? centsToInput(ad.priceCents) : "",
    paymentStatus: ad.paymentStatus ?? "pending",
    paymentMethod: ad.paymentMethod ?? "",
    paymentNote: ad.paymentNote ?? "",
    imageUrl: ad.image?.url ?? null,
    imageFile: null,
    imagePreview: null,
    removeImage: false,
  };
}

function isAdUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** What is wrong with the form, or `null`. Same rules as kadesh-back (`Ad.hooks.ts`). */
function draftError(draft: Draft): string | null {
  if (!draft.title.trim()) return "Escribe el título del anuncio.";
  for (const [field, max] of Object.entries(AD_TEXT_LIMITS)) {
    if ((draft[field as keyof typeof AD_TEXT_LIMITS] as string).length > max) return `Hay un texto de más de ${max} caracteres.`;
  }
  if (!isPresetTone(draft.tone) && !normalizeHexTone(draft.customTone)) return "El color personalizado debe ser como #1F8A70.";
  const target = adKindTarget(draft.kind);
  if (target && !draft.target) return "Elige el destino del anuncio.";
  if (!target && !isAdUrl(draft.url.trim())) return "El enlace debe empezar con https:// o ser una ruta del sitio (/tienda).";
  if (draft.placements.length === 0) return "Elige al menos un lugar donde mostrarlo.";
  if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) return "La fecha de fin es anterior a la de inicio.";
  const weight = Number(draft.weight);
  if (!Number.isInteger(weight) || weight < AD_WEIGHT.MIN || weight > AD_WEIGHT.MAX) return "El peso va de 1 a 10.";
  if (draft.geoScope === "radius") {
    const lat = Number(draft.lat);
    const lng = Number(draft.lng);
    const radius = Number(draft.radiusKm);
    if (!draft.lat || !draft.lng || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return "Escribe la latitud y longitud del centro de la zona.";
    }
    if (!Number.isInteger(radius) || radius < AD_RADIUS_KM.MIN || radius > AD_RADIUS_KM.MAX) {
      return `El radio va de ${AD_RADIUS_KM.MIN} a ${AD_RADIUS_KM.MAX} km.`;
    }
  }
  if (Number.isNaN(inputToCents(draft.price))) return "El precio no es un monto válido.";
  return null;
}

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={cn("mt-1 block text-right text-xs tabular-nums", value.length > max ? "text-red-700 dark:text-red-400" : "text-dash-faint")}>
      {value.length}/{max}
    </span>
  );
}

/** The text to send the advertiser: period, impressions, clicks and CTR. */
function reportText(title: string, stats: AdminAdStats): string {
  return [
    `Anuncio «${title}» en Kadesh Pet — últimos ${stats.days} días`,
    `Impresiones: ${stats.impressions.toLocaleString("es-MX")}`,
    `Clics: ${stats.clicks.toLocaleString("es-MX")}`,
    `Tasa de clic: ${formatCtr(stats.clicks, stats.impressions)}`,
    ...stats.byPlacement.map(
      (row) =>
        `· ${AD_PLACEMENT_LABELS[row.key] ?? row.key}: ${row.impressions.toLocaleString("es-MX")} impresiones, ${row.clicks.toLocaleString("es-MX")} clics`,
    ),
  ].join("\n");
}

/**
 * New or existing ad, in a modal (`?anuncio=<id>` or `?anuncio=nuevo`). Writes through the
 * generated `createAd` / `updateAd`; the backend checks the same rules again.
 */
export default function AdminAdEditor({ adId, onClose, onSaved }: { adId: string | null; onClose: () => void; onSaved: () => void }) {
  const detail = useQuery<{ ad: AdminAdDetail | null }>(ADMIN_AD_QUERY, {
    variables: { id: adId },
    skip: adId === null,
    fetchPolicy: "network-only",
  });

  if (adId === null) return <AdForm adId={null} initial={emptyDraft()} onClose={onClose} onSaved={onSaved} />;
  if (detail.data?.ad) return <AdForm adId={adId} initial={draftFrom(detail.data.ad)} onClose={onClose} onSaved={onSaved} />;
  return (
    <AdminModal open onClose={onClose} title="Anuncio" ariaLabel="Editar anuncio" size="xl">
      {detail.error ? (
        <p className="text-sm text-red-700 dark:text-red-400">{adminErrorText(detail.error, "No se pudo abrir el anuncio.")}</p>
      ) : detail.data && !detail.data.ad ? (
        <p className="text-sm text-dash-muted">Ese anuncio ya no existe.</p>
      ) : (
        <AdminLoadingRows rows={6} />
      )}
    </AdminModal>
  );
}

function AdForm({
  adId,
  initial,
  onClose,
  onSaved,
}: {
  adId: string | null;
  initial: Draft;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = adId === null;
  const stats = useQuery<{ adminAdStats: AdminAdStats }>(ADMIN_AD_STATS_QUERY, {
    variables: { days: 30, adId },
    skip: isNew,
  });
  const [draft, setDraft] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);
  const [targetSearch, setTargetSearch] = useState("");

  const targetField = adKindTarget(draft.kind);
  const search = useDebouncedValue(targetSearch.trim(), 300);
  const targets = useQuery<{ adminAdTargets: AdminAdTarget[] }>(ADMIN_AD_TARGETS_QUERY, {
    variables: { kind: draft.kind, search },
    skip: !targetField || search.length < 2,
  });

  const [createAd] = useMutation(CREATE_AD_MUTATION);
  const [updateAd] = useMutation(UPDATE_AD_MUTATION);

  // Frees the preview of a chosen file when it changes or the editor closes.
  const preview = draft.imagePreview;
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const set = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));
  const suggested = AD_SUGGESTED_PLACEMENTS[draft.kind] ?? [];
  const previewImage = draft.removeImage ? null : draft.imagePreview ?? draft.imageUrl;
  const warnings = draft.placements
    .filter((placement) => !suggested.includes(placement))
    .map((placement) => AD_PLACEMENT_WARNING[draft.kind]?.[placement] ?? `${AD_PLACEMENT_LABELS[placement]} no es de los lugares sugeridos para este tipo.`);

  function changeKind(kind: AdKind) {
    set({ kind, target: null, placements: [...AD_SUGGESTED_PLACEMENTS[kind]], ...(kind === AD_KIND.HOUSE ? { weight: "1", paymentStatus: "waived" } : {}) });
    setTargetSearch("");
  }

  function togglePlacement(value: string) {
    const has = draft.placements.includes(value);
    set({ placements: has ? draft.placements.filter((item) => item !== value) : [...draft.placements, value] });
  }

  function pickTarget(target: AdminAdTarget) {
    const picked = { id: target.id, label: target.label, lat: target.lat, lng: target.lng };
    // A zone ad with no center yet takes the target's location.
    const center = draft.geoScope === "radius" && !draft.lat && target.lat != null && target.lng != null
      ? { lat: String(target.lat), lng: String(target.lng) }
      : {};
    set({ target: picked, ...center });
    setTargetSearch("");
  }

  function pickImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return void sileo.warning({ title: "Elige una imagen (JPG, PNG o WebP)." });
    if (file.size > MAX_IMAGE_BYTES) return void sileo.warning({ title: "La imagen pesa más de 5 MB." });
    set({ imageFile: file, imagePreview: URL.createObjectURL(file), removeImage: false });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const problem = draftError(draft);
    if (problem) return void sileo.warning({ title: problem });

    const target = adKindTarget(draft.kind);
    const relation = (field: "storeProduct" | "petPlace" | "animal") => {
      if (field === target && draft.target) return { connect: { id: draft.target.id } };
      return isNew ? undefined : { disconnect: true };
    };
    const radius = draft.geoScope === "radius";
    const data: Record<string, unknown> = {
      kind: draft.kind,
      status: draft.status,
      title: draft.title.trim(),
      body: draft.body.trim(),
      brandLabel: draft.brandLabel.trim(),
      ctaLabel: draft.ctaLabel.trim(),
      tone: draft.tone,
      url: target ? "" : draft.url.trim(),
      storeProduct: relation("storeProduct"),
      petPlace: relation("petPlace"),
      animal: relation("animal"),
      placements: AD_PLACEMENT_OPTIONS.map((option) => option.value).filter((value) => draft.placements.includes(value)),
      startDate: draft.startDate || null,
      endDate: draft.endDate || null,
      weight: Number(draft.weight),
      geoScope: draft.geoScope,
      lat: radius ? Number(draft.lat) : null,
      lng: radius ? Number(draft.lng) : null,
      radiusKm: radius ? Number(draft.radiusKm) : null,
      zoneLabel: radius ? draft.zoneLabel.trim() : "",
      advertiserName: draft.advertiserName.trim(),
      advertiserContact: draft.advertiserContact.trim(),
      priceCents: inputToCents(draft.price) ?? 0,
      paymentStatus: draft.paymentStatus,
      paymentMethod: draft.paymentMethod || null,
      paymentNote: draft.paymentNote.trim(),
    };
    if (draft.imageFile) data.image = { upload: draft.imageFile };
    else if (draft.removeImage && !isNew) data.image = null;
    for (const key of Object.keys(data)) if (data[key] === undefined) delete data[key];

    setSaving(true);
    try {
      if (isNew) await createAd({ variables: { data } });
      else await updateAd({ variables: { id: adId, data } });
      sileo.success({ title: isNew ? "Se creó el anuncio" : "Cambios guardados" });
      onSaved();
    } catch (err) {
      sileo.error({ title: "No se pudo guardar el anuncio", description: adminErrorText(err, "Intenta de nuevo.") });
    } finally {
      setSaving(false);
    }
  }

  async function copyReport() {
    const value = stats.data?.adminAdStats;
    if (!value) return;
    try {
      await navigator.clipboard.writeText(reportText(draft.title, value));
      sileo.success({ title: "Reporte copiado", description: "Pégalo en WhatsApp o en un correo para el anunciante." });
    } catch {
      sileo.error({ title: "No se pudo copiar el reporte." });
    }
  }

  const found = (targets.data?.adminAdTargets ?? []).filter((item) => item.id !== draft.target?.id);
  const adStats = stats.data?.adminAdStats;

  return (
    <AdminModal
      open
      onClose={saving ? () => undefined : onClose}
      title={isNew ? "Nuevo anuncio" : "Editar anuncio"}
      subtitle="Se ve en Kadesh Pet (web y app) en los lugares que marques. Los cambios salen en unos minutos."
      ariaLabel={isNew ? "Nuevo anuncio" : "Editar anuncio"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_316px]">
        <div className="flex min-w-0 flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className={adminLabelClass}>Tipo</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AD_KIND_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex min-h-11 cursor-pointer flex-col rounded-xl border px-3 py-2 text-sm transition-colors",
                    draft.kind === option.value ? "border-orange-400 bg-orange-50 dark:bg-orange-500/10" : "border-dash-line hover:border-dash-line-strong",
                  )}
                >
                  <span className="flex items-center gap-2 font-semibold text-dash-ink">
                    <input
                      type="radio"
                      name="ad-kind"
                      checked={draft.kind === option.value}
                      onChange={() => changeKind(option.value)}
                      className="size-4 accent-orange-500"
                    />
                    {option.label}
                  </span>
                  <span className="pl-6 text-xs text-dash-muted">{option.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {targetField ? (
            <div className="flex flex-col gap-2">
              <label className="block">
                <span className={adminLabelClass}>Destino</span>
                <input
                  value={targetSearch}
                  onChange={(event) => setTargetSearch(event.target.value)}
                  className={adminInputClass}
                  placeholder={draft.kind === AD_KIND.ANIMAL ? "Busca por nombre o folio" : "Busca por nombre"}
                  autoComplete="off"
                />
              </label>
              {draft.target ? (
                <p className="flex items-center justify-between gap-3 rounded-xl border border-dash-line px-3 py-1 text-sm">
                  <span className="min-w-0 truncate font-medium text-dash-ink">{draft.target.label}</span>
                  <AdminButton variant="ghost" size="sm" onClick={() => set({ target: null })}>
                    Quitar
                  </AdminButton>
                </p>
              ) : null}
              {search.length >= 2 ? (
                targets.loading ? (
                  <p className="text-sm text-dash-faint">Buscando…</p>
                ) : found.length === 0 ? (
                  <p className="text-sm text-dash-faint">Sin resultados con ese nombre.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {found.map((item) => (
                      <li key={item.id}>
                        <AdminButton variant="outline" size="sm" onClick={() => pickTarget(item)}>
                          {item.label}
                        </AdminButton>
                      </li>
                    ))}
                  </ul>
                )
              ) : null}
            </div>
          ) : (
            <label className="block">
              <span className={adminLabelClass}>Enlace</span>
              <input
                value={draft.url}
                onChange={(event) => set({ url: event.target.value })}
                className={adminInputClass}
                placeholder="https://… o /tienda"
                inputMode="url"
                autoComplete="off"
              />
              <span className="mt-1 block text-xs text-dash-faint">Fuera de Kadesh, solo https.</span>
            </label>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={adminLabelClass}>Marca (arriba del título)</span>
              <input value={draft.brandLabel} onChange={(event) => set({ brandLabel: event.target.value })} className={adminInputClass} placeholder="KADESH Business" />
              <Counter value={draft.brandLabel} max={AD_TEXT_LIMITS.brandLabel} />
            </label>
            <label className="block">
              <span className={adminLabelClass}>Botón</span>
              <input value={draft.ctaLabel} onChange={(event) => set({ ctaLabel: event.target.value })} className={adminInputClass} placeholder="Probar gratis" />
              <Counter value={draft.ctaLabel} max={AD_TEXT_LIMITS.ctaLabel} />
            </label>
          </div>
          <label className="block">
            <span className={adminLabelClass}>Título</span>
            <input value={draft.title} onChange={(event) => set({ title: event.target.value })} className={adminInputClass} />
            <Counter value={draft.title} max={AD_TEXT_LIMITS.title} />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Descripción</span>
            <textarea value={draft.body} onChange={(event) => set({ body: event.target.value })} className={adminTextareaClass} rows={3} />
            <Counter value={draft.body} max={AD_TEXT_LIMITS.body} />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className={adminLabelClass}>Color</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(AD_TONES) as AdTone[]).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => set({ tone })}
                    aria-pressed={draft.tone === tone}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm",
                      draft.tone === tone ? "border-orange-400 font-semibold text-dash-ink" : "border-dash-line text-dash-soft",
                    )}
                  >
                    <span className={cn("size-4 rounded-full", AD_TONES[tone].button)} />
                    {AD_TONES[tone].label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => set({ tone: normalizeHexTone(draft.customTone) ?? AD_CUSTOM_TONE_DEFAULT })}
                  aria-pressed={!isPresetTone(draft.tone)}
                  className={cn(
                    "inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm",
                    !isPresetTone(draft.tone) ? "border-orange-400 font-semibold text-dash-ink" : "border-dash-line text-dash-soft",
                  )}
                >
                  <span
                    className="size-4 rounded-full border border-dash-line"
                    style={{ backgroundColor: normalizeHexTone(draft.customTone) ?? AD_CUSTOM_TONE_DEFAULT }}
                  />
                  Personalizado
                </button>
              </div>
              {!isPresetTone(draft.tone) ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="color"
                    value={normalizeHexTone(draft.customTone) ?? draft.tone}
                    onChange={(event) => set({ tone: event.target.value, customTone: event.target.value })}
                    aria-label="Elegir color"
                    className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-dash-line bg-transparent p-1"
                  />
                  <input
                    type="text"
                    value={draft.customTone}
                    onChange={(event) => {
                      const hex = normalizeHexTone(event.target.value);
                      set(hex ? { customTone: event.target.value, tone: hex } : { customTone: event.target.value });
                    }}
                    placeholder="#1f8a70"
                    maxLength={7}
                    spellCheck={false}
                    aria-label="Color en hexadecimal"
                    aria-invalid={!normalizeHexTone(draft.customTone)}
                    className={cn(adminInputClass, "font-mono uppercase")}
                  />
                </div>
              ) : null}
              {!isPresetTone(draft.tone) && !normalizeHexTone(draft.customTone) ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">Escribe un color como #1F8A70.</p>
              ) : (
                <p className="mt-1 text-xs text-dash-faint">
                  {isPresetTone(draft.tone)
                    ? "O usa el color de la marca con «Personalizado»."
                    : "El botón lleva el color; la tarjeta, una versión clara (oscura de noche)."}
                </p>
              )}
            </fieldset>
            <div>
              <span className={adminLabelClass}>Imagen (opcional)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => pickImage(event.target.files?.[0] ?? null)}
                className="block w-full text-sm text-dash-soft file:mr-3 file:h-11 file:rounded-xl file:border-0 file:bg-dash-surface-2 file:px-3 file:text-sm file:font-semibold file:text-dash-ink"
              />
              <span className="mt-1 block text-xs text-dash-faint">
                Horizontal, hasta 5 MB. Sin imagen, los de producto o animal usan su foto.
              </span>
              {previewImage ? (
                <AdminButton variant="ghost" size="sm" onClick={() => set({ imageFile: null, imagePreview: null, removeImage: true })}>
                  Quitar imagen
                </AdminButton>
              ) : null}
            </div>
          </div>

          <fieldset className="flex flex-col gap-2 rounded-2xl border border-dash-line p-4">
            <legend className="px-1 text-[13px] font-semibold text-dash-soft">Dónde se muestra</legend>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              {AD_PLACEMENT_OPTIONS.map((option) => (
                <label key={option.value} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-dash-ink">
                  <input
                    type="checkbox"
                    checked={draft.placements.includes(option.value)}
                    onChange={() => togglePlacement(option.value)}
                    className="size-4 accent-orange-500"
                  />
                  {option.label}
                  <span className="text-xs text-dash-faint">
                    {option.hint}
                    {suggested.includes(option.value) ? " · sugerido" : ""}
                  </span>
                </label>
              ))}
            </div>
            {warnings.map((text) => (
              <p key={text} className="text-xs text-amber-700 dark:text-amber-400">
                {text} Se guarda igual.
              </p>
            ))}
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className={adminLabelClass}>Empieza</span>
              <input type="date" value={draft.startDate} onChange={(event) => set({ startDate: event.target.value })} className={adminInputClass} />
              <span className="mt-1 block text-xs text-dash-faint">Vacío: desde hoy.</span>
            </label>
            <label className="block">
              <span className={adminLabelClass}>Termina</span>
              <input type="date" value={draft.endDate} onChange={(event) => set({ endDate: event.target.value })} className={adminInputClass} />
              <span className="mt-1 flex flex-wrap gap-x-2 text-xs text-dash-faint">
                {AD_PERIOD_PRESETS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    className="min-h-6 underline-offset-2 hover:text-dash-ink hover:underline"
                    onClick={() => set({ endDate: addDaysYmd(draft.startDate || mxTodayYmd(), days - 1) })}
                  >
                    {days} días
                  </button>
                ))}
                <button type="button" className="min-h-6 underline-offset-2 hover:text-dash-ink hover:underline" onClick={() => set({ endDate: "" })}>
                  sin fin
                </button>
              </span>
            </label>
            <label className="block">
              <span className={adminLabelClass}>Peso en la rotación</span>
              <input value={draft.weight} onChange={(event) => set({ weight: event.target.value })} className={adminInputClass} inputMode="numeric" />
              <span className="mt-1 block text-xs text-dash-faint">1 a 10. Reparte el tiempo: con 2 sale el doble que con 1.</span>
            </label>
          </div>

          <fieldset className="flex flex-col gap-3 rounded-2xl border border-dash-line p-4">
            <legend className="px-1 text-[13px] font-semibold text-dash-soft">Zona</legend>
            <div className="flex flex-wrap gap-x-4">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-dash-ink">
                <input type="radio" name="ad-geo" checked={draft.geoScope === "national"} onChange={() => set({ geoScope: "national" })} className="size-4 accent-orange-500" />
                Todo el país
              </label>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-dash-ink">
                <input
                  type="radio"
                  name="ad-geo"
                  checked={draft.geoScope === "radius"}
                  onChange={() =>
                    set({
                      geoScope: "radius",
                      ...(!draft.lat && draft.target?.lat != null && draft.target.lng != null
                        ? { lat: String(draft.target.lat), lng: String(draft.target.lng) }
                        : {}),
                    })
                  }
                  className="size-4 accent-orange-500"
                />
                Solo una zona
              </label>
            </div>
            {draft.geoScope === "radius" ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <label className="block">
                    <span className={adminLabelClass}>Latitud</span>
                    <input value={draft.lat} onChange={(event) => set({ lat: event.target.value })} className={adminInputClass} inputMode="decimal" placeholder="19.7060" />
                  </label>
                  <label className="block">
                    <span className={adminLabelClass}>Longitud</span>
                    <input value={draft.lng} onChange={(event) => set({ lng: event.target.value })} className={adminInputClass} inputMode="decimal" placeholder="-101.1950" />
                  </label>
                  <label className="block">
                    <span className={adminLabelClass}>Radio (km)</span>
                    <input value={draft.radiusKm} onChange={(event) => set({ radiusKm: event.target.value })} className={adminInputClass} inputMode="numeric" />
                  </label>
                </div>
                <label className="block">
                  <span className={adminLabelClass}>Nombre de la zona (para el reporte)</span>
                  <input value={draft.zoneLabel} onChange={(event) => set({ zoneLabel: event.target.value })} className={adminInputClass} placeholder="Morelia y 15 km" />
                </label>
                <p className="text-xs text-dash-faint">
                  En el detalle de un animal o veterinaria se mide desde su ubicación; en blog y tienda, desde la ubicación aproximada de quien visita. Sin ubicación, no se muestra.
                  {draft.target?.lat != null && draft.target.lng != null ? (
                    <>
                      {" "}
                      <button
                        type="button"
                        className="font-semibold text-dash-ink underline underline-offset-2"
                        onClick={() => set({ lat: String(draft.target?.lat), lng: String(draft.target?.lng) })}
                      >
                        Usar la ubicación del destino
                      </button>
                    </>
                  ) : null}
                </p>
              </>
            ) : null}
          </fieldset>

          <fieldset className="flex flex-col gap-4 rounded-2xl border border-dash-line p-4">
            <legend className="px-1 text-[13px] font-semibold text-dash-soft">Anunciante y pago</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={adminLabelClass}>Anunciante</span>
                <input value={draft.advertiserName} onChange={(event) => set({ advertiserName: event.target.value })} className={adminInputClass} placeholder="Veterinaria San Roque" />
              </label>
              <label className="block">
                <span className={adminLabelClass}>Contacto</span>
                <input value={draft.advertiserContact} onChange={(event) => set({ advertiserContact: event.target.value })} className={adminInputClass} placeholder="Teléfono o correo" />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="block">
                <span className={adminLabelClass}>Precio (MXN)</span>
                <input value={draft.price} onChange={(event) => set({ price: event.target.value })} className={adminInputClass} inputMode="decimal" placeholder="0" />
              </label>
              <label className="block">
                <span className={adminLabelClass}>Pago</span>
                <select value={draft.paymentStatus} onChange={(event) => set({ paymentStatus: event.target.value })} className={adminSelectClass}>
                  {AD_PAYMENT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={adminLabelClass}>Forma de pago</span>
                <select value={draft.paymentMethod} onChange={(event) => set({ paymentMethod: event.target.value })} className={adminSelectClass}>
                  {AD_PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className={adminLabelClass}>Notas del pago (interno)</span>
              <textarea value={draft.paymentNote} onChange={(event) => set({ paymentNote: event.target.value })} className={adminTextareaClass} rows={2} placeholder="Referencia de la transferencia, factura…" />
            </label>
          </fieldset>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-0 lg:self-start">
          <label className="block">
            <span className={adminLabelClass}>Estado</span>
            <select value={draft.status} onChange={(event) => set({ status: event.target.value })} className={adminSelectClass}>
              {AD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-dash-faint">Solo «Activo» y dentro de sus fechas se muestra.</span>
          </label>

          <p className="text-[13px] font-semibold text-dash-soft">Así se ve</p>
          <AdPreviewCard
            kind={draft.kind}
            tone={draft.tone}
            brandLabel={draft.brandLabel}
            title={draft.title}
            body={draft.body}
            ctaLabel={draft.ctaLabel}
            imageUrl={previewImage}
            width="side"
          />
          {draft.price && !Number.isNaN(inputToCents(draft.price)) ? (
            <p className="text-xs text-dash-muted">Precio: {formatCents(inputToCents(draft.price))}</p>
          ) : null}

          {adStats ? (
            <div className="rounded-2xl border border-dash-line p-3 text-sm">
              <p className="font-semibold text-dash-ink">Últimos 30 días</p>
              <p className="mt-1 tabular-nums text-dash-soft">
                {adStats.impressions.toLocaleString("es-MX")} impresiones · {adStats.clicks.toLocaleString("es-MX")} clics ·{" "}
                {formatCtr(adStats.clicks, adStats.impressions)}
              </p>
              <AdminButton variant="outline" size="sm" className="mt-2" onClick={() => void copyReport()}>
                Copiar reporte para el anunciante
              </AdminButton>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <AdminButton variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </AdminButton>
          </div>
        </div>
      </form>
    </AdminModal>
  );
}
