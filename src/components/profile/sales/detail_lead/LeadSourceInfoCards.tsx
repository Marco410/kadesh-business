import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon, StarIcon } from "@hugeicons/core-free-icons";
import type { TechBusinessLeadResponse } from "kadesh/components/profile/sales/queries";
import { Field, SectionCard } from "./LeadDetailCard";

type Lead = NonNullable<TechBusinessLeadResponse["techBusinessLead"]>;

function mapsHref(
  lat: number | null | undefined,
  lng: number | null | undefined,
  googleMapsUrl?: string | null
): string | null {
  if (googleMapsUrl) return googleMapsUrl;
  if (lat != null && lng != null) return `https://www.google.com/maps?q=${lat},${lng}`;
  return null;
}

function joinAddressParts(
  street: string | null,
  exterior: string | null,
  interior: string | null
): string | null {
  const line = [street, exterior, interior ? `int. ${interior}` : null]
    .filter(Boolean)
    .join(" ")
    .trim();
  return line || null;
}

export function LeadGoogleInfoCard({
  lead,
  headerPipelineStatus,
  className,
}: {
  lead: Lead;
  headerPipelineStatus?: string;
  className?: string;
}) {
  const topReviews = [
    lead.topReview1,
    lead.topReview2,
    lead.topReview3,
    lead.topReview4,
    lead.topReview5,
  ].filter(Boolean) as string[];
  const mapUrl = mapsHref(lead.lat, lead.lng, lead.googleMapsUrl);

  return (
    <SectionCard
      title="Info de Google"
      headerPipelineStatus={headerPipelineStatus}
      className={className}
    >
      <dl>
        {mapUrl ? (
          <Field label="Mapa">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-orange-500 dark:text-orange-400 hover:underline"
            >
              <HugeiconsIcon icon={Location01Icon} size={14} />
              Ver en el mapa
            </a>
          </Field>
        ) : null}
        <Field label="Rating">
          {lead.rating != null ? (
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <HugeiconsIcon
                icon={StarIcon}
                size={14}
                className="text-amber-500"
              />
              {Number(lead.rating).toFixed(1)}
            </span>
          ) : (
            "—"
          )}
        </Field>
        <Field
          label="Nº reseñas"
          value={lead.reviewCount != null ? lead.reviewCount : "—"}
        />
        {topReviews.length > 0 ? (
          <div className="pt-1.5">
            <p className="text-[#616161] dark:text-[#b0b0b0] font-medium text-sm mb-1">
              Reseñas destacadas
            </p>
            <ul className="space-y-1.5 text-[#212121] dark:text-[#ffffff] text-sm">
              {topReviews.map((review, i) => (
                <li
                  key={i}
                  className="line-clamp-3 rounded-md bg-[#fafafa] dark:bg-[#252525] px-2 py-1.5"
                >
                  {review}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </dl>
    </SectionCard>
  );
}

export function LeadInegiInfoCard({
  lead,
  headerPipelineStatus,
  className,
}: {
  lead: Lead;
  headerPipelineStatus?: string;
  className?: string;
}) {
  const est = lead.sourceEstablishment;
  const streetLine = est
    ? joinAddressParts(est.street, est.exteriorNumber, est.interiorNumber)
    : null;
  const lat = est?.lat ?? lead.lat;
  const lng = est?.lng ?? lead.lng;
  const mapUrl = mapsHref(lat, lng, lead.googleMapsUrl);
  const activityName = est?.economicActivity?.name ?? null;

  return (
    <SectionCard
      title="Registro INEGI"
      headerPipelineStatus={headerPipelineStatus}
      className={className}
    >
      <dl>
        {est?.legalName ? <Field label="Razón social" value={est.legalName} /> : null}
        {activityName ? <Field label="Actividad" value={activityName} /> : null}
        {est?.employeeStratum ? (
          <Field label="Empleados" value={est.employeeStratum} />
        ) : null}
        {streetLine ? <Field label="Calle" value={streetLine} /> : null}
        {est?.neighborhood ? <Field label="Colonia" value={est.neighborhood} /> : null}
        {est?.postalCode ? <Field label="C.P." value={est.postalCode} /> : null}
        {est?.locality ? <Field label="Localidad" value={est.locality} /> : null}
        {est?.municipality && est.municipality !== lead.city ? (
          <Field label="Municipio" value={est.municipality} />
        ) : null}
        {est?.state && est.state !== lead.state ? (
          <Field label="Entidad" value={est.state} />
        ) : null}
        <Field label="Mapa">
          {mapUrl ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-orange-500 dark:text-orange-400 hover:underline"
            >
              <HugeiconsIcon icon={Location01Icon} size={14} />
              Ver en el mapa
            </a>
          ) : lat != null && lng != null ? (
            <span className="tabular-nums text-xs">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          ) : (
            "—"
          )}
        </Field>
      </dl>
    </SectionCard>
  );
}
