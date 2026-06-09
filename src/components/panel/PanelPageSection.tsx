"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import { useQuery } from "@apollo/client";
import { Footer, Navigation } from "kadesh/components/layout";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import {
  USER_COMPANY_CATEGORIES_QUERY,
  type UserCompanyCategoriesResponse,
  type UserCompanyCategoriesVariables,
} from "kadesh/components/profile/sales/queries";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { useUser } from "kadesh/utils/UserContext";
import { isAdminCompanyUser } from "kadesh/utils/user-roles";
import PanelControlSection from "./PanelControlSection";
import ObtenerClientesPage from "kadesh/app/panel/clientes/obtener-clientes/page";

type PanelMainTab = "control" | "extraccion";

const mainTabs: {
  key: PanelMainTab;
  label: string;
  icon: typeof DashboardSquare01Icon;
}[] = [
  { key: "extraccion", label: "Extracción B2B", icon: ZapIcon },
  { key: "control", label: "Panel de control", icon: DashboardSquare01Icon },
];

const IOS_SEGMENT_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

function getMainTabFromUrl(
  tabParam: string | null,
  canAccessExtraccion: boolean
): PanelMainTab {
  if (!canAccessExtraccion) return "control";
  return tabParam ? "control" : "extraccion";
}

function getCreditsButtonClasses(remainingQuota: number | null): string {
  if (remainingQuota == null) {
    return "bg-gradient-to-r from-gray-500 via-gray-600 to-gray-500 text-white shadow focus:ring-gray-400 dark:from-gray-700 dark:via-gray-500 dark:to-gray-400";
  }
  if (remainingQuota < 5) {
    return "bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white shadow focus:ring-red-400 dark:from-red-700 dark:via-red-500 dark:to-red-400";
  }
  if (remainingQuota < 20) {
    return "bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 text-[#212121] shadow focus:ring-amber-400 dark:from-amber-500 dark:via-yellow-500 dark:to-amber-400 dark:text-[#212121]";
  }
  return "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 text-white shadow focus:ring-blue-400 dark:from-blue-700 dark:via-blue-500 dark:to-blue-400";
}

function PanelCreditsButton({
  remainingQuota,
  loading,
}: {
  remainingQuota: number | null;
  loading: boolean;
}) {
  const isLowYellow = remainingQuota != null && remainingQuota >= 5 && remainingQuota < 20;

  return (
    <Link
      href={Routes.panelCredits}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2",
        getCreditsButtonClasses(remainingQuota),
      )}
    >
      <span
        className={cn(
          "mr-2 h-2 w-2 shrink-0 animate-pulse rounded-full",
          isLowYellow ? "bg-[#212121]/70" : "bg-white/80",
        )}
      />
      Créditos disponibles:{" "}
      <span className="ml-1 text-base font-bold">
        {loading ? "…" : (remainingQuota ?? "—")}
      </span>
    </Link>
  );
}

function PanelPageSectionContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const { user } = useUser();
  const canAccessExtraccion = isAdminCompanyUser(user);
  const { data: userData } = useQuery<
    UserCompanyCategoriesResponse,
    UserCompanyCategoriesVariables
  >(USER_COMPANY_CATEGORIES_QUERY, {
    variables: { where: { id: user?.id ?? "" } },
    skip: !user?.id,
  });
  const companyId = userData?.user?.company?.id ?? null;
  const { remainingQuota, loading: creditsLoading, refetch: refetchRemainingCredits } =
    useRemainingCredits(companyId);
  const visibleTabs = useMemo(
    () =>
      canAccessExtraccion
        ? mainTabs
        : mainTabs.filter((tab) => tab.key !== "extraccion"),
    [canAccessExtraccion]
  );

  const [activeTab, setActiveTab] = useState<PanelMainTab>(() =>
    getMainTabFromUrl(tabFromUrl, false)
  );
  const tablistRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<PanelMainTab, HTMLButtonElement | null>>({
    extraccion: null,
    control: null,
  });
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback(() => {
    const tablist = tablistRef.current;
    const activeEl = tabRefs.current[activeTab];
    if (!tablist || !activeEl) return;

    const tablistRect = tablist.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    setIndicator({
      left: activeRect.left - tablistRect.left,
      width: activeRect.width,
    });
  }, [activeTab]);

  useLayoutEffect(() => {
    updateIndicator();
    const tablist = tablistRef.current;
    if (!tablist) return;

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(tablist);
    window.addEventListener("resize", updateIndicator);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  useEffect(() => {
    setActiveTab(getMainTabFromUrl(tabFromUrl, canAccessExtraccion));
  }, [tabFromUrl, canAccessExtraccion]);

  const handleMainTabChange = (key: PanelMainTab) => {
    setActiveTab(key);
    const params = new URLSearchParams(searchParams.toString());
    if (key === "extraccion") {
      params.delete("tab");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      return;
    }
    if (!params.get("tab")) {
      params.set("tab", "inicio");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a]">
      <Navigation />
      <div className="pt-18 pb-5">
        <div className="mx-auto px-2 sm:px-3 lg:px-4">
          <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div aria-hidden />
            <div
              ref={tablistRef}
              role="tablist"
              aria-label="Secciones del panel"
              className="relative inline-flex max-w-full rounded-full bg-[#e8e8ed] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:bg-[#1c1c1e] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] motion-reduce:transition-none dark:bg-[#48484a] dark:shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  transition: `left 320ms ${IOS_SEGMENT_EASE}, width 320ms ${IOS_SEGMENT_EASE}`,
                }}
              />
              {visibleTabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    ref={(el) => {
                      tabRefs.current[tab.key] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleMainTabChange(tab.key)}
                    className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-2 py-1.5 text-xs font-semibold transition-colors duration-300 motion-reduce:transition-none sm:px-6 sm:py-2.5 min-w-0 ${
                      isActive
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-[#636366] hover:text-[#3a3a3c] dark:text-[#98989d] dark:hover:text-[#ebebf5]"
                    }`}
                    style={{
                      transitionTimingFunction: IOS_SEGMENT_EASE,
                    }}
                  >
                    <HugeiconsIcon
                      icon={tab.icon}
                      size={16}
                      className={`shrink-0 transition-colors duration-300 motion-reduce:transition-none ${
                        isActive ? "text-orange-600 dark:text-orange-400" : ""
                      }`}
                      style={{ transitionTimingFunction: IOS_SEGMENT_EASE }}
                    />
                    <span className="truncate whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-end">
              <PanelCreditsButton
                remainingQuota={remainingQuota}
                loading={creditsLoading}
              />
            </div>
       
          </div>

          {activeTab === "control" || !canAccessExtraccion ? (
            <PanelControlSection embedded />
          ) : (
            <ObtenerClientesPage
              onLeadsSyncSuccess={() => void refetchRemainingCredits()}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function PanelPageSectionFallback() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
    </div>
  );
}

export default function PanelPageSection() {
  return (
    <Suspense fallback={<PanelPageSectionFallback />}>
      <PanelPageSectionContent />
    </Suspense>
  );
}
