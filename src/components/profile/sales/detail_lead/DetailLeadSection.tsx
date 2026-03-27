"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import {
  TECH_BUSINESS_LEAD_QUERY,
  UPDATE_TECH_BUSINESS_LEAD_MUTATION,
  UPDATE_TECH_STATUS_BUSINESS_LEAD_MUTATION,
  CREATE_TECH_STATUS_BUSINESS_LEAD_MUTATION,
  USER_COMPANY_CATEGORIES_QUERY,
  type TechBusinessLeadResponse,
  type TechBusinessLeadVariables,
  type UpdateTechBusinessLeadVariables,
  type UpdateTechBusinessLeadMutation,
  type UpdateTechStatusBusinessLeadVariables,
  type UpdateTechStatusBusinessLeadMutation,
  type CreateTechStatusBusinessLeadVariables,
  type CreateTechStatusBusinessLeadMutation,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import {
  DEFAULT_PIPELINE_SECTION_HEADER,
  PIPELINE_STATUS_SECTION_HEADER,
  PLAN_FEATURE_KEYS,
} from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, FolderIcon } from "@hugeicons/core-free-icons";
import LeadCrmActions from "./LeadCrmActions";
import LeadDetailCalendar from "./LeadDetailCalendar";
import LeadPipelineNotesFields from "./LeadPipelineNotesFields";
import LeadProjectsModal from "./LeadProjectsModal";
import { getCategoryLabel } from "../helpers/category";
import { sileo } from "sileo";
import { useUser } from "kadesh/utils/UserContext";
import { formatDateShort } from "kadesh/utils/format-date";
import { Role } from "kadesh/constants/constans";
import { hasPlanFeature } from "../helpers/plan-features";
import { useSubscription } from "../SubscriptionContext";

function whatsappDigitsFromPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `52${digits}`;
  return digits;
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0">
      <dt className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0">
        {label}
      </dt>
      <dd className="text-[#212121] dark:text-[#ffffff] min-w-0 break-words">
        {children ?? (value != null && value !== "" ? String(value) : "—")}
      </dd>
    </div>
  );
}

