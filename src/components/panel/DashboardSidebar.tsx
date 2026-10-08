"use client";

import { useSyncExternalStore } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserIcon,
  Chart01Icon,
  FileIcon,
  FolderIcon,
  CalendarIcon,
  UserAdd01Icon,
  UserGroupIcon,
  UserMultiple02Icon,
  WorkIcon,
  FlashIcon,
  SparklesIcon,
  WhatsappIcon,
  SidebarLeftIcon,
  SidebarRightIcon,
} from "@hugeicons/core-free-icons";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";
import { canAccessNavTab } from "kadesh/components/profile/usuarios/can";
import FeatureBetaBadge from "kadesh/components/profile/sales/planes/FeatureBetaBadge";
import { PLAN_FEATURE_KEYS } from "kadesh/constants/constans";
import { cn } from "kadesh/utils/cn";
import type { User } from "kadesh/utils/types";

const SIDEBAR_COLLAPSED_KEY = "kadesh.panel.navCollapsed";
const SIDEBAR_COLLAPSED_EVENT = "kadesh-panel-nav-collapsed";

const navItems = [
  { key: "inicio" as const, label: "Inicio", icon: DashboardSquare01Icon },
  { key: "profile" as const, label: "Datos del perfil", icon: UserIcon },
  {
    key: "usuarios" as const,
    label: "Usuarios",
    icon: UserMultiple02Icon,
  },
  {
    key: "ai" as const,
    label: KADESH_URIM_AI_NAME,
    icon: SparklesIcon,
    featureKey: "kadesh_ai",
  },
  {
    key: "clientes" as const,
    label: "Clientes",
    icon: Chart01Icon,
  },
  {
    key: "vendedores" as const,
    label: "Vendedores",
    icon: UserGroupIcon,
    featureKey: PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT,
  },
  {
    key: "archivos" as const,
    label: "Archivos",
    icon: FileIcon,
    featureKey: PLAN_FEATURE_KEYS.UPLOAD_FILES,
  },
  {
    key: "proyectos" as const,
    label: "Proyectos",
    icon: FolderIcon,
    featureKey: PLAN_FEATURE_KEYS.PROJECTS,
  },
  {
    key: "cotizaciones" as const,
    label: "Cotizaciones",
    icon: FileIcon,
    featureKey: PLAN_FEATURE_KEYS.QUOTATIONS,
  },
  {
    key: "calendar" as const,
    label: "Mi Calendario",
    icon: CalendarIcon,
    featureKey: PLAN_FEATURE_KEYS.CALENDAR_CRM,
  },
  {
    key: "workspaces" as const,
    label: "Espacios de trabajo",
    icon: WorkIcon,
    featureKey: PLAN_FEATURE_KEYS.WORKSPACES,
  },
  {
    key: "whatsapp" as const,
    label: "WhatsApp Business",
    icon: WhatsappIcon,
    featureKey: PLAN_FEATURE_KEYS.WHATSAPP,
  },
];

const navItemsKadeshConfig = [
  { key: "referidos" as const, label: "Referidos", icon: UserAdd01Icon },
  { key: "novedades" as const, label: "Novedades", icon: FlashIcon },
];

type NavItem = (typeof navItems)[number] | (typeof navItemsKadeshConfig)[number];

type DashboardSidebarProps = {
  user: User | undefined;
  selectedTab: string;
  onTabChange: (key: string) => void;
  hasVendedorRole: boolean;
  isAdminCompany: boolean;
  canManageAi: boolean;
  isAiLive: boolean;
  /** Keys de módulos incluidos y marcados en beta en el plan actual. */
  betaFeatureKeys: ReadonlySet<string>;
};

