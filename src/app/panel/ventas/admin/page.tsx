"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Footer, Navigation } from "kadesh/components/layout";
import FeatureLockedSection from "kadesh/components/profile/sales/FeatureLockedSection";
import { useUser } from "kadesh/utils/UserContext";
import { Routes } from "kadesh/core/routes";
import { Role } from "kadesh/constants/constans";
import { AdminCompanySubscriptionsTable } from "kadesh/components/profile/sales/admin";

function AdminPlansFallback() {
  return (
    <div className="rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6">
      <div className="flex items-center justify-center gap-3 py-10">
        <span className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent" />
        <span className="text-sm text-[#616161] dark:text-[#b0b0b0]">
          Cargando...
        </span>
      </div>
    </div>
  );
}

function AdminPlansPageContent() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user?.id) {
      router.push(Routes.auth.login);
    }
  }, [loading, user, router]);

  if (loading) return <AdminPlansFallback />;
  if (!user?.id) return null;

  const isAdmin = user.roles?.some((r) => r.name === Role.ADMIN) ?? false;

  if (!isAdmin) {
    return <FeatureLockedSection sectionName="Panel Admin" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-white">
          Admin: suscripciones y features
        </h1>
        <p className="text-[#616161] dark:text-[#b0b0b0] mt-1">
          Verifica y ajusta planFeatures por usuario.
        </p>
      </div>

      <AdminCompanySubscriptionsTable />
    </div>
  );
}

export default function AdminPlansPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a0a]">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="mx-auto px-10 sm:px-10 lg:px-10">
          <Suspense fallback={<AdminPlansFallback />}>
            <AdminPlansPageContent />
          </Suspense>
        </div>
      </div>
      <Footer />
    </div>
  );
}

