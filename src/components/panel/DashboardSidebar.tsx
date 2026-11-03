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
  Analytics01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import { createElement } from "react";
import type { AppNavGroup, AppNavItem } from "kadesh/components/app-shell";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";
import { canAccessNavTab } from "kadesh/components/profile/usuarios/can";
import FeatureBetaBadge from "kadesh/components/profile/sales/planes/FeatureBetaBadge";
import { PLAN_FEATURE_KEYS } from "kadesh/constants/constans";
import { Routes } from "kadesh/core/routes";
import type { User } from "kadesh/utils/types";

/*
 * Menú del panel de control (lo pinta `AppShell` desde `PanelShell`). Antes era un menú propio;
 * desde 2026-11 este archivo solo define secciones, grupos, permisos y anclas de tutorial.
 * `scripts/check-tours.mjs` lee `navItems` de aquí: conserva el nombre y el formato `key: "…"`.
 */

/** Grupos del menú, en orden. */
export const PANEL_NAV_GROUPS = [
  { id: "general", title: "General" },
  { id: "ventas", title: "Ventas" },
  { id: "equipo", title: "Equipo y cuenta" },
  { id: "kadesh", title: "Kadesh" },
] as const;

type PanelNavGroupId = (typeof PANEL_NAV_GROUPS)[number]["id"];

const navItems = [
  { key: "inicio" as const, label: "Inicio", icon: DashboardSquare01Icon, group: "general" },
  { key: "profile" as const, label: "Datos del perfil", icon: UserIcon, group: "equipo" },
  {
    key: "usuarios" as const,
    label: "Usuarios",
    icon: UserMultiple02Icon,
    group: "equipo",
  },
  {
    key: "ai" as const,
    label: KADESH_URIM_AI_NAME,
    icon: SparklesIcon,
    featureKey: "kadesh_ai",
    group: "general",
  },
  {
    key: "clientes" as const,
    label: "Clientes",
    icon: Chart01Icon,
    group: "ventas",
  },
  {
    key: "vendedores" as const,
    label: "Vendedores",
    icon: UserGroupIcon,
    featureKey: PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT,
    group: "equipo",
  },
  {
    key: "analitica" as const,
    label: "Analítica",
    icon: Analytics01Icon,
    featureKey: PLAN_FEATURE_KEYS.ANALYTICS,
    group: "general",
  },
  {
    key: "archivos" as const,
    label: "Archivos",
    icon: FileIcon,
    featureKey: PLAN_FEATURE_KEYS.UPLOAD_FILES,
    group: "equipo",
  },
  {
    key: "proyectos" as const,
    label: "Proyectos",
    icon: FolderIcon,
    featureKey: PLAN_FEATURE_KEYS.PROJECTS,
    group: "ventas",
  },
  {
    key: "cotizaciones" as const,
    label: "Cotizaciones",
    icon: FileIcon,
    featureKey: PLAN_FEATURE_KEYS.QUOTATIONS,
    group: "ventas",
  },
  {
    key: "calendar" as const,
    label: "Mi Calendario",
    icon: CalendarIcon,
    featureKey: PLAN_FEATURE_KEYS.CALENDAR_CRM,
    group: "ventas",
  },
  {
    key: "workspaces" as const,
    label: "Espacios de trabajo",
    icon: WorkIcon,
    featureKey: PLAN_FEATURE_KEYS.WORKSPACES,
    group: "ventas",
  },
  {
    key: "whatsapp" as const,
    label: "WhatsApp Business",
    icon: WhatsappIcon,
    featureKey: PLAN_FEATURE_KEYS.WHATSAPP,
    group: "equipo",
  },
];

const navItemsKadeshConfig = [
  { key: "referidos" as const, label: "Referidos", icon: UserAdd01Icon, group: "kadesh" },
  { key: "novedades" as const, label: "Novedades", icon: FlashIcon, group: "kadesh" },
];

