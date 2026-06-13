"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Routes } from "kadesh/core/routes";

const PERSONAS = [
  {
    id: "agencia",
    label: "Agencia",
    title: "Escala la captación de clientes para tus cuentas",
    benefits: [
      "Asigna leads a vendedores y controla comisiones automáticamente",
      "Gestiona múltiples clientes con espacios de trabajo y proyectos",
      "Ofrece prospección B2B como servicio diferenciador",
      "Ahorra semanas de trabajo manual en cada campaña",
    ],
  },
  {
    id: "freelance",
    label: "Freelance",
    title: "Encuentra clientes que necesitan tus servicios",
    benefits: [
      "Listas de negocios reales por zona y categoría en minutos",
      "CRM integrado para seguir cada oportunidad sin Excel",
      "Calendario de seguimientos para no perder ningún contacto",
      "Cotizaciones profesionales listas para enviar",
    ],
  },
  {
    id: "ventas",
    label: "Equipo de ventas",
    title: "Llena tu pipeline sin depender de marketing",
    benefits: [
      "400+ leads nuevos cada mes con tu plan",
      "Pipeline visual: Contactado, En propuesta, Cerrado",
      "Datos con teléfono y rating para priorizar llamadas",
      "Exporta a Excel y comparte con tu equipo",
    ],
  },
  {
    id: "consultor",
    label: "Consultor / Servicios",
    title: "Prospecta negocios locales de forma masiva",
    benefits: [
      "Busca clínicas, restaurantes, abogados o cualquier giro",
      "Filtra por ciudad, estado y oportunidad (rating)",
      "Registra actividades y propuestas por cada lead",
      "Un solo cliente nuevo puede pagar meses de suscripción",
    ],
  },
] as const;

export default function PersonaBenefitsSection() {
  const [activeId, setActiveId] =
    useState<(typeof PERSONAS)[number]["id"]>("agencia");
  const active = PERSONAS.find((p) => p.id === activeId) ?? PERSONAS[0];

  return (
    <section
      id="para-quien"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
            Cuéntanos quién eres y te decimos qué necesitas
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] text-lg">
            KADESH se adapta a agencias, freelancers, equipos de ventas y
            consultores B2B.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PERSONAS.map((persona) => {
            const isActive = activeId === persona.id;
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => setActiveId(persona.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                  isActive
                    ? "bg-orange-500 text-white border-orange-500 shadow-md"
                    : "bg-[#f8f8f8] dark:bg-[#1e1e1e] text-[#374151] dark:text-[#e5e5e5] border-[#e0e0e0] dark:border-[#333] hover:border-orange-400/60"
                }`}
              >
                {persona.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] p-6 sm:p-10"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-[#212121] dark:text-white mb-6">
              {active.title}
            </h3>
            <ul className="space-y-3 mb-8">
              {active.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 text-[#424242] dark:text-[#d4d4d4]"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/15 flex items-center justify-center text-green-600 dark:text-green-400 text-sm font-bold mt-0.5">
                    ✓
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Link
              href={Routes.auth.register}
              className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
            >
              Regístrate gratis
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
