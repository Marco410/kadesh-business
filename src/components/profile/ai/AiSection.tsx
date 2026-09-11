"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  AiSettingIcon,
  DashboardSquare01Icon,
  InformationCircleIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { AiCompanyInfoTab } from "./AiCompanyInfoTab";
import { AiDashboardTab } from "./AiDashboardTab";
import { AiSettingsSection } from "./AiSettingsSection";
import { KADESH_URIM_AI_NAME } from "./constants";
import { useCompanyAiLive } from "./useCompanyAiLive";

type AiTab = "dashboard" | "info" | "settings";

type AiSectionProps = {
  companyId: string | null;
  canManageAi: boolean;
  isCompanyWide: boolean;
};

/**
 * Pantalla de Kadesh AI: Dashboard, Información (perfil comercial) y Configuración.
 */
export function AiSection({
  companyId,
  canManageAi,
  isCompanyWide,
}: AiSectionProps) {
  const { configured, loading } = useCompanyAiLive(companyId);
  const [tab, setTab] = useState<AiTab | null>(null);

  if (!companyId) {
    return (
      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-8">
        <h2 className="text-xl font-semibold text-[#212121] dark:text-white">
          {KADESH_URIM_AI_NAME}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
          No hay una empresa vinculada a tu cuenta. Crea o asocia un negocio en
          tu perfil para usar la IA.
        </p>
        <Link
          href={Routes.panelProfile}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          Ir al perfil
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
        </Link>
      </div>
    );
  }

  if (!loading && tab === null) {
    setTab(configured ? "dashboard" : "settings");
  }

  const tabs: { key: AiTab; label: string; icon: typeof SparklesIcon }[] = [
    { key: "dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
    { key: "info", label: "Información", icon: InformationCircleIcon },
    { key: "settings", label: "Configuración", icon: AiSettingIcon },
  ];
  const subtitle =
    tab === "dashboard"
      ? "Hoy y el perfil de tu negocio."
      : tab === "info"
        ? `Edita qué vendes, a quién y cómo cierras. Al guardar, el Dashboard actualiza el resumen de tu negocio.`
        : "Esta modalidad aplica a todo el equipo: los vendedores no ven esta pantalla, pero usarán la IA con lo que guardes aquí.";

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <HugeiconsIcon icon={SparklesIcon} size={22} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-[#212121] dark:text-white">
            {KADESH_URIM_AI_NAME}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
            {tab ? subtitle : "Cargando tu configuración de IA…"}
          </p>
        </div>
      </div>

      <div
        className="flex w-full gap-1 rounded-xl border border-[#e0e0e0] bg-white p-1 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
        role="tablist"
        aria-label={`${KADESH_URIM_AI_NAME} secciones`}
      >
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
              tab === item.key
                ? "bg-orange-500 text-white shadow-sm"
                : "text-[#616161] hover:bg-[#f5f5f5] dark:text-[#9e9e9e] dark:hover:bg-[#2a2a2a]"
            }`}
          >
            <HugeiconsIcon icon={item.icon} size={16} className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>

      {!tab ? (
        <div className="flex items-center justify-center rounded-2xl border border-[#e0e0e0] bg-white py-16 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
          <span className="size-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        </div>
      ) : tab === "dashboard" ? (
        <AiDashboardTab
          companyId={companyId}
          canManageAi={canManageAi}
          isCompanyWide={isCompanyWide}
          onOpenSettings={() => setTab("settings")}
          onOpenCompanyInfo={() => setTab("info")}
        />
      ) : tab === "info" ? (
        <AiCompanyInfoTab
          companyId={companyId}
          onOpenDashboard={() => setTab("dashboard")}
        />
      ) : (
        <AiSettingsSection
          companyId={companyId}
          onOpenCompanyInfo={() => setTab("info")}
        />
      )}
    </div>
  );
}