/** Orden dentro de cada grupo (el arreglo de arriba conserva su orden histórico). */
const GROUP_ORDER: Record<PanelNavGroupId, string[]> = {
  general: ["inicio", "ai", "analitica"],
  ventas: ["clientes", "cotizaciones", "proyectos", "calendar", "workspaces"],
  equipo: ["vendedores", "usuarios", "archivos", "whatsapp", "profile"],
  kadesh: ["referidos", "novedades"],
};

type NavItem = (typeof navItems)[number] | (typeof navItemsKadeshConfig)[number];

/** Etiqueta de cada sección (`?tab=`), para migas y títulos. */
export const PANEL_NAV_LABELS: Record<string, string> = Object.fromEntries(
  [...navItems, ...navItemsKadeshConfig].map((item) => [item.key, item.label]),
);

export type PanelNavContext = {
  user: User | undefined;
  selectedTab: string | null;
  /** `null` = estamos en Extracción B2B (`/panel` sin `tab`). */
  hasVendedorRole: boolean;
  isAdminCompany: boolean;
  canManageAi: boolean;
  canAccessExtraccion: boolean;
  /** Keys de módulos incluidos y marcados en beta en el plan actual. */
  betaFeatureKeys: ReadonlySet<string>;
};

function isBetaItem(item: NavItem, betaFeatureKeys: ReadonlySet<string>) {
  return "featureKey" in item && item.featureKey ? betaFeatureKeys.has(item.featureKey) : false;
}

function toNavItem(item: NavItem, ctx: PanelNavContext): AppNavItem {
  const isBeta = isBetaItem(item, ctx.betaFeatureKeys);
  return {
    id: item.key,
    label: item.label,
    icon: item.icon,
    href: `${Routes.panel}?tab=${item.key}`,
    active: ctx.selectedTab === item.key,
    dataTour: `nav-${item.key}`,
    variant: item.key === "ai" ? "ai" : "default",
    extra: isBeta ? createElement(FeatureBetaBadge, { onFill: ctx.selectedTab === item.key }) : undefined,
  };
}

/**
 * Grupos del menú del panel según permisos y plan: Prospección (Extracción B2B, solo admin de
 * empresa), General, Ventas, Equipo y cuenta, Kadesh. Las secciones que la persona no puede ver
 * no aparecen (`canAccessNavTab`).
 */
export function buildPanelNavGroups(ctx: PanelNavContext): AppNavGroup[] {
  const access = {
    hasVendedorRole: ctx.hasVendedorRole,
    isAdminCompany: ctx.isAdminCompany,
    canManageAi: ctx.canManageAi,
  };
  const all = [...navItems, ...navItemsKadeshConfig].filter(
    (item) => item.group === "kadesh" || canAccessNavTab(ctx.user, item.key, access),
  );

  const groups: AppNavGroup[] = [];
  if (ctx.canAccessExtraccion) {
    groups.push({
      id: "prospeccion",
      title: "Prospección",
      items: [
        {
          id: "extraccion",
          label: "Extracción B2B",
          icon: ZapIcon,
          href: Routes.panel,
          active: ctx.selectedTab === null,
          dataTour: "main-tab-extraccion",
        },
      ],
    });
  }
  for (const group of PANEL_NAV_GROUPS) {
    const items = GROUP_ORDER[group.id]
      .map((key) => all.find((item) => item.key === key))
      .filter((item): item is NavItem => Boolean(item))
      .map((item) => toNavItem(item, ctx));
    if (items.length) groups.push({ id: group.id, title: group.title, items });
  }
  return groups;
}

/** Grupo al que pertenece una sección (para las migas); `null` si no es una sección del menú. */
export function panelNavGroupTitle(tab: string | null): string | null {
  if (!tab) return "Prospección";
  const item = [...navItems, ...navItemsKadeshConfig].find((candidate) => candidate.key === tab);
  return PANEL_NAV_GROUPS.find((group) => group.id === item?.group)?.title ?? null;
}

/** Preferencia de menú colapsado (la misma llave que el menú anterior). */
export const PANEL_NAV_COLLAPSED_KEY = "kadesh.panel.navCollapsed";
