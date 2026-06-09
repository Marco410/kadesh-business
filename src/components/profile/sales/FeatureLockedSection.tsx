"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { useSubscription } from "./SubscriptionContext";

interface FeatureLockedSectionProps {
  sectionName: string;
}

const SECTION_COPY: Record<
  string,
  { headline: string; description: string; benefits: string[] }
> = {
  Vendedores: {
    headline: "Escala tu equipo de ventas",
    description:
      "Invita vendedores, asigna leads y mide el desempeño de cada persona desde un solo lugar.",
    benefits: [
      "Gestión de vendedores y permisos",
      "Asignación de leads por cartera",
      "Visibilidad del pipeline por persona",
    ],
  },
  Archivos: {
    headline: "Centraliza la documentación de tus clientes",
    description:
      "Guarda contratos, propuestas y archivos clave vinculados a cada lead sin salir de Kadesh.",
    benefits: [
      "Almacenamiento organizado por cliente",
      "Acceso rápido desde el detalle del lead",
      "Menos fricción en el seguimiento comercial",
    ],
  },
  Proyectos: {
    headline: "Organiza oportunidades por proyecto",
    description:
      "Agrupa leads y actividades cuando manejas varias iniciativas o cuentas a la vez.",
    benefits: [
      "Vista por proyecto o cartera",
      "Mejor seguimiento de oportunidades grandes",
      "Más orden en equipos con alto volumen",
    ],
  },
  Cotizaciones: {
    headline: "Cierra más rápido con cotizaciones profesionales",
    description:
      "Genera y envía propuestas comerciales sin depender de hojas de cálculo ni herramientas externas.",
    benefits: [
      "Cotizaciones vinculadas al CRM",
      "Historial por cliente y lead",
      "Imagen más profesional ante tu prospecto",
    ],
  },
  Calendario: {
    headline: "No pierdas ningún seguimiento",
    description:
      "Visualiza llamadas, reuniones y tareas de tu equipo en un calendario integrado al CRM.",
    benefits: [
      "Actividades y recordatorios en un solo lugar",
      "Coordinación entre vendedores",
      "Menos leads olvidados en el embudo",
    ],
  },
  "Espacios de trabajo": {
    headline: "Separa equipos sin mezclar carteras",
    description:
      "Crea espacios independientes para distintas líneas de negocio, sucursales o unidades comerciales.",
    benefits: [
      "Datos aislados por espacio de trabajo",
      "Miembros y permisos por equipo",
      "Ideal para agencias y empresas multi-marca",
    ],
  },
  "Agregar cliente": {
    headline: "Captura más oportunidades en tu CRM",
    description:
      "Registra leads manualmente y mantén tu pipeline actualizado cuando no vienen de extracción B2B.",
    benefits: [
      "Alta rápida de prospectos",
      "Seguimiento completo desde el primer contacto",
      "Todo conectado a tu flujo de ventas",
    ],
  },
  "Panel Admin": {
    headline: "Herramientas exclusivas para administradores",
    description:
      "Esta sección está reservada para usuarios con permisos de administración de la plataforma.",
    benefits: [
      "Visibilidad avanzada de suscripciones",
      "Soporte a operaciones internas",
      "Acceso restringido por rol",
    ],
  },
};

const DEFAULT_COPY = {
  headline: "Desbloquea más potencial en Kadesh",
  description:
    "Tu plan actual no incluye esta función. Actualiza y accede a herramientas pensadas para vender más con menos esfuerzo.",
  benefits: [
    "Más funciones en un solo CRM",
    "Planes flexibles en pesos mexicanos",
    "Escala cuando tu negocio lo necesite",
  ],
};

function getSectionCopy(sectionName: string) {
  return SECTION_COPY[sectionName] ?? DEFAULT_COPY;
}

export default function FeatureLockedSection({
  sectionName,
}: FeatureLockedSectionProps) {
  const { subscription } = useSubscription();
  const copy = getSectionCopy(sectionName);
  const planName = subscription?.planName?.trim();

  return (
    <div className="overflow-hidden rounded-2xl border border-orange-500/25 bg-white shadow-sm dark:border-orange-500/30 dark:bg-[#1e1e1e]">
      <div
        className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500"
        aria-hidden
      />

      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span
              className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
              aria-hidden
            >
              <HugeiconsIcon icon={SparklesIcon} size={24} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                Función premium
              </p>
              <h3 className="mt-1 text-xl font-bold text-[#212121] dark:text-white">
                {copy.headline}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                {copy.description}
              </p>
            </div>
          </div>

          {planName && (
            <div className="shrink-0 rounded-xl border border-[#e0e0e0] bg-[#f8f8f8] px-4 py-3 dark:border-[#3a3a3a] dark:bg-[#252525]">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                Tu plan actual
              </p>
              <p className="mt-0.5 text-sm font-bold text-[#212121] dark:text-white">
                {planName}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 dark:border-[#3a3a3a] dark:bg-[#252525]">
          <p className="mb-3 text-sm font-semibold text-[#212121] dark:text-white">
            Con un plan superior tendrás acceso a {sectionName}:
          </p>
          <ul className="space-y-2.5">
            {copy.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  size={18}
                  className="mt-0.5 shrink-0 text-orange-600 dark:text-orange-400"
                  aria-hidden
                />
                <span className="text-[#616161] dark:text-[#b0b0b0]">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={Routes.panelPlans}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-colors hover:bg-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e]"
          >
            Ver planes y actualizar
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </Link>
          <Link
            href={Routes.precios}
            className="inline-flex items-center justify-center rounded-xl border border-[#e0e0e0] px-5 py-3 text-sm font-semibold text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
          >
            Comparar funciones
          </Link>
        </div>

        <p className="mt-4 text-xs text-[#9e9e9e] dark:text-[#6f6f6f]">
          Sin compromisos ocultos. Elige el plan que mejor se adapte a tu
          volumen de prospección y actualiza cuando quieras.
        </p>
      </div>
    </div>
  );
}
