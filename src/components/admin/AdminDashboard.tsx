"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Footer, Navigation } from "kadesh/components/layout";
import RoleAccessDeniedSection from "kadesh/components/profile/sales/RoleAccessDeniedSection";
import { Routes } from "kadesh/core/routes";
import { useUser } from "kadesh/utils/UserContext";
import { isPlatformAdminUser } from "kadesh/utils/user-roles";
import { cn } from "kadesh/utils/cn";
import {
  ADMIN_TAB_ITEMS,
  ADMIN_TABS,
  parseAdminTab,
  type AdminTab,
} from "./constants";
import AdminOverview from "./AdminOverview";
import AdminUsersPanel from "./AdminUsersPanel";
import AdminSubscriptionsPanel from "./AdminSubscriptionsPanel";
import AdminPetPlacesPanel from "./AdminPetPlacesPanel";

function AdminFallback() {
  return (
    <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6">
      <div className="flex items-center justify-center gap-3 py-10">
        <span className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
        <span className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          Cargando operaciones...
        </span>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseAdminTab(searchParams.get("tab"));
  const [reviewPlaceId, setReviewPlaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user?.id) {
      router.push(Routes.auth.login);
    }
  }, [loading, user, router]);

  const setTab = useCallback(
    (next: AdminTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === ADMIN_TABS.OVERVIEW) {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      const qs = params.toString();
      router.replace(qs ? `${Routes.panelAdmin}?${qs}` : Routes.panelAdmin, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const openPlaceReview = useCallback(
    (placeId: string) => {
      setReviewPlaceId(placeId);
      setTab(ADMIN_TABS.PET_PLACES);
    },
    [setTab],
  );

  const clearReviewPlace = useCallback(() => {
    setReviewPlaceId(null);
  }, []);

  if (loading) return <AdminFallback />;
  if (!user?.id) return null;

  if (!isPlatformAdminUser(user)) {
    return (
      <RoleAccessDeniedSection
        title="Solo para administradores de Kadesh"
        description="Esta pantalla controla usuarios, planes y el directorio de veterinarias. Si necesitas acceso, habla con el equipo de plataforma."
        backHref={Routes.panel}
        backLabel="Volver al panel"
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-white tracking-tight">
          Operaciones
        </h1>
        <p className="text-[#616161] dark:text-[#b0b0b0] mt-1 max-w-2xl">
          Usuarios, planes y fichas del directorio. Lo que cambies aquí aplica
          de inmediato.
        </p>
      </header>

      <nav
        aria-label="Secciones de operaciones"
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
      >
        {ADMIN_TAB_ITEMS.map((item) => {
          const selected = item.id === tab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
                selected
                  ? "bg-[#212121] text-white dark:bg-white dark:text-[#121212]"
                  : "border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] text-[#424242] dark:text-[#e0e0e0] hover:border-orange-300",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {tab === ADMIN_TABS.OVERVIEW ? (
        <AdminOverview
          onOpenTab={setTab}
          onReviewPlace={openPlaceReview}
        />
      ) : null}
      {tab === ADMIN_TABS.USERS ? <AdminUsersPanel /> : null}
      {tab === ADMIN_TABS.SUBSCRIPTIONS ? <AdminSubscriptionsPanel /> : null}
      {tab === ADMIN_TABS.PET_PLACES ? (
        <AdminPetPlacesPanel
          initialPlaceId={reviewPlaceId}
          onConsumedInitialPlace={clearReviewPlace}
        />
      ) : null}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a]">
      <Navigation />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<AdminFallback />}>
            <AdminDashboardContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
