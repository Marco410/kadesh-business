"use client";

import { createElement, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useStableQuery } from "kadesh/providers/useStableQuery";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { AppShell, type AppCrumb, type AppNavGroup } from "kadesh/components/app-shell";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import { TourHelpButton } from "kadesh/components/onboarding";
import { useCompanyAiLive } from "kadesh/components/profile/ai/useCompanyAiLive";
import { betaFeatureKeysForSubscription } from "kadesh/components/profile/sales/helpers/plan-features";
import {
  SAAS_PLANS_QUERY,
  SUBSCRIPTION_STATUS_QUERY,
  USER_COMPANY_CATEGORIES_QUERY,
  type SaasPlansResponse,
  type SubscriptionStatusResponse,
  type SubscriptionStatusVariables,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { canAccessNavTab } from "kadesh/components/profile/usuarios/can";
import { Role } from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { META_REGISTER_SUCCESS_QUERY_KEY } from "kadesh/utils/facebook-pixel";
import { useUser } from "kadesh/utils/UserContext";
import { canManageCompanyAi, isAdminCompanyUser, isPlatformAdminUser } from "kadesh/utils/user-roles";
import { useIsClient } from "kadesh/utils/useIsClient";
import {
  PANEL_NAV_COLLAPSED_KEY,
  PANEL_NAV_LABELS,
  buildPanelNavGroups,
  panelNavGroupTitle,
} from "./DashboardSidebar";

/** Punto de color según cuántos créditos quedan: rojo < 5, ámbar < 20, verde el resto. */
function creditsTone(remaining: number | null) {
  if (remaining == null) return "bg-dash-faint";
  if (remaining < 5) return "bg-red-500 animate-pulse";
  if (remaining < 20) return "bg-amber-500";
  return "bg-green-500";
}

function CreditsPill({ remaining, loading }: { remaining: number | null; loading: boolean }) {
  return (
    <Link
      href={Routes.panelCredits}
      data-tour="panel-credits"
      title="Créditos disponibles"
      className="inline-flex h-10 items-center gap-2 rounded-full border border-dash-line bg-dash-surface px-3.5 text-sm font-semibold text-dash-ink transition-colors hover:border-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
    >
      <span className={cn("size-2 shrink-0 rounded-full", creditsTone(remaining))} aria-hidden />
      <span className="hidden font-medium text-dash-muted sm:inline">Créditos</span>
      <span className="tabular-nums">{loading ? "…" : (remaining ?? "—")}</span>
    </Link>
  );
}

/** Punto "en vivo" junto a Kadesh AI cuando la IA de la empresa está activa. */
function AiLiveDot() {
  return (
    <span className="relative flex size-2" title="Kadesh AI activo">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-violet-400 opacity-60 motion-reduce:hidden" />
      <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
    </span>
  );
}

/**
 * Shell del panel de control de clientes sobre `AppShell`: menú con Extracción B2B y las
 * secciones del CRM según permisos y plan (con Beta y Kadesh AI en vivo), migas, tutorial,
 * créditos y "Nuevo cliente". `selectedTab = null` es Extracción B2B (`/panel` sin `tab`).
 */
export default function PanelShell({
  selectedTab,
  title,
  children,
}: {
  selectedTab: string | null;
  /** Página dentro de una sección (detalle de cliente, comprar créditos…): última miga. */
  title?: string;
  children: ReactNode;
}) {
  const { user } = useUser();
  const mounted = useIsClient();
  const { data: userData } = useStableQuery<UserCompanyCategoriesResponse, UserCompanyCategoriesVariables>(
    USER_COMPANY_CATEGORIES_QUERY,
    { variables: { where: { id: user?.id ?? "" } }, skip: !user?.id },
  );
  const company = userData?.user?.company ?? null;
  const companyId = company?.id ?? null;
  const { remainingQuota, loading: creditsLoading } = useRemainingCredits(companyId);
  const { isAiLive } = useCompanyAiLive(companyId);
  const { data: subscriptionData } = useStableQuery<SubscriptionStatusResponse, SubscriptionStatusVariables>(
    SUBSCRIPTION_STATUS_QUERY,
    { variables: { companyId }, skip: !companyId },
  );
  const { data: plansData } = useStableQuery<SaasPlansResponse>(SAAS_PLANS_QUERY, {
    skip: !companyId,
  });
  const subscription = subscriptionData?.subscriptionStatus?.subscription ?? null;
  const betaFeatureKeys = useMemo(
    () => betaFeatureKeysForSubscription(plansData?.saasPlans ?? [], subscription),
    [plansData?.saasPlans, subscription],
  );

  const hasVendedorRole = user?.roles?.some((r) => r.name === Role.VENDEDOR) ?? false;
  const isAdminCompany = user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;
  const canManageAi = canManageCompanyAi(user);
  const canAddClient = canAccessNavTab(user, "clientes", { hasVendedorRole, isAdminCompany, canManageAi });

  // El registro exitoso (píxel de Meta) viaja en la URL: los enlaces del menú lo conservan.
  const registerSuccess =
    mounted && typeof window !== "undefined"
      ? new URL(window.location.href).searchParams.get(META_REGISTER_SUCCESS_QUERY_KEY)
      : null;

  const groups: AppNavGroup[] = useMemo(() => {
    const built = buildPanelNavGroups({
      user,
      selectedTab,
      hasVendedorRole,
      isAdminCompany,
      canManageAi,
      canAccessExtraccion: isAdminCompanyUser(user),
      betaFeatureKeys,
    });
    return built.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        let href = item.href;
        if (registerSuccess) {
          href += `${href.includes("?") ? "&" : "?"}${META_REGISTER_SUCCESS_QUERY_KEY}=${encodeURIComponent(registerSuccess)}`;
        }
        const extra =
          item.id === "ai" && isAiLive
            ? createElement("span", { className: "flex items-center gap-1.5" }, item.extra, createElement(AiLiveDot))
            : item.extra;
        return { ...item, href, extra };
      }),
    }));
  }, [user, selectedTab, hasVendedorRole, isAdminCompany, canManageAi, betaFeatureKeys, registerSuccess, isAiLive]);

  const sectionLabel = selectedTab ? PANEL_NAV_LABELS[selectedTab] : "Extracción B2B";
  const groupTitle = panelNavGroupTitle(selectedTab);
  const sectionHref = selectedTab ? `${Routes.panel}?tab=${selectedTab}` : Routes.panel;
  const crumbs: AppCrumb[] = [
    { label: "Panel", href: `${Routes.panel}?tab=inicio` },
    ...(groupTitle ? [{ label: groupTitle }] : []),
    ...(sectionLabel ? [{ label: sectionLabel, href: title ? sectionHref : undefined }] : []),
    ...(title ? [{ label: title }] : []),
  ];

  return (
    <AppShell
      brandTitle="Kadesh"
      brandSubtitle={
        company?.name && company.name.trim().toLowerCase() !== "kadesh" ? company.name : "Panel de control"
      }
      groups={groups}
      crumbs={crumbs}
      collapsibleStorageKey={PANEL_NAV_COLLAPSED_KEY}
      navDataTour="main-tab-control"
      showNotifications={Boolean(user?.id && isPlatformAdminUser(user))}
      actions={
        <>
          <TourHelpButton />
          <CreditsPill remaining={remainingQuota} loading={creditsLoading} />
          {canAddClient ? (
            <Link
              href={Routes.panelAddLead}
              className="dash-grad-accent inline-flex size-10 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white shadow-dash-accent transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-dash-accent-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 md:w-auto md:px-4"
            >
              <HugeiconsIcon icon={Add01Icon} size={18} />
              <span className="sr-only md:not-sr-only">Nuevo cliente</span>
            </Link>
          ) : null}
        </>
      }
    >
      {children}
    </AppShell>
  );
}
