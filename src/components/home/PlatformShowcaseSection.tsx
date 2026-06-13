"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  UserMultiple02Icon,
  Calendar03Icon,
  FileAttachmentIcon,
  KanbanIcon,
  Folder01Icon,
  Invoice01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons";
import { LANDING_SECTION_IMAGES } from "kadesh/components/home/constants";

const FEATURES = [
  {
    id: "geo",
    icon: Location01Icon,
    title: "Extracción GEO",
    headline: "Encuentra negocios en el mapa por categoría y radio",
    description:
      "Elige ciudad, giro y radio de búsqueda. KADESH extrae prospectos reales de Google Maps en segundos y los guarda en tu CRM.",
    image: LANDING_SECTION_IMAGES.geoSearch,
    imageAlt: "Búsqueda geográfica de negocios por categoría en mapa de México",
  },
  {
    id: "crm",
    icon: KanbanIcon,
    title: "CRM de clientes",
    headline: "Gestiona miles de leads con pipeline visual",
    description:
      "Filtra por ciudad, categoría, estado del pipeline y vendedor. Asigna leads, exporta a Excel y nunca pierdas una oportunidad.",
    image: LANDING_SECTION_IMAGES.crmClients,
    imageAlt: "Tabla de clientes con filtros, pipeline y asignación de vendedores",
  },
  {
    id: "sellers",
    icon: UserMultiple02Icon,
    title: "Vendedores",
    headline: "Controla tu equipo de ventas y sus comisiones",
    description:
      "Agrega vendedores, asigna leads automáticamente y mide rendimiento: leads asignados, propuestas, seguimientos y comisiones.",
    image: LANDING_SECTION_IMAGES.sellers,
    imageAlt: "Panel de vendedores con métricas de rendimiento y comisiones",
  },
  {
    id: "calendar",
    icon: Calendar03Icon,
    title: "Calendario",
    headline: "Calendario de actividades, propuestas y seguimientos",
    description:
      "Vista mensual con código de colores. Programa llamadas, reuniones y recordatorios para que nada se escape del funnel.",
    image: LANDING_SECTION_IMAGES.calendar,
    imageAlt: "Calendario de vendedores con actividades, propuestas y seguimientos",
  },
  {
    id: "projects",
    icon: FileAttachmentIcon,
    title: "Proyectos",
    headline: "Gestiona proyectos vinculados a cada cliente",
    description:
      "Crea campañas, desarrollos o servicios por lead. Controla estados, responsables y fechas desde un panel centralizado.",
    image: LANDING_SECTION_IMAGES.projects,
    imageAlt: "Gestión de proyectos vinculados a clientes con estados y fechas",
  },
  {
    id: "quotes",
    icon: Invoice01Icon,
    title: "Cotizaciones",
    headline: "Genera cotizaciones profesionales en PDF",
    description:
      "Crea, envía y da seguimiento a cotizaciones con folio, IVA, descuentos y firmas. Comparte un enlace directo con tu cliente para que la vea en el navegador, sin descargar nada. Todo integrado al CRM sin herramientas externas.",
    image: LANDING_SECTION_IMAGES.quotes,
    imageAlt: "Sistema de cotizaciones con vista previa PDF y tabla de estados",
  },
  {
    id: "files",
    icon: Folder01Icon,
    title: "Archivos",
    headline: "Comparte scripts y procesos con tu equipo",
    description:
      "Sube PDFs, documentos e imágenes. Organiza speech de venta, procesos de cierre y material de capacitación para todo el equipo.",
    image: LANDING_SECTION_IMAGES.files,
    imageAlt: "Compartir archivos y documentos de venta con el equipo",
  },
  {
    id: "workspaces",
    icon: KanbanIcon,
    title: "Espacios de trabajo",
    headline: "Tableros Kanban por equipo o cliente",
    description:
      "Organiza tareas, actividades y propuestas en columnas Por hacer, En progreso y Completado. Ideal para agencias con varios clientes.",
    image: LANDING_SECTION_IMAGES.workspaces,
    imageAlt: "Espacios de trabajo con tablero Kanban para tareas y seguimientos",
  },
  {
    id: "referrals",
    icon: Share01Icon,
    title: "Referidos",
    headline: "Gana comisiones recomendando KADESH",
    description:
      "Comparte tu enlace, rastrea conversiones y recibe pagos recurrentes por cada negocio que se suscriba con tu código.",
    image: LANDING_SECTION_IMAGES.referrals,
    imageAlt: "Programa de referidos con enlace, código y comisiones",
  },
] as const;

export default function PlatformShowcaseSection() {
  const [activeId, setActiveId] = useState<(typeof FEATURES)[number]["id"]>("geo");
  const active = FEATURES.find((f) => f.id === activeId) ?? FEATURES[0];

  return (
    <section
      id="plataforma"
      className="py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400 mb-3">
            Todo en un solo sistema
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
            Más que extracción: tu operación comercial completa
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto text-lg">
            Desde encontrar el lead hasta cerrar la venta y cobrar comisiones.
            Sin pagar 5 herramientas distintas.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FEATURES.map((feature) => {
            const isActive = activeId === feature.id;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => setActiveId(feature.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                    : "bg-white dark:bg-[#1a1a1a] text-[#374151] dark:text-[#e5e5e5] border-[#e0e0e0] dark:border-[#333] hover:border-orange-400/60"
                }`}
              >
                <HugeiconsIcon icon={feature.icon} size={16} />
                {feature.title}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id + "-copy"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-white mb-4">
                {active.headline}
              </h3>
              <p className="text-[#616161] dark:text-[#b0b0b0] text-lg leading-relaxed">
                {active.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id + "-img"}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="absolute -inset-3 rounded-3xl bg-orange-500/8 blur-xl" />
              <div className="relative rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] overflow-hidden shadow-2xl bg-white dark:bg-[#1a1a1a]">
                <Image
                  src={active.image}
                  alt={active.imageAlt}
                  width={1200}
                  height={750}
                  className="w-full h-auto"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={active.id === "geo"}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
