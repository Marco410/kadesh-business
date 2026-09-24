"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Building02Icon,
  FileIcon,
  Location01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";

import {
  GOOGLE_PLACE_CATEGORIES,
  PLAN_FEATURE_KEYS,
} from "kadesh/constants/constans";
import {
  Autocomplete,
  type AutocompleteOption,
} from "kadesh/components/shared";
import LocationPicker from "kadesh/components/shared/LocationPicker";
import { TourHelpButton } from "kadesh/components/onboarding";
import { Routes } from "kadesh/core/routes";
import {
  ADD_OWN_LEAD_MUTATION,
  type AddOwnLeadVariables,
  type AddOwnLeadResult,
} from "./queries";
import { hasPlanFeature } from "../helpers/plan-features";
import { useSubscription } from "../SubscriptionContext";
import FeatureLockedSection from "../FeatureLockedSection";

const LEAD_SOURCE_OPTIONS = [
  { value: "Referido", label: "Referido" },
  { value: "Google Maps", label: "Google Maps" },
  { value: "INEGI", label: "INEGI" },
  { value: "Redes sociales", label: "Redes sociales" },
  { value: "Sitio web", label: "Sitio web" },
  { value: "Llamada en frío", label: "Llamada en frío" },
  { value: "Evento", label: "Evento" },
  { value: "Otro", label: "Otro" },
] as const;

const OPPORTUNITY_LEVELS = [
  {
    value: "Alta",
    label: "Alta",
    active: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25",
  },
  {
    value: "Media",
    label: "Media",
    active: "bg-orange-500 text-white shadow-sm shadow-orange-500/25",
  },
  {
    value: "Baja",
    label: "Baja",
    active: "bg-slate-500 text-white shadow-sm shadow-slate-500/25",
  },
] as const;

const STEPS = [
  {
    id: 1,
    title: "El negocio",
    hint: "Nombre y categoría",
    icon: Building02Icon,
  },
  { id: 2, title: "Ubicación", hint: "Opcional", icon: Location01Icon },
  { id: 3, title: "Más datos", hint: "Opcional", icon: FileIcon },
] as const;

const inputClassName =
  "w-full px-3 py-2.5 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#9e9e9e] dark:placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-[box-shadow,border-color] duration-150";

const labelClassName =
  "block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

