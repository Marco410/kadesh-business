"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Mail01Icon, NoteEditIcon, Search01Icon, SparklesIcon } from "@hugeicons/core-free-icons";
import { AppPageHeader, AppShell, popTransition, type AppCrumb, type AppNavGroup } from "kadesh/components/app-shell";
import { Footer, Navigation } from "kadesh/components/layout";
import RoleAccessDeniedSection from "kadesh/components/profile/sales/RoleAccessDeniedSection";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { useIsClient } from "kadesh/utils/useIsClient";
import { isPlatformAdminUser } from "kadesh/utils/user-roles";
import {
  ADMIN_NAV_GROUPS,
  ADMIN_SCOPED_PARAMS,
  ADMIN_TABS,
  PET_PLACE_CLAIM_STATUS,
  PET_PLACE_SERVICE_STATUS,
  activeAdminNavItem,
  normalizeLegacyAdminParams,
  parseAdminTab,
  parsePlansVista,
  PLANS_VISTAS,
  type AdminNavItemConfig,
  type AdminTab,
  type PlansVista,
} from "./constants";
import { ADMIN_NAV_COUNTS_QUERY, type AdminNavCountsResponse } from "./queries";
import { useAdminNavigation } from "./hooks/useAdminNavigation";
import { adminButtonClass } from "./ui";
import AdminOverview from "./AdminOverview";
import AdminClientsSection from "./clients/AdminClientsSection";
import AdminActivityPanel from "./activity/AdminActivityPanel";
import AdminErrorsPanel from "./app-errors/AdminErrorsPanel";
import AdminSecurityPanel from "./security/AdminSecurityPanel";
import AdminAnalyticsSection from "./analytics/AdminAnalyticsSection";
import AdminPlansPanel from "./AdminPlansPanel";
import AdminContentSection from "./AdminContentSection";
import AdminReleasesPanel from "./releases/AdminReleasesPanel";
import AdminPetSection from "./pet/AdminPetSection";
import { parsePetVista, PET_VISTAS } from "./pet/constants";
import { PET_EVENT_STATUS } from "./events/constants";

const NAV_COUNTS_VARIABLES = {
  pendingWhere: { claimStatus: { equals: PET_PLACE_CLAIM_STATUS.PENDING } },
  pendingServiceWhere: { status: { equals: PET_PLACE_SERVICE_STATUS.PENDING } },
  pendingEventWhere: { status: { equals: PET_EVENT_STATUS.PENDING } },
};

function AdminFallback() {
  return (
    <div className="kd-dash font-dash flex min-h-dvh items-center justify-center gap-3">
      <span className="size-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      <span className="text-sm text-dash-muted">Cargando operaciones...</span>
    </div>
  );
}

/** Enlace limpio a un item del menú: cambiar de sección no arrastra filtros de la anterior. */
function navHref(item: AdminNavItemConfig): string {
  const params = new URLSearchParams();
  if (item.tab !== ADMIN_TABS.OVERVIEW) params.set("tab", item.tab);
  if (item.vista) params.set("vista", item.vista);
  const qs = params.toString();
  return qs ? `${Routes.panelAdmin}?${qs}` : Routes.panelAdmin;
}

const LONG_DATE = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "America/Mexico_City",
});

