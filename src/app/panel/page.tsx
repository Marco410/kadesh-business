"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  UserIcon,
  Chart01Icon,
  Add01Icon,
  ArrowRight01Icon,
  FileAttachmentIcon,
} from "@hugeicons/core-free-icons";
import ProfileData from "kadesh/components/profile/ProfileData";
import SalesSection from "kadesh/components/profile/sales/SalesSection";
import VendedoresSection from "kadesh/components/profile/sales/vendedores/VendedoresSection";
import { Footer, Navigation } from "kadesh/components/layout";
import { Role } from "kadesh/constants/constans";

const VALID_TABS = ["inicio", "profile", "ventas", "vendedores"] as const;

function getValidTab(
  tabFromUrl: string | null,
  hasVendedorRole: boolean,
  isAdminCompany: boolean
): (typeof VALID_TABS)[number] {
  if (!tabFromUrl || !VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number])) {
    return "inicio";
  }
  if (tabFromUrl === "ventas" && !hasVendedorRole) {
    return "inicio";
  }
  if (tabFromUrl === "vendedores" && !isAdminCompany) {
    return "inicio";
  }
  return tabFromUrl as (typeof VALID_TABS)[number];
}

const navItems = [
  { key: "inicio" as const, label: "Inicio", icon: DashboardSquare01Icon },
  { key: "profile" as const, label: "Datos del perfil", icon: UserIcon },
  { key: "ventas" as const, label: "Ventas", icon: Chart01Icon, requireVendedor: true },
  { key: "vendedores" as const, label: "Vendedores", icon: UserIcon, requireAdminCompany: true },
];

function DashboardSidebar({
  selectedTab,
  onTabChange,
  hasVendedorRole,
  isAdminCompany,
}: {
  selectedTab: string;
  onTabChange: (key: string) => void;
  hasVendedorRole: boolean;
  isAdminCompany: boolean;
}) {
  return (
    <aside className="w-full lg:w-60 shrink-0">
      <nav className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-2 shadow-sm">
        {navItems.map((item) => {
          if ("requireVendedor" in item && item.requireVendedor && !hasVendedorRole) return null;
          if ("requireAdminCompany" in item && item.requireAdminCompany && !isAdminCompany) return null;
          const isActive = selectedTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-500 text-white dark:bg-orange-500 dark:text-white"
                  : "text-[#616161] dark:text-[#b0b0b0] hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]"
              }`}
            >
              <HugeiconsIcon icon={item.icon} size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function DashboardWelcome({ userName }: { userName: string }) {
  const firstName = userName?.split(/\s+/)[0] || "Usuario";
  return (
    <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-transparent p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-white">
        Hola, {firstName}
      </h2>
      <p className="mt-1 text-[#616161] dark:text-[#b0b0b0]">
        Bienvenido a tu panel. Desde aquí gestionas tu perfil y ventas.
      </p>
    </div>
  );
}

function QuickActions({ hasVendedorRole }: { hasVendedorRole: boolean }) {
  const actions = [
    { label: "Editar mi perfil", href: `${Routes.panel}?tab=profile`, icon: UserIcon },
    ...(hasVendedorRole
      ? [
          { label: "Obtener nuevos clientes", href: Routes.panelSyncLeads, icon: Add01Icon },
          { label: "Ver leads y ventas", href: `${Routes.panel}?tab=ventas`, icon: Chart01Icon },
          { label: "Planes y precios", href: Routes.panelPlans, icon: FileAttachmentIcon },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="group flex items-center gap-4 rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-5 shadow-sm hover:border-orange-500/50 dark:hover:border-orange-500/50 hover:shadow-md transition-all"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400">
            <HugeiconsIcon icon={action.icon} size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[#212121] dark:text-white">{action.label}</p>
            <p className="text-xs text-[#616161] dark:text-[#b0b0b0] mt-0.5 flex items-center gap-1">
              Ir <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="opacity-70" />
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProfilePageContent() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tabFromUrl = searchParams.get("tab");
  const hasVendedorRole = user?.roles?.some((r) => r.name === Role.VENDEDOR) ?? false;
  const isAdminCompany = user?.roles?.some((r) => r.name === Role.ADMIN_COMPANY) ?? false;
  const selectedTab = getValidTab(tabFromUrl, hasVendedorRole, isAdminCompany);

  const handleTabChange = (key: string) => {
    router.replace(`${pathname}?tab=${key}`, { scroll: false });
  };

  useEffect(() => {
    if (!loading && !user?.id) {
      router.push(Routes.auth.login);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto" />
          <p className="mt-4 text-[#616161] dark:text-[#b0b0b0]">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a]">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="mx-auto px-10 sm:px-10 lg:px-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-white">
              Panel de control
            </h1>
            <p className="text-[#616161] dark:text-[#b0b0b0] mt-1">
              Gestiona tu información y ventas
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <DashboardSidebar
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              hasVendedorRole={hasVendedorRole}
              isAdminCompany={isAdminCompany}
            />

            <main className="flex-1 min-w-0">
              {selectedTab === "inicio" && (
                <div className="space-y-8">
                  <DashboardWelcome userName={user.name ?? ""} />
                  <div>
                    <h3 className="text-lg font-semibold text-[#212121] dark:text-white mb-4">
                      Acciones rápidas
                    </h3>
                    <QuickActions hasVendedorRole={hasVendedorRole} />
                  </div>
                </div>
              )}

              {selectedTab === "profile" && (
                <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8 shadow-sm">
                  <ProfileData user={user} />
                </div>
              )}

              {selectedTab === "ventas" && hasVendedorRole && (
                <div className="space-y-6">
                  <SalesSection userId={user.id} />
                </div>
              )}

              {selectedTab === "vendedores" && isAdminCompany && (
                <div className="space-y-6">
                  <VendedoresSection userId={user.id} />
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ProfilePageFallback() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto" />
        <p className="mt-4 text-[#616161] dark:text-[#b0b0b0]">Cargando panel...</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageFallback />}>
      <ProfilePageContent />
    </Suspense>
  );
}
