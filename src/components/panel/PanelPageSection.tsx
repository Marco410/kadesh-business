"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import { Footer, Navigation } from "kadesh/components/layout";
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

function getMainTabFromUrl(tabParam: string | null): PanelMainTab {
  return tabParam ? "control" : "extraccion";
}

function PanelPageSectionContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<PanelMainTab>(() =>
    getMainTabFromUrl(tabFromUrl)
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
    setActiveTab(getMainTabFromUrl(tabFromUrl));
  }, [tabFromUrl]);

  const handleMainTabChange = (key: PanelMainTab) => {
    setActiveTab(key);
    if (key === "extraccion") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tab");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a]">
      <Navigation />
      <div className="pt-18 pb-5">
        <div className="mx-auto px-2 sm:px-3 lg:px-4">
          <div className="mb-2 flex justify-center">
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
              {mainTabs.map((tab) => {
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
          </div>

          {activeTab === "control" ? (
            <PanelControlSection embedded />
          ) : (
            <ObtenerClientesPage />
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
