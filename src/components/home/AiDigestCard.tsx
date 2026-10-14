import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon } from "@hugeicons/core-free-icons";
import { KADESH_URIM_AI_NAME } from "kadesh/components/profile/ai/constants";

const DIGEST_EXAMPLE = [
  {
    source: "Cotización sin respuesta",
    title: "Clínica Dental Norte",
    detail: "Enviada hace 5 días. Llama hoy, antes de que se enfríe.",
  },
  {
    source: "Sin primer contacto",
    title: "Taller Martínez",
    detail: "Lead nuevo. Abre con un WhatsApp de dos líneas.",
  },
  {
    source: "Seguimiento vencido",
    title: "Constructora Lima",
    detail: "La propuesta espera desde el lunes.",
  },
] as const;

const KNOWLEDGE = [
  { pillar: "Qué", summary: "Sitios y campañas para negocios locales" },
  { pillar: "Quién", summary: "Clínicas, talleres y constructoras" },
  { pillar: "Cuánto", summary: "Proyectos de 15 a 40 mil MXN" },
  { pillar: "Cómo", summary: "Extraes en Maps y cierras por WhatsApp" },
] as const;

/**
 * Tarjeta «Resumen de hoy» de Kadesh AI: ejemplo sintético, etiquetado como tal.
 * Sin hooks: la usan la sección de Kadesh AI de la home (que anima `.ai-digest-row` y
 * `.ai-knowledge-row` con GSAP) y la página /prueba (estática).
 */
export default function AiDigestCard() {
  return (
    <div className="ai-live-ring rounded-3xl">
      <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_18px_40px_rgba(76,29,149,0.16)] dark:bg-[#141118] dark:shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#ececec] px-4 py-3 dark:border-[#2a2a2a] sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--ai-urim-purple), var(--ai-urim-blue))",
            }}
          >
            <HugeiconsIcon icon={SparklesIcon} size={18} />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-[#212121] dark:text-white">
              Resumen de hoy
            </p>
            <p className="text-xs text-[#9e9e9e] dark:text-[#7a7a7a]">
              Ejemplo · {KADESH_URIM_AI_NAME} en el panel
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full bg-[#f3eefc] px-3 py-1 text-xs font-semibold text-[#6d28d9] dark:bg-[#2a1848] dark:text-[#c4b5fd] sm:inline">
          3 siguientes pasos
        </span>
      </div>

      <div>
        <ol className="divide-y divide-[#ececec] dark:divide-[#2a2a2a]">
          {DIGEST_EXAMPLE.map((item, index) => (
            <li
              key={item.title}
              className="ai-digest-row flex gap-3 px-4 py-4 sm:px-5"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--ai-urim-purple), var(--ai-urim-blue))",
                }}
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#9e9e9e] dark:text-[#7a7a7a]">
                  {item.source}
                </p>
                <p className="text-sm font-semibold text-[#212121] dark:text-white">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm leading-snug text-[#616161] dark:text-[#b0b0b0]">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <aside className="border-t border-[#ececec] bg-[#faf8ff] dark:border-[#2a2a2a] dark:bg-[#1a1624]">
          <p className="px-4 pt-4 text-sm font-semibold text-[#212121] dark:text-white sm:px-5">
            Lo que {KADESH_URIM_AI_NAME} sabe
          </p>
          <ul className="px-4 pb-4 pt-2 sm:px-5">
            {KNOWLEDGE.map((item) => (
              <li
                key={item.pillar}
                className="ai-knowledge-row border-b border-[#ececec] py-2.5 last:border-b-0 dark:border-[#2a2a2a]"
              >
                <p className="text-xs font-semibold text-[#212121] dark:text-white">
                  {item.pillar}
                </p>
                <p className="text-sm leading-snug text-[#616161] dark:text-[#b0b0b0]">
                  {item.summary}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
    </div>
  );
}