/** "Martes 3 de noviembre" (solo en el cliente: la hora del servidor no es la de quien mira). */
function useLongDate(): string | null {
  const mounted = useIsClient();
  if (!mounted) return null;
  const text = LONG_DATE.format(new Date()).replace(",", "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Buscador de la barra: lleva a Clientes → Empresas con `?q=` (busca empresa, correo o integrante). */
function AdminTopSearch() {
  const { goTo } = useAdminNavigation();
  const [value, setValue] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    goTo(ADMIN_TABS.CLIENTS, { q });
    setValue("");
  };
  return (
    <form
      role="search"
      onSubmit={submit}
      className="hidden h-10 w-[min(320px,28vw)] items-center gap-2 rounded-full border border-dash-line bg-dash-surface px-3.5 transition-[border-color,box-shadow] focus-within:border-orange-400 focus-within:ring-[3px] focus-within:ring-orange-500/15 md:flex"
    >
      <HugeiconsIcon icon={Search01Icon} size={18} className="shrink-0 text-dash-faint" />
      <label htmlFor="admin-top-search" className="sr-only">
        Buscar empresa o persona
      </label>
      <input
        id="admin-top-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar empresa o persona…"
        className="min-w-0 flex-1 bg-transparent text-sm text-dash-ink placeholder:text-dash-faint focus:outline-none"
      />
    </form>
  );
}

const NEW_ACTIONS = [
  { id: "novedad", label: "Nueva novedad", icon: SparklesIcon, tab: ADMIN_TABS.RELEASES, params: { nuevo: "1" } },
  { id: "articulo", label: "Nuevo artículo", icon: NoteEditIcon, tab: ADMIN_TABS.CONTENT, params: { nuevo: "1" } },
  { id: "correo", label: "Nuevo correo", icon: Mail01Icon, tab: ADMIN_TABS.CONTENT, params: { vista: "correos" } },
] as const;

/** "+ Nuevo": atajos para crear lo más común sin buscar la sección. */
function AdminNewMenu() {
  const { goTo } = useAdminNavigation();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapper}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={adminButtonClass({ size: "sm", className: "size-10 px-0 md:w-auto md:px-4" })}
      >
        <HugeiconsIcon icon={Add01Icon} size={18} />
        <span className="sr-only md:not-sr-only">Nuevo</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={popTransition}
            className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[220px] origin-top-right rounded-[18px] border border-dash-line bg-dash-surface p-1.5 shadow-dash-lift"
          >
            {NEW_ACTIONS.map((action) => (
              <li key={action.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    goTo(action.tab, action.params);
                  }}
                  className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-dash-ink transition-colors hover:bg-dash-surface-2"
                >
                  <HugeiconsIcon icon={action.icon} size={18} className="text-orange-600 dark:text-orange-400" />
                  {action.label}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AdminDashboardContent() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseAdminTab(searchParams.get("tab"));
  const petVista = parsePetVista(searchParams.get("vista"));
  const plansVista = parsePlansVista(searchParams.get("vista"));
  const [reviewPlaceId, setReviewPlaceId] = useState<string | null>(null);
  const [reviewServiceId, setReviewServiceId] = useState<string | null>(null);
  const longDate = useLongDate();
  const isAdmin = Boolean(user?.id && isPlatformAdminUser(user));

  const { data: counts } = useQuery<AdminNavCountsResponse>(ADMIN_NAV_COUNTS_QUERY, {
    variables: NAV_COUNTS_VARIABLES,
    fetchPolicy: "cache-and-network",
    pollInterval: 60_000,
    skip: !isAdmin,
  });

  useEffect(() => {
    if (!loading && !user?.id) {
      router.push(Routes.auth.login);
    }
  }, [loading, user, router]);

  // Enlaces viejos (?tab=usuarios, empresas, suscripciones, blog, correos) → sección nueva.
  useEffect(() => {
    const next = normalizeLegacyAdminParams(new URLSearchParams(searchParams.toString()));
    if (!next) return;
    const qs = next.toString();
    router.replace(qs ? `${Routes.panelAdmin}?${qs}` : Routes.panelAdmin, {
      scroll: false,
    });
  }, [router, searchParams]);

  /** Cambiar de sección limpia los params de la anterior (filtros, detalle, vista). */
  const setTab = useCallback(
    (next: AdminTab, nextVista?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const key of ADMIN_SCOPED_PARAMS) params.delete(key);
      if (next === ADMIN_TABS.OVERVIEW) {
        params.delete("tab");
      } else {
        params.set("tab", next);
        if (nextVista) params.set("vista", nextVista);
      }
      const qs = params.toString();
      router.replace(qs ? `${Routes.panelAdmin}?${qs}` : Routes.panelAdmin, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const setPlansVista = useCallback(
    (next: PlansVista) => {
      setTab(ADMIN_TABS.PLANS, next === PLANS_VISTAS.MODULES ? next : undefined);
    },
    [setTab],
  );

  const openPlaceReview = useCallback(
    (placeId: string) => {
      setReviewPlaceId(placeId);
      setTab(ADMIN_TABS.PET_PLACES, PET_VISTAS.PLACES);
    },
    [setTab],
  );

  const openServiceReview = useCallback(
    (serviceId: string) => {
      setReviewServiceId(serviceId);
      setTab(ADMIN_TABS.PET_PLACES, PET_VISTAS.SERVICES);
    },
    [setTab],
  );

  const clearReviewPlace = useCallback(() => {
    setReviewPlaceId(null);
  }, []);

  const clearReviewService = useCallback(() => {
    setReviewServiceId(null);
  }, []);

  // Cada sección o vista se vuelve a montar (repite su entrada) y el foco pasa a su título.
  const viewKey = [
    tab,
    searchParams.get("vista") ?? "",
    searchParams.get("empresa") ?? "",
    searchParams.get("usuario") ?? "",
    searchParams.get("nuevo") ?? "",
  ].join(":");
  const firstView = useRef(true);
  useEffect(() => {
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    document.querySelector<HTMLElement>("[data-app-title]")?.focus({ preventScroll: true });
  }, [viewKey]);

  if (loading) return <AdminFallback />;
  if (!user?.id) return null;
  if (normalizeLegacyAdminParams(new URLSearchParams(searchParams.toString()))) {
    return <AdminFallback />;
  }

  if (!isPlatformAdminUser(user)) {
    return (
      <div className="min-h-screen bg-dash-surface-2">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
          <RoleAccessDeniedSection
            title="Solo para administradores de Kadesh"
            description="Esta pantalla controla clientes, su actividad, planes, el contenido y el directorio de veterinarias. Si necesitas acceso, habla con el equipo de plataforma."
            backHref={Routes.panel}
            backLabel="Volver al panel"
          />
        </main>
        <Footer />
      </div>
    );
  }

  const { group, item } = activeAdminNavItem(searchParams);
  const inDetail = tab === ADMIN_TABS.CLIENTS && Boolean(searchParams.get("empresa") || searchParams.get("usuario"));

  const groups: AppNavGroup[] = ADMIN_NAV_GROUPS.map((navGroup) => ({
    id: navGroup.id,
    title: navGroup.title,
    items: navGroup.items.map((navItem) => ({
      id: navItem.id,
      label: navItem.label,
      icon: navItem.icon,
      href: navHref(navItem),
      active: navItem.id === item.id,
      badge: navItem.badgeKey ? (counts?.[navItem.badgeKey] ?? null) : null,
    })),
  }));

  const crumbs: AppCrumb[] = [
    { label: "Operaciones", href: Routes.panelAdmin },
    ...(group.id !== "general" ? [{ label: group.title }] : []),
    { label: item.label, href: inDetail ? navHref(item) : undefined },
    ...(inDetail ? [{ label: searchParams.get("empresa") ? "Detalle de empresa" : "Detalle de persona" }] : []),
  ];

  return (
    <AppShell
      brandTitle="Kadesh"
      brandSubtitle="Operaciones"
      groups={groups}
      crumbs={crumbs}
      showNotifications
      actions={
        <>
          <AdminTopSearch />
          <AdminNewMenu />
        </>
      }
    >
      <div key={viewKey}>
        {!inDetail ? (
          <AppPageHeader
            eyebrow={tab === ADMIN_TABS.OVERVIEW ? longDate : group.title}
            title={item.label}
            description={item.description}
          />
        ) : null}

        {tab === ADMIN_TABS.OVERVIEW ? (
          <AdminOverview
            onOpenTab={setTab}
            onReviewPlace={openPlaceReview}
            onReviewService={openServiceReview}
          />
        ) : null}
        {tab === ADMIN_TABS.CLIENTS ? <AdminClientsSection /> : null}
        {tab === ADMIN_TABS.ACTIVITY ? <AdminActivityPanel /> : null}
        {tab === ADMIN_TABS.ERRORS ? <AdminErrorsPanel /> : null}
        {tab === ADMIN_TABS.SECURITY ? <AdminSecurityPanel /> : null}
        {tab === ADMIN_TABS.ANALYTICS ? <AdminAnalyticsSection /> : null}
        {tab === ADMIN_TABS.PLANS ? <AdminPlansPanel vista={plansVista} onVistaChange={setPlansVista} /> : null}
        {tab === ADMIN_TABS.CONTENT ? <AdminContentSection /> : null}
        {tab === ADMIN_TABS.RELEASES ? <AdminReleasesPanel /> : null}
        {tab === ADMIN_TABS.PET_PLACES ? (
          <AdminPetSection
            vista={petVista}
            initialPlaceId={reviewPlaceId}
            onConsumedInitialPlace={clearReviewPlace}
            initialServiceId={reviewServiceId}
            onConsumedInitialService={clearReviewService}
          />
        ) : null}
      </div>
    </AppShell>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
