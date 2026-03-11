"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

const FAQ_ITEMS = [
  {
    question: "¿De dónde vienen los datos?",
    answer:
      "Los datos se obtienen desde Google Maps en tiempo real: nombres del negocio, teléfonos, dirección, categoría y valoración. Solo eliges un punto en el mapa, la categoría (ej. abogados, dentistas) y el radio; KADESH extrae los leads y los deja listos en tu CRM.",
  },
  {
    question: "¿Es legal?",
    answer:
      "Sí. Utilizamos información pública que Google Maps muestra a cualquier usuario. La plataforma está diseñada para prospección comercial legítima (B2B) y gestión de ventas.",
  },
  {
    question: "¿Puedo exportar a Excel?",
    answer:
      "No. Por el momento no contamos con la funcionalidad de exportar a Excel. Sin embargo, estamos trabajando en una solución para ello.",
  },
  {
    question: "¿Qué tipo de negocios puedo encontrar?",
    answer:
      "Prácticamente cualquier negocio listado en Google Maps: dentistas, abogados, restaurantes, agencias, tiendas, consultores y más. Solo seleccionas la categoría y el sistema encuentra negocios dentro del radio que elijas.",
  },
  {
    question: "¿En qué países funciona?",
    answer:
      "La plataforma funciona en cualquier país donde Google Maps tenga información de negocios. Puedes buscar leads en tu ciudad o en cualquier parte del mundo.",
  },
  {
    question: "¿Necesito conocimientos técnicos para usar la plataforma?",
    answer:
      "No. El sistema está diseñado para ser muy sencillo: eliges un punto en el mapa, seleccionas una categoría y defines el radio de búsqueda. En segundos tendrás una lista de prospectos lista para gestionar.",
  },
  {
    question: "¿Los leads se guardan automáticamente?",
    answer:
      "Sí. Todos los negocios encontrados se pueden guardar automáticamente en tu CRM dentro de la plataforma, donde podrás registrar actividades, tareas de seguimiento, propuestas y avances de ventas.",
  },
  {
    question: "¿Puedo asignar leads a vendedores?",
    answer:
      "Sí. Puedes asignar prospectos a miembros de tu equipo, registrar actividades comerciales y llevar seguimiento de oportunidades dentro del CRM integrado pero solo con el plan 'Agencia'.",
  },
  {
    question: "¿Qué pasa cuando alcanzo el límite de leads de mi plan?",
    answer:
      "Cuando llegas al límite mensual de tu plan puedes esperar al siguiente ciclo de facturación (siguiente mes) o actualizar a un plan superior para obtener más capacidad de búsqueda.",
  },
  {
    question: "¿Puedo cancelar mi suscripción en cualquier momento?",
    answer:
      "Sí. Puedes cancelar tu suscripción en cualquier momento contactando a soporte. No hay contratos largos ni penalizaciones.",
  },
  {
    question: "¿Cuánto tiempo toma empezar?",
    answer:
      "Menos de un minuto. Creas tu cuenta, eliges una categoría, defines un radio en el mapa y el sistema comienza a generar prospectos automáticamente.",
  },
  {
    question: "¿Para quién es esta plataforma?",
    answer:
      "Está diseñada para agencias de marketing, freelancers, equipos de ventas, consultores y cualquier negocio que necesite encontrar nuevos clientes potenciales de forma rápida.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212] scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0]">
            Resolvemos las dudas más comunes de vendedores y agencias.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          {FAQ_ITEMS.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl border border-[#e0e0e0] dark:border-[#2a2a2a] bg-[#f8f8f8] dark:bg-[#1e1e1e] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-[#212121] dark:text-white hover:bg-[#f0f0f0] dark:hover:bg-[#252525] transition-colors"
                aria-expanded={openIndex === index}
              >
                <span>{item.question}</span>
                <span
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500/10 dark:bg-orange-500/20 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={18}
                    className="text-orange-500 dark:text-orange-400"
                  />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 pt-0 text-[#616161] dark:text-[#b0b0b0] text-sm sm:text-base leading-relaxed border-t border-[#e0e0e0] dark:border-[#2a2a2a]">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
