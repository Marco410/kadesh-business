"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";

import { GOOGLE_PLACE_CATEGORIES, PLAN_FEATURE_KEYS } from "kadesh/components/profile/sales/constants";
import { Autocomplete, type AutocompleteOption } from "kadesh/components/shared";
import LocationPicker from "kadesh/components/shared/LocationPicker";
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
  { value: "Google Maps", label: "Google Maps" },
  { value: "Referido", label: "Referido" },
  { value: "Redes sociales", label: "Redes sociales" },
  { value: "Sitio web", label: "Sitio web" },
  { value: "Llamada en frío", label: "Llamada en frío" },
  { value: "Evento", label: "Evento" },
  { value: "Otro", label: "Otro" },
] as const;

const OPPORTUNITY_LEVELS = [
  { value: "Alta", label: "Alta" },
  { value: "Media", label: "Media" },
  { value: "Baja", label: "Baja" },
] as const;

const inputClassName =
  "w-full px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#9e9e9e] dark:placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 transition-colors";

const labelClassName =
  "block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-1";

export default function AddLeadSection() {
  const router = useRouter();
  const { subscription } = useSubscription();

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
  const [source, setSource] = useState("Otro");
  const [notes, setNotes] = useState("");
  const [opportunityLevel, setOpportunityLevel] = useState("Media");
  const [topReview1, setTopReview1] = useState("");
  const [topReview2, setTopReview2] = useState("");
  const [topReview3, setTopReview3] = useState("");
  const [topReview4, setTopReview4] = useState("");
  const [topReview5, setTopReview5] = useState("");
  const [showMap, setShowMap] = useState(false);

  const [addOwnLead, { loading }] = useMutation<
    AddOwnLeadResult,
    AddOwnLeadVariables
  >(ADD_OWN_LEAD_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      sileo.error({ title: "El nombre del negocio es obligatorio" });
      return;
    }
    if (!category) {
      sileo.error({ title: "La categoría es obligatoria" });
      return;
    }

    const latNum = lat ? parseFloat(lat) : undefined;
    const lngNum = lng ? parseFloat(lng) : undefined;

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
          ...(topReview1 && { topReview1 }),
          ...(topReview2 && { topReview2 }),
          ...(topReview3 && { topReview3 }),
          ...(topReview4 && { topReview4 }),
          ...(topReview5 && { topReview5 }),
        },
      },
    }).then((res) => {
      const result = res.data?.addOwnLead;
      if (!result?.success) {
        throw new Error(result?.message ?? "Error al agregar el lead");
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
        title: err instanceof Error ? err.message : "Error al agregar el lead",
      }),
    });
  };

  const hasAddOwnLeadsFeature = hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.ADD_OWN_LEADS);

  if (!hasAddOwnLeadsFeature) {
    return <FeatureLockedSection sectionName="Agregar cliente" />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href={`${Routes.panel}?tab=ventas`}
          className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Volver a Ventas
        </Link>
      </div>

      <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-sm">
        <div className="px-6 py-5 border-b border-[#e0e0e0] dark:border-[#3a3a3a]">
          <h1 className="text-xl font-bold text-[#212121] dark:text-white">
            Agregar nuevo cliente
          </h1>
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0] mt-1">
            Completa la información del negocio. Solo el nombre y la categoría son obligatorios.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información principal */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-[#212121] dark:text-white uppercase tracking-wide mb-2">
              Información principal
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>
                  Nombre del negocio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClassName}
                  placeholder="Ej: Restaurante La Casa"
                  required
                />
              </div>
              <div>
                <label className={labelClassName}>
                  Categoría <span className="text-red-500">*</span>
                </label>
                <Autocomplete
                  id="add-lead-category"
                  value={category}
                  options={GOOGLE_PLACE_CATEGORIES.map(
                    (opt): AutocompleteOption => ({
                      id: opt.value,
                      label: opt.label,
                    })
                  )}
                  onChange={() => { } }
                  onSelect={(option) => setCategory(option.id)}
                  placeholder="Buscar categoría..."
                  className="w-full" label={""}                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Fuente</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className={inputClassName}
                >
                  {LEAD_SOURCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClassName}>Nivel de oportunidad</label>
                <select
                  value={opportunityLevel}
                  onChange={(e) => setOpportunityLevel(e.target.value)}
                  className={inputClassName}
                >
                  {OPPORTUNITY_LEVELS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Contacto */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-[#212121] dark:text-white uppercase tracking-wide mb-2">
              Contacto
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Teléfono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClassName}
                  placeholder="Ej: +52 55 1234 5678"
                />
              </div>
              <div>
                <label className={labelClassName}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder="contacto@negocio.com"
                />
              </div>
            </div>
          </fieldset>

          {/* Redes sociales */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-[#212121] dark:text-white uppercase tracking-wide mb-2">
              Redes sociales y web
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClassName}>Sitio web</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className={inputClassName}
                  placeholder="https://www.ejemplo.com"
                />
              </div>
              <div>
                <label className={labelClassName}>Instagram</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className={inputClassName}
                  placeholder="@usuario"
                />
              </div>
              <div>
                <label className={labelClassName}>Facebook</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className={inputClassName}
                  placeholder="URL o nombre de página"
                />
              </div>
              <div>
                <label className={labelClassName}>X / Twitter</label>
                <input
                  type="text"
                  value={xTwitter}
                  onChange={(e) => setXTwitter(e.target.value)}
                  className={inputClassName}
                  placeholder="@usuario"
                />
              </div>
              <div>
                <label className={labelClassName}>TikTok</label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  className={inputClassName}
                  placeholder="@usuario"
                />
              </div>
            </div>
          </fieldset>

          {/* Ubicación */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-[#212121] dark:text-white uppercase tracking-wide mb-2">
              Ubicación
            </legend>

            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              {showMap ? "Ocultar mapa" : "Seleccionar ubicación en el mapa"}
            </button>

            {showMap && (
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
                onAddressChange={(newAddress, newCity, newState, newCountry) => {
                  setAddress(newAddress);
                  setCity(newCity);
                  setState(newState);
                  setCountry(newCountry);
                }}
                isVisible={showMap}
              />
            )}

            {!showMap && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClassName}>Dirección</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={inputClassName}
                    placeholder="Calle y número"
                  />
                </div>
                <div>
                  <label className={labelClassName}>Ciudad</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClassName}
                    placeholder="Ciudad"
                  />
                </div>
                <div>
                  <label className={labelClassName}>Estado</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className={inputClassName}
                    placeholder="Estado / Provincia"
                  />
                </div>
                <div>
                  <label className={labelClassName}>País</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={inputClassName}
                    placeholder="País"
                  />
                </div>
              </div>
            )}
          </fieldset>

          {/* Notas */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-[#212121] dark:text-white uppercase tracking-wide mb-2">
              Notas
            </legend>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={inputClassName}
              placeholder="Notas adicionales sobre el cliente..."
            />
          </fieldset>

          {/* Reviews */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-[#212121] dark:text-white uppercase tracking-wide mb-2">
              Reseñas destacadas
            </legend>
            <p className="text-xs text-[#616161] dark:text-[#b0b0b0] -mt-2">
              Agrega hasta 5 reseñas relevantes del negocio (opcional).
            </p>
            {[
              { value: topReview1, setter: setTopReview1 },
              { value: topReview2, setter: setTopReview2 },
              { value: topReview3, setter: setTopReview3 },
              { value: topReview4, setter: setTopReview4 },
              { value: topReview5, setter: setTopReview5 },
            ].map((review, i) => (
              <div key={i}>
                <label className={labelClassName}>Reseña {i + 1}</label>
                <input
                  type="text"
                  value={review.value}
                  onChange={(e) => review.setter(e.target.value)}
                  className={inputClassName}
                  placeholder={`Reseña ${i + 1}`}
                />
              </div>
            ))}
          </fieldset>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Guardando..." : "Agregar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
