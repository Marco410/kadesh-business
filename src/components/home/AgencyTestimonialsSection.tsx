"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building02Icon,
  Briefcase01Icon,
  StethoscopeIcon,
  Home02Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";

const TESTIMONIALS = [
  {
    category: "Kadesh Tech",
    icon: Home02Icon,
    quote:
      "Es impresionante como podemos asignar 80 leads diariamente a los vendedores y seguir el funnel de ventas sin perder nada.",
    timeSaved: "~10 días ahorrados por semana",
  },
  {
    category: "Juarez & Abogados",
    icon: Briefcase01Icon,
    quote:
      "Prospectar notarías y empresas para servicios corporativos nos tomaba una semana. Con KADESH redujimos eso a unas horas.",
    timeSaved: "~1 semana → pocas horas",
  },
  {
    category: "Smile Care Algarin",
    icon: StethoscopeIcon,
    quote:
      "Buscábamos consultorios y clínicas para alianzas. El CRM nos permitió seguir todo el funnel sin perder nada.",
    timeSaved: "50 % menos tiempo en prospección",
  },
  {
    category: "Lic. Ivan Jiménez",
    icon: Building02Icon,
    quote:
      "Listas de desarrolladores, arquitectos y proveedores por zona en minutos. El ahorro de tiempo nos permite enfocarnos en cerrar tratos.",
    timeSaved: "~3 horas diarias ahorradas",
  },
  {
    category: "Alejandra Garcia",
    icon: User02Icon,
    quote:
      "Había probado CRM y bases de datos con contactos incompletos. Con KADESH encontré negocios reales, activos y listos para contactar, así que ahora me enfoco en conversar y cerrar ventas.",
    timeSaved: "más de 35 horas ahorradas por semana",
  },
];

export default function AgencyTestimonialsSection() {
  return (
    <section
      id="testimonios"
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
            Lo que dicen las agencias
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] max-w-2xl mx-auto">
            Equipos de ventas B2B que ya usan KADESH para prospectar por categoría y ahorrar tiempo.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((item, index) => (
            <motion.article
              key={item.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-white dark:bg-[#121212] p-6 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={item.icon}
                    size={24}
                    className="text-orange-500 dark:text-orange-400"
                  />
                </span>
                <span className="font-semibold text-[#212121] dark:text-white">
                  {item.category}
                </span>
              </div>
              <p className="text-[#616161] dark:text-[#b0b0b0] text-sm leading-relaxed flex-1 mb-4">
                &ldquo;{item.quote}&rdquo;
              </p>
              <p className="text-xs font-medium text-[#616161] dark:text-[#b0b0b0]">
                Tiempo ahorrado:
              </p>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {item.timeSaved}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
