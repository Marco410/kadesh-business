import Link from "next/link";
import { Routes } from "kadesh/core/routes";

const STEPS = [
  {
    title: "Elige un punto en el mapa",
    detail: "Marcas la ciudad o zona donde quieres prospectar negocios.",
  },
  {
    title: "Selecciona la categoría",
    detail: "Dentistas, abogados, restaurantes u otro giro listado en Google Maps.",
  },
  {
    title: "Define el radio",
    detail: "Acotas la búsqueda al área que tu equipo puede contactar.",
  },
  {
    title: "Guarda los leads en el CRM",
    detail: "Teléfono, dirección, categoría y rating quedan listos para seguimiento.",
  },
] as const;

export default function WhatIsKadeshSection() {
  return (
    <section
      id="que-es-kadesh"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212] scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#212121] dark:text-white mb-3 tracking-tight">
          ¿Qué es Kadesh?
        </h2>
        <p className="text-sm text-[#757575] dark:text-[#9e9e9e] mb-5">
          <time dateTime="2026-09-10">Actualizado el 10 de septiembre de 2026</time>
        </p>
        <p className="text-lg text-[#424242] dark:text-[#d6d6d6] leading-relaxed max-w-3xl mb-4">
          Kadesh es una plataforma SaaS B2B que extrae clientes potenciales
          reales de Google Maps —con teléfono, dirección, categoría y rating—
          y los guarda en un CRM integrado. Eliges un punto en el mapa, una
          categoría y un radio; en minutos tienes negocios listos para
          contactar, con prueba de 7 días y 50 leads gratis.
        </p>
        <p className="text-[#616161] dark:text-[#b0b0b0] leading-relaxed max-w-3xl mb-12">
          Sirve a agencias, freelancers, equipos de ventas y consultores en
          México que necesitan listas de prospectos B2B sin comprar anuncios
          caros ni armar bases de datos a mano. El plan Starter parte de 399
          MXN al mes; Pro, de 799 MXN; Agencia, de 1,999 MXN.
        </p>

        <h3 className="text-2xl font-bold text-[#212121] dark:text-white mb-3">
          ¿Cómo extraer leads de Google Maps con Kadesh?
        </h3>
        <p className="text-[#424242] dark:text-[#d6d6d6] leading-relaxed max-w-3xl mb-8">
          Creas tu cuenta, eliges un punto en el mapa, seleccionas la categoría
          del negocio y defines el radio. Kadesh extrae en tiempo real nombre,
          teléfono, dirección y valoración, y deja los prospectos en el CRM
          para llamar, dar seguimiento y cotizar.
        </p>

        <ol className="grid sm:grid-cols-2 gap-4 mb-10">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl bg-[#f8f8f8] dark:bg-[#1e1e1e] border border-[#e8e8e8] dark:border-[#2a2a2a] p-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white text-sm font-bold shadow-[0_8px_18px_rgba(231,124,58,0.35)]">
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-[#212121] dark:text-white mb-1">
                  {step.title}
                </p>
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] leading-relaxed">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <Link
          href={Routes.auth.register}
          className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white hover:text-white font-semibold rounded-xl shadow-[0_10px_24px_rgba(231,124,58,0.28)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#121212] transition-all duration-150"
        >
          Empezar con 50 leads gratis
        </Link>
      </div>
    </section>
  );
}
