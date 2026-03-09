"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs, Tab } from '@heroui/tabs';
import { useUser } from 'kadesh/utils/UserContext';
import { Routes } from 'kadesh/core/routes';
import ProfileData from 'kadesh/components/profile/ProfileData';
import SalesSection from 'kadesh/components/profile/sales/SalesSection';
import EmptyState from 'kadesh/components/shared/EmptyState';
import { Footer, Navigation } from 'kadesh/components/layout';
import { Role } from 'kadesh/constants/constans';

const VALID_TABS = ['profile', 'posts', 'ventas', 'veterinaries', 'donations', 'shelters', 'animals', 'pets'] as const;

function getValidTab(tabFromUrl: string | null, hasVendedorRole: boolean): string {
  if (!tabFromUrl || !VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number])) {
    return 'profile';
  }
  if (tabFromUrl === 'ventas' && !hasVendedorRole) {
    return 'profile';
  }
  return tabFromUrl;
}

function ProfilePageContent() {
  const { user, loading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tabFromUrl = searchParams.get("tab");
  const hasVendedorRole = user?.roles?.some((r) => r.name === Role.VENDEDOR) ?? false;
  const selectedTab = getValidTab(tabFromUrl, hasVendedorRole);

  const handleTabChange = (key: React.Key) => {
    router.replace(`${pathname}?tab=${String(key)}`, { scroll: false });
  };

  useEffect(() => {
    if (!loading && !user?.id) {
      router.push(Routes.auth.login);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-[#616161] dark:text-[#b0b0b0]">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return null;
  }

  return (
    <div className="min-h-screen  via-white to-white dark:from-orange-900 dark:via-[#121212] dark:to-[#0f0f0f]">
    <Navigation />
    <div className="min-h-screen  via-white to-white dark:from-orange-900 dark:via-[#121212] dark:to-[#0f0f0f] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#212121] dark:text-[#ffffff] mb-2">
            Mi Perfil
          </h1>
          <p className="text-[#616161] dark:text-[#b0b0b0]">
            Gestiona tu información personal y actividad
          </p>
        </div>

        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={handleTabChange}
          classNames={{
            tabList: "w-full bg-[#f5f5f5] dark:bg-[#2a2a2a] rounded-lg p-1",
            tab: "flex-1 text-sm font-semibold data-[selected=true]:bg-white dark:data-[selected=true]:bg-[#1e1e1e] data-[selected=true]:text-orange-500 dark:data-[selected=true]:text-orange-400 rounded-lg  min-w-34 min-h-11",
            tabContent: "text-[#616161] dark:text-[#b0b0b0]",
            panel: "mt-6",
          }}
        >
          <Tab key="profile" title="Datos del Perfil">
            <ProfileData user={user} />
          </Tab>
          {hasVendedorRole && (
            <Tab key="ventas" title="Ventas">
              <SalesSection userId={user.id} />
            </Tab>
          )}
        </Tabs>
      </div>
    </div>
    <Footer />
    </div>
  );
}

function ProfilePageFallback() {
  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto" />
        <p className="mt-4 text-[#616161] dark:text-[#b0b0b0]">Cargando perfil...</p>
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
