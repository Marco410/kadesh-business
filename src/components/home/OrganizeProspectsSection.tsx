"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  KanbanIcon,
  MessageEditIcon,
  Task01Icon,
} from "@hugeicons/core-free-icons";

const FEATURES = [
  {
    icon: UserIcon,
    title: "Filtrar por vendedor",
    description: "Asigna y filtra leads por miembro del equipo.",
  },
  {
    icon: KanbanIcon,
    title: "Filtrar por status del pipeline",
    description: "Detectado, Contactado, Interesado y más.",
  },
  {
    icon: MessageEditIcon,
    title: "Registrar actividades de venta",
    description: "Llamadas, reuniones y notas en cada lead.",
  },
  {
    icon: Task01Icon,
    title: "Crear tareas de seguimiento",
    description: "Recordatorios y próximos pasos por prospecto.",
  },
];

export default function OrganizeProspectsSection() {
  return (
    <section
      id="organiza-prospectos"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
            Organiza tus prospectos fácilmente
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto text-lg">
            El CRM integrado te permite gestionar tus leads y ventas sin usar
            herramientas externas.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] p-6 hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-colors"
            >
              <span className="inline-flex w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 items-center justify-center mb-4">
                <HugeiconsIcon
                  icon={feature.icon}
                  size={24}
                  className="text-orange-500 dark:text-orange-400"
                />
              </span>
              <h3 className="font-bold text-[#212121] dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0] leading-relaxed">
                {feature.description}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
