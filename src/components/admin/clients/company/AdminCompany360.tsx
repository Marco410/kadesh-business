"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import AdminSubscriptionEditor from "../../AdminSubscriptionEditor";
import {
  ADMIN_TABS,
  CLIENT_SECTIONS,
  CLIENT_SECTION_ITEMS,
  CONTENT_VISTAS,
  PERSON_TABS,
  parseClientSection,
  type ClientSection,
  type PersonTab,
} from "../../constants";
import { TRACK_EVENT, trackActivity } from "kadesh/utils/activity";
import { getCurrentCreditPeriodParts } from "../../credits";
import { useAdminNavigation } from "../../hooks/useAdminNavigation";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingRows,
  AdminTabBar,
} from "../../ui";
import {
  ADMIN_COMPANY_INSIGHTS_QUERY,
  ADMIN_COMPANY_PROFILE_QUERY,
  type AdminCompanyInsightsResponse,
  type AdminCompanyProfileResponse,
} from "../clients-queries";
import PersonDrawer from "../person/PersonDrawer";
import { subscriptionRowFromProfile, useAdjustSubscription } from "../useAdjustSubscription";
import CompanyProfileCard from "./CompanyProfileCard";
import ExtendTrialDialog from "./ops/ExtendTrialDialog";
import CompanyNotes from "./sections/CompanyNotes";
import PersonFocusBanner from "./PersonFocusBanner";
import CompanyActivity from "./sections/CompanyActivity";
import CompanyBilling from "./sections/CompanyBilling";
import CompanyCrm from "./sections/CompanyCrm";
import CompanyIntegrations from "./sections/CompanyIntegrations";
import CompanySummary from "./sections/CompanySummary";
import CompanyTeam from "./sections/CompanyTeam";
import CompanyUsage from "./sections/CompanyUsage";

const INSIGHTS_DAYS = 30;

/**
 * 360 de una empresa: ficha fija + persona en foco + secciones. Todo el estado de
 * navegación vive en la URL (`empresa`, `detalle`, `sub`, `persona`).
 */