function SectionCard({
  title,
  headerClassName,
  headerPipelineStatus,
  children,
}: {
  title: string;
  headerClassName?: string;
  /** Encabezado con degradado en el mismo tono que el pipeline del lead. */
  headerPipelineStatus?: string;
  children: React.ReactNode;
}) {
  const baseHeader =
    "px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b";

  const headerClasses =
    headerPipelineStatus !== undefined
      ? `${baseHeader} ${
          headerPipelineStatus && PIPELINE_STATUS_SECTION_HEADER[headerPipelineStatus]
            ? PIPELINE_STATUS_SECTION_HEADER[headerPipelineStatus]
            : DEFAULT_PIPELINE_SECTION_HEADER
        }`
      : (headerClassName ??
        `${baseHeader} text-[#616161] dark:text-[#b0b0b0] bg-[#f5f5f5] dark:bg-[#2a2a2a] border-[#e0e0e0] dark:border-[#3a3a3a]`);

  return (
    <div className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
      <h2 className={headerClasses}>{title}</h2>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}

function SaveLeadButton({
  saving,
  handleSaveLead,
}: {
  saving: boolean;
  handleSaveLead: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 pt-4 pb-4 justify-end">
      <button
        type="button"
        onClick={handleSaveLead}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Guardando..." : "Guardar cambios"}
      </button>
    </div>
  );
}

export default function DetailLeadSection() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { subscription } = useSubscription();
  const id = typeof params?.id === "string" ? params.id : "";

  const { data: userCompanyData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: user?.id ?? "" } },
    skip: !user?.id,
  });

  const companyId = userCompanyData?.user?.company?.id ?? null;
  const isAdminCompany = user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;

  /** Mismo criterio que SalesSection: solo traer el status de esta company (y vendedor si no es admin). */
  const statusWhere =
    companyId != null
      ? isAdminCompany
        ? { saasCompany: { id: { equals: companyId } } }
        : user?.id
          ? {
              AND: [
                { saasCompany: { id: { equals: companyId } } },
                { salesPerson: { id: { equals: user.id } } },
              ],
            }
          : { saasCompany: { id: { equals: companyId } } }
      : undefined;

  const queryVariables: TechBusinessLeadVariables = {
    where: { id },
    statusWhere: statusWhere ?? null,
  };

  const { data, loading, error, refetch: refetchLead } = useQuery<
    TechBusinessLeadResponse,
    TechBusinessLeadVariables
  >(TECH_BUSINESS_LEAD_QUERY, {
    variables: queryVariables,
    skip: !id,
  });

  const [updateLead, { loading: savingLead }] = useMutation<
    UpdateTechBusinessLeadMutation,
    UpdateTechBusinessLeadVariables
  >(UPDATE_TECH_BUSINESS_LEAD_MUTATION, {
    refetchQueries: [{ query: TECH_BUSINESS_LEAD_QUERY, variables: queryVariables }],
  });

  const [updateStatus, { loading: savingStatus }] = useMutation<
    UpdateTechStatusBusinessLeadMutation,
    UpdateTechStatusBusinessLeadVariables
  >(UPDATE_TECH_STATUS_BUSINESS_LEAD_MUTATION, {
    refetchQueries: [{ query: TECH_BUSINESS_LEAD_QUERY, variables: queryVariables }],
  });

  const [createStatus, { loading: creatingStatus }] = useMutation<
    CreateTechStatusBusinessLeadMutation,
    CreateTechStatusBusinessLeadVariables
  >(CREATE_TECH_STATUS_BUSINESS_LEAD_MUTATION, {
    refetchQueries: [{ query: TECH_BUSINESS_LEAD_QUERY, variables: queryVariables }],
  });

  const lead = data?.techBusinessLead ?? null;
  const projectsList = lead?.projects ?? [];
  const projectsCount = projectsList.length;
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const statusRaw = lead?.status;
  const statuses = Array.isArray(statusRaw)
    ? statusRaw
    : statusRaw
      ? [statusRaw]
      : [];
  const status = statuses[0] ?? null;
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [xTwitter, setXTwitter] = useState("");
  const [productOffered, setProductOffered] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null);
  const [firstContactDate, setFirstContactDate] = useState("");

  useEffect(() => {
    if (lead) {
      setPipelineStatus(status?.pipelineStatus ?? "");
      setNotes(status?.notes ?? "");
      setFacebook(lead.facebook ?? "");
      setInstagram(lead.instagram ?? "");
      setTiktok(lead.tiktok ?? "");
      setXTwitter(lead.xTwitter ?? "");
      setProductOffered(status?.productOffered ?? "");
      setHasWebsite(lead.hasWebsite ?? null);
      setFirstContactDate(status?.firstContactDate?.slice(0, 10) ?? "");
      setWebsiteUrl(lead.websiteUrl ?? "");
    }
  }, [
    lead?.id,
    status?.pipelineStatus,
    status?.notes,
    status?.productOffered,
    status?.firstContactDate,
    lead?.facebook,
    lead?.instagram,
    lead?.tiktok,
    lead?.xTwitter,
    lead?.hasWebsite,
  ]);

  if (!id) {
    router.replace(Routes.panel);
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
          <p className="mt-4 text-[#616161] dark:text-[#b0b0b0]">
            Cargando lead...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <p className="text-red-600 dark:text-red-400">
          No se pudo cargar el lead o no existe.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 inline-block text-orange-500 dark:text-orange-400 hover:underline"
        >
          Volver a Ventas
        </button>
      </div>
    );
  }

  const topReviews = [
    lead.topReview1,
    lead.topReview2,
    lead.topReview3,
    lead.topReview4,
    lead.topReview5,
  ].filter(Boolean) as string[];

  const leadWhatsappDigits = lead.phone
    ? whatsappDigitsFromPhone(lead.phone)
    : null;

  const saving = savingLead || savingStatus || creatingStatus;

  const handleSaveLead = async () => {
    if (!id) return;
    try {
      const leadData: UpdateTechBusinessLeadVariables["data"] = {};
      if (facebook.length > 0) leadData.facebook = facebook;
      if (instagram.length > 0) leadData.instagram = instagram;
      if (tiktok.length > 0) leadData.tiktok = tiktok;
      if (xTwitter.length > 0) leadData.xTwitter = xTwitter;
      if (hasWebsite !== undefined && hasWebsite !== null)
        leadData.hasWebsite = hasWebsite;
      if (websiteUrl.length > 0) leadData.websiteUrl = websiteUrl;

      if (Object.keys(leadData).length > 0) {
        await updateLead({
          variables: { where: { id }, data: leadData },
        });
      }

      const statusData: UpdateTechStatusBusinessLeadVariables["data"] = {};
      if (pipelineStatus !== undefined)
        statusData.pipelineStatus = pipelineStatus || null;
      if (notes.length > 0) statusData.notes = notes;
      if (productOffered.length > 0) statusData.productOffered = productOffered;
      statusData.firstContactDate = firstContactDate.trim() ? firstContactDate.trim().slice(0, 10) : null;
      if (user?.id) statusData.salesPerson = { connect: { id: user.id } };
      if (companyId) statusData.saasCompany = { connect: { id: companyId } };

      if (status) {
        if (Object.keys(statusData).length > 0) {
          await updateStatus({
            variables: { where: { id: status.id }, data: statusData },
          });
        }
      } else {
        await createStatus({
          variables: {
            data: {
              businessLead: { connect: { id } },
              ...statusData,
            },
          },
        });
      }

      sileo.success({ title: "Cambios guardados" });
    } catch {
      sileo.error({
        title: "No se pudieron guardar los cambios",
        description: "Intenta de nuevo más tarde.",
      });
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-15 pt-20 pb-8">
      <div className="flex flex-wrap items-center gap-3 mb-4 justify-between">
        <div className="flex flex-row gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Volver a Ventas
          </button>
          <h1 className="text-lg font-bold text-[#212121] dark:text-[#ffffff] truncate">
            {lead.businessName || "Lead sin nombre"}
          </h1>
        </div>
        <SaveLeadButton saving={saving} handleSaveLead={handleSaveLead} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SectionCard
          title="Información de la empresa"
          headerPipelineStatus={pipelineStatus}
        >
          <dl className="space-y-0">
            <Field label="Empresa" value={lead.businessName} />
            <Field label="Categoría">{getCategoryLabel(lead.category)}</Field>
            <Field label="Teléfono">
              {lead.phone ? (
                <div className="flex flex-col gap-1.5">
                  <a
                    href={`tel:${lead.phone.replace(/\s/g, "")}`}
                    className="text-orange-500 dark:text-orange-400 hover:underline w-fit"
                  >
                    {lead.phone}
                  </a>
                  {leadWhatsappDigits ? (
                    <a
                      href={`https://wa.me/${leadWhatsappDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[#25D366] hover:text-[#1ebe57] hover:underline"
                    >
                      Abrir en WhatsApp
                    </a>
                  ) : null}
                </div>
              ) : (
                "—"
              )}
            </Field>
            <Field label="Dirección" value={lead.address} />
            <Field label="Ciudad" value={lead.city} />
            <Field label="Estado" value={lead.state} />
            <Field label="Oportunidad" value={status?.opportunityLevel} />
            <Field label="Fuente" value={lead.source} />
            <Field label="Sitio web" value={hasWebsite ? "Si" : "No"} />
            <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] items-center">
              <label
                htmlFor="lead-product-offered"
                className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                Website{" "}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-500 dark:text-orange-400 hover:underline"
                  >
                    Ir
                  </a>
                )}
              </label>
              <input
                id="lead-product-offered"
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://www.example.com"
                className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

          </dl>
        </SectionCard>

        <SectionCard title="Info de Google" headerPipelineStatus={pipelineStatus}>
          <dl className="space-y-0">
            {lead.googleMapsUrl && (
              <Field label="Mapa">
                <a
                  href={lead.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 dark:text-orange-400 hover:underline truncate block"
                >
                  Ver en mapa
                </a>
              </Field>
            )}
            <Field label="Rating" value={lead.rating} />
            <Field label="Nº reseñas" value={lead.reviewCount} />
            {topReviews.length > 0 && (
              <div className="pt-1.5 border-b border-[#e8e8e8] dark:border-[#333] last:border-0">
                <p className="text-[#616161] dark:text-[#b0b0b0] font-medium text-sm mb-1">
                  Reseñas destacadas
                </p>
                <ul className="space-y-1 text-[#212121] dark:text-[#ffffff] text-sm">
                  {topReviews.map((r, i) => (
                    <li key={i} className="line-clamp-2">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </dl>
        </SectionCard>

        <SectionCard title="Redes sociales" headerPipelineStatus={pipelineStatus}>
          <div className="space-y-0">
            <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0 items-center">
              <label
                htmlFor="lead-facebook"
                className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                Facebook
              </label>
              <input
                id="lead-facebook"
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0 items-center">
              <label
                htmlFor="lead-instagram"
                className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                Instagram
              </label>
              <input
                id="lead-instagram"
                type="url"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0 items-center">
              <label
                htmlFor="lead-tiktok"
                className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                TikTok
              </label>
              <input
                id="lead-tiktok"
                type="url"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="https://tiktok.com/..."
                className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0 items-center">
              <label
                htmlFor="lead-xtwitter"
                className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                X / Twitter
              </label>
              <input
                id="lead-xtwitter"
                type="url"
                value={xTwitter}
                onChange={(e) => setXTwitter(e.target.value)}
                placeholder="https://x.com/..."
                className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Fechas" headerPipelineStatus={pipelineStatus}>
          <dl className="space-y-0">
            <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 text-sm border-b border-[#e8e8e8] dark:border-[#333] last:border-0 items-center">
              <label
                htmlFor="lead-first-contact"
                className="font-medium text-[#616161] dark:text-[#b0b0b0] shrink-0"
              >
                Primer contacto
              </label>
              <input
                id="lead-first-contact"
                type="date"
                value={firstContactDate}
                onChange={(e) => setFirstContactDate(e.target.value)}
                className="w-full min-w-0 rounded border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-2 py-1.5 text-[#212121] dark:text-[#ffffff] text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <Field
              label="Próx. seguimiento"
              value={formatDateShort(status?.nextFollowUpDate)}
            />
            <Field
              label="Última actualización"
              value={lead.updatedAt ? formatDateShort(lead.updatedAt) : "—"}
            />
          </dl>
        </SectionCard>
      </div>

      <SaveLeadButton saving={saving} handleSaveLead={handleSaveLead} />

      <div className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] overflow-hidden">
        <h2
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b ${
            pipelineStatus && PIPELINE_STATUS_SECTION_HEADER[pipelineStatus]
              ? PIPELINE_STATUS_SECTION_HEADER[pipelineStatus]
              : DEFAULT_PIPELINE_SECTION_HEADER
          }`}
        >
          Acciones, proyectos y edición
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e0e0e0] dark:divide-[#3a3a3a]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-6 p-5 lg:gap-8 lg:items-start">
            <LeadPipelineNotesFields
              pipelineStatus={pipelineStatus}
              onPipelineStatusChange={setPipelineStatus}
              notes={notes}
              onNotesChange={setNotes}
              className="min-w-0 p-0 lg:pr-2"
            />
            <aside
              className="flex flex-col gap-2 justify-center lg:justify-end lg:pt-1"
              aria-label={`${projectsCount} ${projectsCount === 1 ? "proyecto" : "proyectos"} vinculados a este lead`}
            >
              <div className="w-full max-w-[200px] lg:w-40 lg:max-w-none rounded-2xl border border-yellow-200/80 dark:border-yellow-500/25 bg-gradient-to-br from-yellow-500/12 to-transparent dark:from-yellow-500/15 dark:to-transparent px-4 py-4 text-center shadow-sm ring-1 ring-inset ring-yellow-500/10 dark:ring-yellow-400/10">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                  <HugeiconsIcon icon={FolderIcon} size={22} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0]">
                  Proyectos
                </p>
                <p className="mt-1 tabular-nums text-3xl font-bold tracking-tight text-[#212121] dark:text-white">
                  {projectsCount}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsProjectsModalOpen(true)}
                className="inline-flex w-full max-w-[200px] lg:max-w-none items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white/80 dark:bg-[#2a2a2a]/80 px-3 py-2.5 text-sm font-semibold text-[#212121] dark:text-white shadow-sm hover:border-orange-400/60 dark:hover:border-orange-500/40 hover:bg-orange-500/[0.08] dark:hover:bg-orange-500/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] transition-colors"
              >
                Ver proyectos
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="opacity-70" />
              </button>
            </aside>
          </div>
          <LeadCrmActions leadId={id} userId={user?.id ?? ""} />
        </div>
      </div>

      <LeadProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projectsList}
        leadBusinessName={lead?.businessName}
        leadId={id}
        userId={user?.id ?? ""}
        onProjectCreated={() => {
          void refetchLead();
        }}
      />

      <SaveLeadButton saving={saving} handleSaveLead={handleSaveLead} />

      {hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.CALENDAR_CRM) && (
        <LeadDetailCalendar
          leadId={id}
          userId={user?.id ?? ""}
          businessName={lead.businessName ?? ""}
          sellerName={[user?.name, user?.lastName].filter(Boolean).join(" ") || "—"}
        />
      )}
    </div>
  );
}
