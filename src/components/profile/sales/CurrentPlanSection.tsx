"use client";

import { formatDateShort } from "kadesh/utils/format-date";
import { useRouter } from "next/navigation";
import { Routes } from "kadesh/core/routes";
import { useSubscription } from "./SubscriptionContext";
import {
  SUBSCRIPTION_STATUS_OPTIONS,
  SUBSCRIPTION_STATUS_CLASSES,
} from "kadesh/constants/constans";

/** Soporte humano: mismo número para llamada o WhatsApp */
const SUPPORT_PHONE = {
  display: "+52 1 443 938 2330",
  tel: "tel:+5214439382330",
  whatsapp: "https://wa.me/5214439382330",
} as const;

function PlanMetric({
  label,
  value,
  valueClassName = "text-[#212121] dark:text-[#ffffff]",
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-base font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}

const supportLinkClass =
  "underline decoration-[#c4c4c4]/80 underline-offset-2 hover:decoration-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40 focus-visible:rounded-sm dark:decoration-[#525252] dark:hover:decoration-[#757575]";

function SupportHelpFooter({ className }: { className?: string }) {
  return (
    <p
      className={`text-[11px] leading-relaxed text-[#9e9e9e] dark:text-[#6f6f6f] ${className ?? ""}`}
    >
      ¿Necesitas ayuda con tu plan, facturación o el uso de la plataforma?{" "}
      <a
        href={SUPPORT_PHONE.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={supportLinkClass}
      >
        WhatsApp
      </a>
    </p>
  );
}

export default function CurrentPlanSection() {
  const router = useRouter();
  const { subscription, loading, message, daysUntilNextBilling } = useSubscription();

  if (loading) {
    return (
      <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 shadow-sm">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0] text-center">
          Cargando suscripción...
        </p>
      </div>
    );
  }

  if (subscription == null) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 shadow-sm text-center gap-2">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0] text-center">
          {message ?? "No hay suscripción asignada a tu empresa."}
        </p>
        <button
          type="button"
          onClick={() => router.push(Routes.panelPlans)}
          className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-orange-500 text-white dark:bg-orange-500 hover:bg-orange-600 dark:hover:bg-orange-600"
        >
          Ver planes
        </button>
        <SupportHelpFooter className="w-full max-w-md pt-3 mt-1 text-center sm:text-left" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-400" aria-hidden />
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-row gap-10 items-center justify-between  ">
            <div className="flex flex-col">
              <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0] uppercase tracking-wide mb-1">
                Plan actual
              </p>
              <h3 className="text-xl font-bold text-[#212121] dark:text-[#ffffff]">
                {subscription.planName}
              </h3>
            </div>
            <PlanMetric
              label="Límite de leads / mes"
              value={subscription.planLeadLimit}
            />
            <PlanMetric
              label="Inicio de suscripción"
              value={formatDateShort(subscription.activatedAt ?? undefined, false)}
            />
            <PlanMetric
              label="Fin de periodo"
              value={formatDateShort(subscription.currentPeriodEnd ?? undefined, false)}
            />
            <PlanMetric
              label="Días restantes"
              value={daysUntilNextBilling}
            />
            <button
              type="button"
              onClick={() => router.push(Routes.panelPlans)}
              className="inline-flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-orange-500 text-white dark:bg-orange-500 hover:bg-orange-600 dark:hover:bg-orange-600"
            >
              Ver planes
            </button>
          </div>
          <span
            className={`text-center inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-sm font-medium ${
              SUBSCRIPTION_STATUS_CLASSES[subscription.status ?? ""] ??
              "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]"
            }`}
          >
            {SUBSCRIPTION_STATUS_OPTIONS.find((o) => o.value === subscription.status)
              ?.label ?? "Inactivo"}
          </span>
        </div>
        <SupportHelpFooter className="mt-4 pt-3 border-t border-[#f5f5f5] dark:border-white/[0.06]" />
      </div>
    </div>
  );
}