export default function AdminCompany360({ companyId }: { companyId: string }) {
  const { searchParams, setParams, goTo } = useAdminNavigation();
  const section = parseClientSection(searchParams.get("detalle"));
  const personaId = searchParams.get("persona");
  const [drawer, setDrawer] = useState<{ userId: string; tab: PersonTab } | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);
  const period = getCurrentCreditPeriodParts();

  // Queda registro de qué clientes abre Kadesh (el back junta vistas repetidas de 10 min).
  useEffect(() => {
    trackActivity(TRACK_EVENT.ADMIN_VIEWED_COMPANY, {
      companyId,
      entityType: "SaasCompany",
      entityId: companyId,
    });
  }, [companyId]);

  useEffect(() => {
    if (!personaId) return;
    trackActivity(TRACK_EVENT.ADMIN_VIEWED_PERSON, {
      companyId,
      entityType: "User",
      entityId: personaId,
    });
  }, [companyId, personaId]);

  const profileQuery = useQuery<AdminCompanyProfileResponse>(ADMIN_COMPANY_PROFILE_QUERY, {
    variables: { id: companyId, year: period.year, month: period.month },
    fetchPolicy: "cache-and-network",
  });
  const insightsQuery = useQuery<AdminCompanyInsightsResponse>(ADMIN_COMPANY_INSIGHTS_QUERY, {
    variables: { id: companyId, days: INSIGHTS_DAYS },
    fetchPolicy: "cache-and-network",
  });

  const company = profileQuery.data?.saasCompany ?? null;
  const insights = insightsQuery.data?.adminCompanyInsights ?? null;
  const subscriptionRow = subscriptionRowFromProfile(company);
  const adjust = useAdjustSubscription(company?.id);

  const back = () =>
    setParams(
      {
        empresa: null,
        persona: null,
        detalle: null,
        sub: null,
        tipo: null,
        error: null,
      },
      "push",
    );
  const openSection = (next: string) =>
    setParams({
      detalle: next === CLIENT_SECTIONS.SUMMARY ? null : next,
      sub: null,
    });
  const focusPerson = (userId: string | null) => setParams({ persona: userId });
  const sendEmail = () => {
    const emails = (company?.users ?? [])
      .map((u) => u.email)
      .filter((e): e is string => Boolean(e));
    goTo(ADMIN_TABS.CONTENT, {
      vista: CONTENT_VISTAS.EMAILS,
      para: emails.join(","),
    });
  };

  const backButton = (
    <button
      type="button"
      onClick={back}
      className="inline-flex min-h-10 items-center gap-1.5 self-start text-sm text-[#616161] hover:text-orange-500 dark:text-[#b0b0b0] cursor-pointer"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
      Clientes
    </button>
  );

  if (profileQuery.error) {
    return (
      <div className="flex flex-col gap-4">
        {backButton}
        <AdminErrorState message={profileQuery.error.message} />
      </div>
    );
  }
  if (!company) {
    return (
      <div className="flex flex-col gap-4">
        {backButton}
        {profileQuery.loading ? (
          <AdminLoadingRows rows={5} />
        ) : (
          <AdminEmptyState
            title="No se encontró la empresa"
            description="Puede que la hayan borrado o el enlace esté mal."
          />
        )}
      </div>
    );
  }

  // La prueba solo existe en el plan gratuito (sin cobro en Stripe).
  const latestSub = company.subscriptions[0] ?? null;
  const isFreePlan =
    Boolean(latestSub) && (latestSub?.planCost ?? 0) <= 0 && !latestSub?.stripeSubscriptionId;

  const focusPersonRecord = personaId
    ? company.users.find((u) => u.id === personaId) ?? null
    : null;
  const focusStats = focusPersonRecord
    ? insights?.team.find((m) => m.userId === focusPersonRecord.id) ?? null
    : null;

  return (
    <div className="flex flex-col gap-4">
      {backButton}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <CompanyProfileCard
          company={company}
          insights={insights}
          focusPersonId={personaId}
          onAdjustPlan={subscriptionRow ? () => setAdjustOpen(true) : null}
          onExtendTrial={isFreePlan ? () => setExtendOpen(true) : null}
          onSendEmail={sendEmail}
          onFocusPerson={(userId) => focusPerson(userId === personaId ? null : userId)}
          onRefresh={() => void profileQuery.refetch()}
        />

        <div className="flex min-w-0 flex-col gap-4">
          {focusPersonRecord ? (
            <PersonFocusBanner
              person={focusPersonRecord}
              stats={focusStats}
              days={insights?.days ?? INSIGHTS_DAYS}
              onEdit={() => setDrawer({ userId: focusPersonRecord.id, tab: PERSON_TABS.PROFILE })}
              onShowActivity={() => openSection(CLIENT_SECTIONS.ACTIVITY)}
              onClear={() => focusPerson(null)}
            />
          ) : null}

          <AdminTabBar<ClientSection>
            ariaLabel={`Secciones de ${company.name}`}
            size="compact"
            items={CLIENT_SECTION_ITEMS}
            value={section}
            onChange={openSection}
          />

          {section === CLIENT_SECTIONS.SUMMARY ? (
            <CompanySummary
              company={company}
              insights={insights}
              insightsError={Boolean(insightsQuery.error)}
              onOpenSection={openSection}
            />
          ) : null}
          {section === CLIENT_SECTIONS.ACTIVITY ? (
            <CompanyActivity companyId={company.id} members={company.users} />
          ) : null}
          {section === CLIENT_SECTIONS.CRM ? (
            <CompanyCrm companyId={company.id} insights={insights} />
          ) : null}
          {section === CLIENT_SECTIONS.USAGE ? (
            <CompanyUsage companyId={company.id} insights={insights} />
          ) : null}
          {section === CLIENT_SECTIONS.BILLING ? (
            <CompanyBilling
              companyId={company.id}
              onAdjustPlan={subscriptionRow ? () => setAdjustOpen(true) : null}
            />
          ) : null}
          {section === CLIENT_SECTIONS.TEAM ? (
            <CompanyTeam
              companyId={company.id}
              members={company.users}
              insights={insights}
              focusPersonId={personaId}
              onFocusPerson={(userId) => focusPerson(userId)}
              onEditPerson={(userId) => setDrawer({ userId, tab: PERSON_TABS.PROFILE })}
            />
          ) : null}
          {section === CLIENT_SECTIONS.INTEGRATIONS ? (
            <CompanyIntegrations companyId={company.id} insights={insights} />
          ) : null}
          {section === CLIENT_SECTIONS.NOTES ? <CompanyNotes companyId={company.id} /> : null}
        </div>
      </div>

      <PersonDrawer
        userId={drawer?.userId ?? null}
        initialTab={drawer?.tab}
        onClose={() => setDrawer(null)}
      />

      <ExtendTrialDialog
        open={extendOpen}
        companyId={company.id}
        companyName={company.name}
        trialEnd={latestSub?.currentPeriodEnd ?? null}
        onClose={() => setExtendOpen(false)}
        onDone={() => {
          setExtendOpen(false);
          void profileQuery.refetch();
        }}
      />

      <AdminSubscriptionEditor
        isOpen={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        subscription={subscriptionRow}
        saving={adjust.saving}
        onSave={async (args) => {
          const ok = await adjust.save(args);
          if (ok) setAdjustOpen(false);
        }}
      />
    </div>
  );
}