function readCollapsedPreference(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeCollapsedPreference(onStoreChange: () => void) {
  window.addEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(SIDEBAR_COLLAPSED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function writeCollapsedPreference(collapsed: boolean) {
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  } catch {
    // Preferencia local; si el navegador bloquea storage, el menú sigue usable.
  }
  window.dispatchEvent(new Event(SIDEBAR_COLLAPSED_EVENT));
}

function isNavItemVisible(
  item: NavItem,
  {
    user,
    hasVendedorRole,
    isAdminCompany,
    canManageAi,
  }: DashboardSidebarProps,
): boolean {
  return canAccessNavTab(user, item.key, {
    hasVendedorRole,
    isAdminCompany,
    canManageAi,
  });
}

function NavButton({
  item,
  isActive,
  isCollapsed,
  isBeta,
  onTabChange,
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  isBeta: boolean;
  onTabChange: (key: string) => void;
}) {
  const isAi = item.key === "ai";

  return (
    <button
      type="button"
      data-tour={`nav-${item.key}`}
      title={
        isCollapsed ? (isBeta ? `${item.label} · Beta` : item.label) : undefined
      }
      onClick={() => onTabChange(item.key)}
      className={cn(
        "relative flex items-center rounded-lg text-sm font-medium transition-colors",
        isCollapsed
          ? "size-11 shrink-0 justify-center lg:w-full"
          : "w-full gap-3 px-4 py-3 text-left",
        isActive
          ? isAi
            ? "ai-urim-fill shadow-[0_6px_14px_rgba(139,92,246,0.28)]"
            : "bg-orange-500 text-white dark:bg-orange-500 dark:text-white"
          : "text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]",
      )}
    >
      <span className={isAi && !isActive ? "ai-urim-icon" : undefined}>
        <HugeiconsIcon icon={item.icon} size={20} />
      </span>
      <span
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2",
          isCollapsed && "sr-only",
        )}
      >
        <span className="truncate">{item.label}</span>
        {isBeta ? <FeatureBetaBadge onFill={isActive} /> : null}
      </span>
      {isBeta && isCollapsed ? (
        <span
          className="absolute right-1.5 top-1.5 size-2 rounded-full bg-violet-400"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function isBetaItem(item: NavItem, betaFeatureKeys: ReadonlySet<string>) {
  return "featureKey" in item && item.featureKey
    ? betaFeatureKeys.has(item.featureKey)
    : false;
}

export default function DashboardSidebar(props: DashboardSidebarProps) {
  const { selectedTab, onTabChange, isAiLive, betaFeatureKeys } = props;
  const isCollapsed = useSyncExternalStore(
    subscribeCollapsedPreference,
    readCollapsedPreference,
    () => false,
  );

  const visibleNavItems = navItems.filter((item) =>
    isNavItemVisible(item, props),
  );
  const collapseLabel = isCollapsed ? "Mostrar menú" : "Ocultar menú";

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col gap-3 overflow-visible transition-[width] duration-200",
        isCollapsed ? "w-full lg:w-16" : "w-full lg:w-60",
      )}
    >
      <div className={cn("flex", isCollapsed ? "lg:justify-center" : "justify-end")}>
        <button
          type="button"
          aria-expanded={!isCollapsed}
          aria-controls="panel-nav"
          title={collapseLabel}
          onClick={() => writeCollapsedPreference(!isCollapsed)}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] bg-white text-sm font-medium text-[#616161] shadow-sm transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]",
            isCollapsed ? "size-11" : "px-3",
          )}
        >
          <HugeiconsIcon
            icon={isCollapsed ? SidebarRightIcon : SidebarLeftIcon}
            size={20}
          />
          <span className={cn(isCollapsed && "sr-only")}>{collapseLabel}</span>
        </button>
      </div>

      <div id="panel-nav" className="flex flex-col gap-5">
        <svg width="0" height="0" aria-hidden className="absolute">
          <defs>
            <linearGradient
              id="kadesh-urim-icon-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="var(--ai-urim-purple)" />
              <stop offset="100%" stopColor="var(--ai-urim-blue)" />
            </linearGradient>
          </defs>
        </svg>
        <div
          className={cn(
            "rounded-2xl",
            isAiLive ? "ai-live-ring shadow-sm" : "shadow-sm",
          )}
        >
          <nav
            className={cn(
              "rounded-[14px] bg-white p-2 dark:bg-[#1e1e1e]",
              isAiLive
                ? undefined
                : "rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a]",
              isCollapsed && "flex flex-row flex-wrap gap-1 lg:flex-col",
            )}
          >
            {visibleNavItems.map((item) => (
              <NavButton
                key={item.key}
                item={item}
                isActive={selectedTab === item.key}
                isCollapsed={isCollapsed}
                isBeta={isBetaItem(item, betaFeatureKeys)}
                onTabChange={onTabChange}
              />
            ))}
          </nav>
        </div>
        <nav
          className={cn(
            "rounded-2xl border border-[#e0e0e0] bg-white p-2 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]",
            isCollapsed && "flex flex-row flex-wrap gap-1 lg:flex-col",
          )}
        >
          {navItemsKadeshConfig.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              isActive={selectedTab === item.key}
              isCollapsed={isCollapsed}
              isBeta={false}
              onTabChange={onTabChange}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