function Field({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClassName}>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

export default function AddLeadSection() {
  const router = useRouter();
  const { subscription } = useSubscription();
  const formTopRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [xTwitter, setXTwitter] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [source, setSource] = useState("Referido");
  const [notes, setNotes] = useState("");
  const [opportunityLevel, setOpportunityLevel] = useState("Media");
  const [reviews, setReviews] = useState<string[]>([""]);
  const [showMap, setShowMap] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const categoryOptions = useMemo<AutocompleteOption[]>(
    () =>
      GOOGLE_PLACE_CATEGORIES.map((opt) => ({
        id: opt.value,
        label: opt.label,
      })),
    [],
  );

  const [addOwnLead, { loading }] = useMutation<
    AddOwnLeadResult,
    AddOwnLeadVariables
  >(ADD_OWN_LEAD_MUTATION);

  const canSave = businessName.trim().length > 0 && category.length > 0;

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    formTopRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }, [step]);

  const goNext = () => {
    if (step === 1 && !canSave) {
      sileo.error({
        title: "Faltan datos del negocio",
        description:
          "El nombre y la categoría son obligatorios para continuar.",
      });
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const goToStep = (next: number) => {
    if (next === step) return;
    if (next > 1 && !canSave) {
      sileo.error({
        title: "Completa el negocio primero",
        description: "Nombre y categoría son obligatorios.",
      });
      return;
    }
    setStep(next);
  };

  const saveLead = async () => {
    if (!businessName.trim()) {
      setStep(1);
      sileo.error({ title: "El nombre del negocio es obligatorio" });
      return;
    }
    if (!category) {
      setStep(1);
      sileo.error({ title: "La categoría es obligatoria" });
      return;
    }

    const latNum = lat ? parseFloat(lat) : undefined;
    const lngNum = lng ? parseFloat(lng) : undefined;
    const reviewValues = reviews.map((r) => r.trim()).filter(Boolean);

    const promise = addOwnLead({
      variables: {
        input: {
          businessName: businessName.trim(),
          category,
          ...(phone && { phone }),
          ...(email && { email }),
          ...(address && { address }),
          ...(city && { city }),
          ...(state && { state }),
          ...(country && { country }),
          ...(websiteUrl && { websiteUrl }),
          ...(instagram && { instagram }),
          ...(facebook && { facebook }),
          ...(xTwitter && { xTwitter }),
          ...(tiktok && { tiktok }),
          ...(latNum && lngNum && { lat: latNum, lng: lngNum }),
          source,
          ...(notes && { notes }),
          opportunityLevel,
          ...(reviewValues[0] && { topReview1: reviewValues[0] }),
          ...(reviewValues[1] && { topReview2: reviewValues[1] }),
          ...(reviewValues[2] && { topReview3: reviewValues[2] }),
          ...(reviewValues[3] && { topReview4: reviewValues[3] }),
          ...(reviewValues[4] && { topReview5: reviewValues[4] }),
        },
      },
    }).then((res) => {
      const result = res.data?.addOwnLead;
      if (!result?.success) {
        throw new Error(result?.message ?? "Error al agregar el cliente");
      }
      if (result.leadId) {
        router.push(Routes.panelLead(result.leadId));
      }
      return result;
    });

    sileo.promise(promise, {
      loading: { title: "Agregando cliente..." },
      success: (data) => ({ title: data.message }),
      error: (err) => ({
        title:
          err instanceof Error ? err.message : "Error al agregar el cliente",
      }),
    });
  };

  const hasAddOwnLeadsFeature = hasPlanFeature(
    subscription?.planFeatures,
    PLAN_FEATURE_KEYS.ADD_OWN_LEADS,
  );

  if (!hasAddOwnLeadsFeature) {
    return <FeatureLockedSection sectionName="Agregar cliente" />;
  }

  return (
    <div
      ref={formTopRef}
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-6">
        <Link
          href={`${Routes.panel}?tab=clientes`}
          className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a Clientes
        </Link>
      </div>

      <div className="rounded-xl border border-orange-200/60 dark:border-orange-900/40 bg-white dark:bg-[#1e1e1e] shadow-sm">
        <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-gradient-to-br from-orange-500/[0.07] to-transparent dark:from-orange-500/10">
          <div>
            <h1 className="text-xl font-bold text-[#212121] dark:text-white">
              Agregar cliente
            </h1>
            <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
              Paso {step} de 3. Con nombre y categoría ya puedes guardar.
            </p>
          </div>
          <TourHelpButton tourId="agregar-cliente" />
        </div>

        <nav
          aria-label="Pasos del formulario"
          className="px-4 sm:px-6 py-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a]"
        >
          <ol className="grid grid-cols-3 gap-2">
            {STEPS.map((item, index) => {
              const isCurrent = step === item.id;
              const isDone = step > item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => goToStep(item.id)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-[background-color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-orange-500/[0.06] active:scale-[0.98] ${
                      isCurrent ? "bg-orange-500/10 dark:bg-orange-500/15" : ""
                    }`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <span
                      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                            ? "bg-orange-500 text-white"
                            : "bg-[#ececec] dark:bg-[#2a2a2a] text-[#616161] dark:text-[#b0b0b0]"
                      }`}
                    >
                      {isDone ? (
                        <HugeiconsIcon icon={Tick02Icon} size={14} />
                      ) : (
                        <HugeiconsIcon icon={item.icon} size={14} />
                      )}
                    </span>
                    <span className="min-w-0 hidden sm:block">
                      <span className="block text-xs font-semibold text-[#212121] dark:text-white truncate">
                        {index + 1}. {item.title}
                      </span>
                      <span className="block text-[11px] text-[#9e9e9e] dark:text-[#777]">
                        {item.hint}
                      </span>
                    </span>
                    <span className="sm:hidden text-xs font-semibold text-[#212121] dark:text-white">
                      {item.id}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 3) void saveLead();
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const tag = (e.target as HTMLElement).tagName;
            if (tag === "TEXTAREA" || tag === "BUTTON") return;
            e.preventDefault();
            if (step < 3) goNext();
            else void saveLead();
          }}
        >
          <div key={step} className="clientes-pop-in p-6 min-h-[280px]">
            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field
                    label="Nombre del negocio"
                    required
                    htmlFor="add-lead-name"
                  >
                    <input
                      id="add-lead-name"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={inputClassName}
                      placeholder="Ej: Restaurante La Casa"
                      autoFocus
                      autoComplete="organization"
                    />
                  </Field>
                  <Field label="Categoría" required htmlFor="add-lead-category">
                    <Autocomplete
                      id="add-lead-category"
                      label=""
                      hideLabel
                      value={category}
                      options={categoryOptions}
                      onChange={() => {}}
                      onSelect={(option) => setCategory(option.id)}
                      placeholder="Buscar categoría…"
                    />
                  </Field>
                </div>

                <Field label="Teléfono" htmlFor="add-lead-phone">
                  <input
                    id="add-lead-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClassName}
                    placeholder="Ej: +52 55 1234 5678"
                    autoComplete="tel"
                  />
                </Field>

                <div>
                  <p className={labelClassName} id="add-lead-source-label">
                    Fuente
                  </p>
                  <div
                    role="group"
                    aria-labelledby="add-lead-source-label"
                    className="flex flex-wrap gap-1.5"
                  >
                    {LEAD_SOURCE_OPTIONS.map((o) => {
                      const selected = source === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setSource(o.value)}
                          className={`inline-flex px-2.5 py-1.5 rounded-md text-xs font-medium transition-[transform,background-color,color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:scale-[1.03] active:scale-[0.97] ${
                            selected
                              ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                              : "bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#616161] dark:text-[#b0b0b0] hover:bg-orange-500/10"
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className={labelClassName} id="add-lead-opp-label">
                    Nivel de oportunidad
                  </p>
                  <div
                    role="group"
                    aria-labelledby="add-lead-opp-label"
                    className="grid grid-cols-3 gap-2"
                  >
                    {OPPORTUNITY_LEVELS.map((o) => {
                      const selected = opportunityLevel === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => setOpportunityLevel(o.value)}
                          className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] ${
                            selected
                              ? o.active
                              : "bg-[#f5f5f5] dark:bg-[#2a2a2a] text-[#616161] dark:text-[#b0b0b0] hover:bg-orange-500/10"
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                  Puedes saltar este paso. El mapa rellena dirección, ciudad y
                  país.
                </p>
                <button
                  type="button"
                  onClick={() => setShowMap((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
                >
                  <HugeiconsIcon icon={Location01Icon} size={16} />
                  {showMap
                    ? "Escribir la dirección a mano"
                    : "Elegir en el mapa"}
                </button>

                {showMap ? (
                  <LocationPicker
                    lat={lat}
                    lng={lng}
                    address={address}
                    city={city}
                    state={state}
                    country={country}
                    onLocationChange={(newLat, newLng) => {
                      setLat(newLat);
                      setLng(newLng);
                    }}
                    onAddressChange={(
                      newAddress,
                      newCity,
                      newState,
                      newCountry,
                    ) => {
                      setAddress(newAddress);
                      setCity(newCity);
                      setState(newState);
                      setCountry(newCountry);
                    }}
                    isVisible={showMap}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Field label="Dirección" htmlFor="add-lead-address">
                        <input
                          id="add-lead-address"
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className={inputClassName}
                          placeholder="Calle y número"
                          autoComplete="street-address"
                        />
                      </Field>
                    </div>
                    <Field label="Ciudad" htmlFor="add-lead-city">
                      <input
                        id="add-lead-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={inputClassName}
                        placeholder="Ciudad"
                        autoComplete="address-level2"
                      />
                    </Field>
                    <Field label="Estado" htmlFor="add-lead-state">
                      <input
                        id="add-lead-state"
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={inputClassName}
                        placeholder="Estado / Provincia"
                        autoComplete="address-level1"
                      />
                    </Field>
                    <Field label="País" htmlFor="add-lead-country">
                      <input
                        id="add-lead-country"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={inputClassName}
                        placeholder="País"
                        autoComplete="country-name"
                      />
                    </Field>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div className="rounded-lg border border-orange-200/50 dark:border-orange-900/30 bg-orange-500/[0.05] px-3 py-2.5 text-sm text-[#616161] dark:text-[#b0b0b0]">
                  <span className="font-semibold text-[#212121] dark:text-white">
                    {businessName.trim() || "Sin nombre"}
                  </span>
                  {phone ? ` · ${phone}` : ""}
                  {city ? ` · ${city}` : ""}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Email" htmlFor="add-lead-email">
                    <input
                      id="add-lead-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClassName}
                      placeholder="contacto@negocio.com"
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="Sitio web" htmlFor="add-lead-web">
                    <input
                      id="add-lead-web"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className={inputClassName}
                      placeholder="https://www.ejemplo.com"
                    />
                  </Field>
                  <Field label="Instagram" htmlFor="add-lead-ig">
                    <input
                      id="add-lead-ig"
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className={inputClassName}
                      placeholder="@usuario"
                    />
                  </Field>
                  <Field label="Facebook" htmlFor="add-lead-fb">
                    <input
                      id="add-lead-fb"
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      className={inputClassName}
                      placeholder="URL o página"
                    />
                  </Field>
                  <Field label="X / Twitter" htmlFor="add-lead-x">
                    <input
                      id="add-lead-x"
                      type="text"
                      value={xTwitter}
                      onChange={(e) => setXTwitter(e.target.value)}
                      className={inputClassName}
                      placeholder="@usuario"
                    />
                  </Field>
                  <Field label="TikTok" htmlFor="add-lead-tt">
                    <input
                      id="add-lead-tt"
                      type="text"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      className={inputClassName}
                      placeholder="@usuario"
                    />
                  </Field>
                </div>

                <Field label="Notas" htmlFor="add-lead-notes">
                  <textarea
                    id="add-lead-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className={inputClassName}
                    placeholder="Contexto comercial, cómo los conociste…"
                  />
                </Field>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowReviews((v) => !v)}
                    className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors"
                  >
                    {showReviews
                      ? "Ocultar reseñas"
                      : "Añadir reseñas (opcional)"}
                  </button>
                  {showReviews && (
                    <div className="mt-3 space-y-2">
                      {reviews.map((review, i) => (
                        <input
                          key={i}
                          type="text"
                          value={review}
                          onChange={(e) => {
                            const next = [...reviews];
                            next[i] = e.target.value;
                            setReviews(next);
                          }}
                          className={inputClassName}
                          placeholder={`Reseña ${i + 1}`}
                          aria-label={`Reseña ${i + 1}`}
                        />
                      ))}
                      {reviews.length < 5 && (
                        <button
                          type="button"
                          onClick={() => setReviews((prev) => [...prev, ""])}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500"
                        >
                          <HugeiconsIcon icon={Add01Icon} size={14} />
                          Otra reseña
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a] bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => (step === 1 ? router.back() : goBack())}
              className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] active:scale-[0.98] transition-[transform,background-color] duration-150"
            >
              {step === 1 ? "Cancelar" : "Atrás"}
            </button>
            <div className="flex flex-col sm:flex-row gap-2">
              {step < 3 && (
                <button
                  type="button"
                  disabled={loading || !canSave}
                  onClick={() => void saveLead()}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-500/10 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-[transform,background-color] duration-150"
                >
                  Guardar ahora
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-orange-500 hover:bg-orange-600 hover:-translate-y-px active:scale-[0.98] shadow-sm shadow-orange-500/25 transition-[transform,background-color] duration-150"
                >
                  Continuar
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading || !canSave}
                  onClick={() => void saveLead()}
                  className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-orange-500 hover:bg-orange-600 hover:-translate-y-px active:scale-[0.98] shadow-sm shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,background-color] duration-150"
                >
                  {loading ? "Guardando…" : "Agregar cliente"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
