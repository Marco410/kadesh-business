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
import { Add01Icon, ArrowLeft01Icon, FolderIcon } from "@hugeicons/core-free-icons";
import LeadCrmActions from "./LeadCrmActions";
import LeadDetailCalendar from "./LeadDetailCalendar";
import LeadPipelineNotesFields from "./LeadPipelineNotesFields";
import LeadProjectsModal from "./LeadProjectsModal";
import { Field, SectionCard, asExternalHref, leadInputClassName } from "./LeadDetailCard";
import { LeadGoogleInfoCard, LeadInegiInfoCard } from "./LeadSourceInfoCards";
import { GoogleMapsMark, InegiMark } from "../obtener-clientes/SourceMarks";
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

function SaveLeadButton({
  saving,
  handleSaveLead,
}: {
  saving: boolean;
  handleSaveLead: () => void;
}) {
  return (
    <button
      type="button"
      onClick={handleSaveLead}
      disabled={saving}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 hover:-translate-y-px active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
    >
      {saving ? "Guardando..." : "Guardar cambios"}
    </button>
  );
}

function SocialRow({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const href = asExternalHref(value);
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-[#e8e8e8] dark:border-[#333] last:border-0">
      <label
        htmlFor={id}
        className="w-24 shrink-0 text-sm font-medium text-[#616161] dark:text-[#b0b0b0]"
      >
        {label}
      </label>
      <input
        id={id}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={leadInputClassName}
      />
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-medium text-orange-500 dark:text-orange-400 hover:underline"
        >
          Abrir
        </a>
      ) : null}
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
    lead?.websiteUrl,
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
            Cargando cliente...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        <p className="text-red-600 dark:text-red-400">
          No se pudo cargar el cliente o no existe.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 inline-block text-orange-500 dark:text-orange-400 hover:underline"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  const leadWhatsappDigits = lead.phone
    ? whatsappDigitsFromPhone(lead.phone)
    : null;
  const isInegi = lead.source === "INEGI";
  const isGoogleMaps = lead.source === "Google Maps";
  const email = lead.email || lead.sourceEstablishment?.email || null;
  const websiteHref = asExternalHref(websiteUrl);

  const saving = savingLead || savingStatus || creatingStatus;
  const notesDirty = notes !== (status?.notes ?? "");

  const persistStatus = async (overrides: {
    pipelineStatus?: string;
    notes?: string;
  } = {}) => {
    const nextPipeline = overrides.pipelineStatus ?? pipelineStatus;
    const nextNotes = overrides.notes ?? notes;
    const statusData: UpdateTechStatusBusinessLeadVariables["data"] = {};
    if (nextPipeline) statusData.pipelineStatus = nextPipeline;
    // notes no admite null en Keystone: omitir o mandar string (incluido "").
    if (overrides.notes !== undefined || nextNotes.trim()) {
      statusData.notes = nextNotes.trim();
    }
    const nextFirstContact = firstContactDate.trim().slice(0, 10);
    if (nextFirstContact) statusData.firstContactDate = nextFirstContact;
    if (productOffered.length > 0) statusData.productOffered = productOffered;
    if (user?.id) statusData.salesPerson = { connect: { id: user.id } };
    if (companyId) statusData.saasCompany = { connect: { id: companyId } };

    if (status) {
      await updateStatus({
        variables: { where: { id: status.id }, data: statusData },
      });
      return;
    }

    await createStatus({
      variables: {
        data: {
          businessLead: { connect: { id } },
          ...statusData,
        },
      },
    });
  };

  const handlePipelineStatusChange = async (value: string) => {
    if (value === pipelineStatus) return;
    const previous = pipelineStatus;
    setPipelineStatus(value);
    try {
      await persistStatus({ pipelineStatus: value });
      sileo.success({ title: "Estatus actualizado" });
    } catch {
      setPipelineStatus(previous);
      sileo.error({
        title: "No se pudo actualizar el estatus",
        description: "Intenta de nuevo más tarde.",
      });
    }
  };

  const handleSaveNotes = async () => {
    try {
      await persistStatus({ notes });
      sileo.success({ title: "Notas guardadas" });
    } catch {
      sileo.error({
        title: "No se pudieron guardar las notas",
        description: "Intenta de nuevo más tarde.",
      });
    }
  };

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

      await persistStatus();
      sileo.success({ title: "Cambios guardados" });
    } catch {
      sileo.error({
        title: "No se pudieron guardar los cambios",
        description: "Intenta de nuevo más tarde.",
      });
    }
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-15 pt-20 pb-10 space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#b0b0b0] hover:text-orange-500 dark:hover:text-orange-400"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            Volver a Clientes
          </button>
          <h1 className="text-lg font-bold text-[#212121] dark:text-[#ffffff] truncate">
            {lead.businessName || "Cliente sin nombre"}
          </h1>
          {lead.source ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#fafafa] dark:bg-[#252525] px-2.5 py-1 text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
              {isInegi ? <InegiMark size={14} /> : null}
              {isGoogleMaps ? <GoogleMapsMark size={14} /> : null}
              {lead.source}
            </span>
          ) : null}
        </div>
        <SaveLeadButton saving={saving} handleSaveLead={handleSaveLead} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <SectionCard
          title="Información de la empresa"
          headerPipelineStatus={pipelineStatus}
          className={`clientes-row-in ${isInegi || isGoogleMaps ? "lg:col-span-5" : "lg:col-span-6"}`}
        >
          <dl>
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
            {email ? (
              <Field label="Email">
                <a
                  href={`mailto:${email}`}
                  className="text-orange-500 dark:text-orange-400 hover:underline break-all"
                >
                  {email}
                </a>
              </Field>
            ) : (
              <Field label="Email" value={null} />
            )}
            <Field label="Dirección" value={lead.address} />
            <Field label="Ciudad" value={lead.city} />
            <Field label="Estado" value={lead.state} />
            {lead.country ? <Field label="País" value={lead.country} /> : null}
            <Field label="Oportunidad" value={status?.opportunityLevel} />
            <Field label="Sitio web">
              <span className="inline-flex items-center gap-2">
                <span>{hasWebsite ? "Sí" : "No"}</span>
                {websiteHref ? (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-orange-500 dark:text-orange-400 hover:underline"
                  >
                    Abrir
                  </a>
                ) : null}
              </span>
            </Field>
            <div className="grid grid-cols-[7.5rem_1fr] gap-x-3 py-1.5 text-sm items-center">
              <label
                htmlFor="lead-website-url"
                className="font-medium text-[#616161] dark:text-[#b0b0b0]"
              >
                URL
              </label>
              <input
                id="lead-website-url"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className={leadInputClassName}
              />
            </div>
          </dl>
        </SectionCard>

        {isInegi ? (
          <LeadInegiInfoCard
            lead={lead}
            headerPipelineStatus={pipelineStatus}
            className="clientes-row-in lg:col-span-4"
          />
        ) : null}
        {isGoogleMaps ? (
          <LeadGoogleInfoCard
            lead={lead}
            headerPipelineStatus={pipelineStatus}
            className="clientes-row-in lg:col-span-3"
          />
        ) : null}

        <SectionCard
          title="Presencia y fechas"
          headerPipelineStatus={pipelineStatus}
          className={`clientes-row-in ${
            isInegi ? "lg:col-span-3" : isGoogleMaps ? "lg:col-span-4" : "lg:col-span-6"
          }`}
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#777]">
                Redes
              </p>
              <SocialRow
                id="lead-facebook"
                label="Facebook"
                value={facebook}
                onChange={setFacebook}
                placeholder="facebook.com/..."
              />
              <SocialRow
                id="lead-instagram"
                label="Instagram"
                value={instagram}
                onChange={setInstagram}
                placeholder="instagram.com/..."
              />
              <SocialRow
                id="lead-tiktok"
                label="TikTok"
                value={tiktok}
                onChange={setTiktok}
                placeholder="tiktok.com/..."
              />
              <SocialRow
                id="lead-xtwitter"
                label="X"
                value={xTwitter}
                onChange={setXTwitter}
                placeholder="x.com/..."
              />
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#777]">
                Fechas
              </p>
              <div className="relative pl-4 before:absolute before:left-[3px] before:top-2 before:bottom-2 before:w-px before:bg-[#e8e8e8] dark:before:bg-[#333]">
                <div className="relative mb-3 grid grid-cols-[1fr_auto] items-center gap-2">
                  <span className="absolute -left-4 top-2 size-1.5 rounded-full bg-orange-500" />
                  <label
                    htmlFor="lead-first-contact"
                    className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]"
                  >
                    Primer contacto
                  </label>
                  <input
                    id="lead-first-contact"
                    type="date"
                    value={firstContactDate}
                    onChange={(e) => setFirstContactDate(e.target.value)}
                    className={`${leadInputClassName} w-[10.5rem]`}
                  />
                </div>
                <div className="relative mb-3">
                  <span className="absolute -left-4 top-1.5 size-1.5 rounded-full bg-emerald-500" />
                  <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
                    Próximo seguimiento
                  </p>
                  <p className="text-sm text-[#212121] dark:text-white">
                    {formatDateShort(status?.nextFollowUpDate)}
                  </p>
                </div>
                <div className="relative mb-3">
                  <span className="absolute -left-4 top-1.5 size-1.5 rounded-full bg-[#bdbdbd] dark:bg-[#666]" />
                  <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
                    Alta
                  </p>
                  <p className="text-sm text-[#212121] dark:text-white">
                    {formatDateShort(lead.createdAt, false)}
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-4 top-1.5 size-1.5 rounded-full bg-[#bdbdbd] dark:bg-[#666]" />
                  <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
                    Actualizado
                  </p>
                  <p className="text-sm text-[#212121] dark:text-white">
                    {formatDateShort(lead.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e]">
        <h2
          className={`px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b ${
            pipelineStatus && PIPELINE_STATUS_SECTION_HEADER[pipelineStatus]
              ? PIPELINE_STATUS_SECTION_HEADER[pipelineStatus]
              : DEFAULT_PIPELINE_SECTION_HEADER
          }`}
        >
          Pipeline y trabajo
        </h2>
        <div className="p-3 sm:p-4 space-y-3">
          <LeadPipelineNotesFields
            pipelineStatus={pipelineStatus}
            onPipelineStatusChange={(value) => {
              void handlePipelineStatusChange(value);
            }}
            notes={notes}
            onNotesChange={setNotes}
            className="min-w-0 p-0"
            saving={savingStatus || creatingStatus}
            notesDirty={notesDirty}
            onSaveNotes={() => {
              void handleSaveNotes();
            }}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setIsProjectsModalOpen(true)}
              aria-label="Añadir o ver proyectos de este cliente"
              className="flex min-w-0 items-center gap-2.5 rounded-xl border border-yellow-200/80 dark:border-yellow-500/25 bg-gradient-to-br from-yellow-500/12 to-transparent dark:from-yellow-500/15 dark:to-transparent px-3 py-2.5 text-left text-yellow-700 dark:text-yellow-400 shadow-sm ring-1 ring-inset ring-yellow-500/10 dark:ring-yellow-400/10 hover:-translate-y-px hover:border-orange-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition-[transform,border-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-500/20">
                <HugeiconsIcon icon={FolderIcon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-medium text-[#616161] dark:text-[#b0b0b0]">
                  Proyectos
                </span>
                <span className="tabular-nums text-lg font-bold leading-none text-[#212121] dark:text-white">
                  {projectsCount}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white/70 px-2 py-1 text-xs font-semibold dark:bg-black/25">
                <HugeiconsIcon icon={Add01Icon} size={14} />
                Añadir
              </span>
            </button>
            <LeadCrmActions
              leadId={id}
              userId={user?.id ?? ""}
              leadName={lead.businessName ?? undefined}
            />
          </div>
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

      {hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.CALENDAR_CRM) ? (
        <LeadDetailCalendar
          leadId={id}
          userId={user?.id ?? ""}
          businessName={lead.businessName ?? ""}
          sellerName={[user?.name, user?.lastName].filter(Boolean).join(" ") || "—"}
        />
      ) : null}
    </div>
  );
}
