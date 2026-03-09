"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  KanbanIcon,
  FileAttachmentIcon,
  Calendar03Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

const FEATURES = [
  {
    icon: KanbanIcon,
    title: "Gestión visual",
    description:
      "Pipeline de ventas con estados: Detectado, Contactado, Interesado. Arrastra y suelta para avanzar cada lead.",
  },
  {
    icon: FileAttachmentIcon,
    title: "Propuestas y cierre",
    description:
      "Control de montos y enlaces a documentos de propuesta. Registra ofertas y cierra tratos desde un solo lugar.",
  },
  {
    icon: Calendar03Icon,
    title: "Calendario de seguimiento",
    description:
      "Vista mensual para que nada se escape. Programa recordatorios y seguimientos por lead.",
  },
  {
    icon: UserMultiple02Icon,
    title: "Equipo y comisiones",
    description:
      "Ideal para agencias: asigna leads a vendedores y calcula comisiones automáticamente.",
  },
];

export default function CRMWorkflowSection() {
  return (
    <section
      id="crm"
      className="py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d]"
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
            CRM integrado a tu flujo
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto">
            Desde el primer lead hasta el cierre: actividades, propuestas, calendario y comisiones.
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
              className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] p-6 hover:border-orange-500/30 dark:hover:border-orange-500/30 transition-colors"
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
