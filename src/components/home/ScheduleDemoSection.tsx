"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, Message01Icon } from "@hugeicons/core-free-icons";

const WHATSAPP_E164 = "5214439382330";

const WEEKDAYS = [
  { key: "mon", label: "Lunes", fullLabel: "lunes" },
  { key: "tue", label: "Martes", fullLabel: "martes" },
  { key: "wed", label: "Miércoles", fullLabel: "miércoles" },
  { key: "thu", label: "Jueves", fullLabel: "jueves" },
  { key: "fri", label: "Viernes", fullLabel: "viernes" },
] as const;

const TIME_SLOTS = [
  { id: "09:00", label: "9:00 a. m." },
  { id: "09:30", label: "9:30 a. m." },
  { id: "11:30", label: "11:30 a. m." },
  { id: "12:00", label: "12:00 p. m." },
  { id: "15:30", label: "3:30 p. m." },
  { id: "16:00", label: "4:00 p. m." },
  { id: "16:30", label: "4:30 p. m." },
] as const;

function buildWhatsAppUrl(dayFull: string, timeLabel: string) {
  const message = `Hola KADESH!

Quiero agendar una demo de 15 minutos para ver en vivo cómo extraen prospectos reales para mi negocio.

Día preferido: ${dayFull}
Horario: ${timeLabel}

Me gustaría que en la sesión me muestren alrededor de 20 prospectos reales en vivo.

¡Gracias!`;

  const params = new URLSearchParams();
  params.set("text", message);
  return `https://wa.me/${WHATSAPP_E164}?${params.toString()}`;
}

export default function ScheduleDemoSection() {
  const [dayKey, setDayKey] = useState<(typeof WEEKDAYS)[number]["key"] | null>(null);
  const [timeId, setTimeId] = useState<(typeof TIME_SLOTS)[number]["id"] | null>(null);

  const selectedDay = useMemo(
    () => WEEKDAYS.find((d) => d.key === dayKey) ?? null,
    [dayKey]
  );
  const selectedTime = useMemo(
    () => TIME_SLOTS.find((t) => t.id === timeId) ?? null,
    [timeId]
  );

  const canSend = Boolean(selectedDay && selectedTime);
  const waHref =
    selectedDay && selectedTime
      ? buildWhatsAppUrl(selectedDay.fullLabel, selectedTime.label)
      : "";

  return (
    <section
      id="agendar-demo"
      className="py-16 sm:py-24 bg-white dark:bg-[#0d0d0d] scroll-mt-20 border-t border-[#e5e5e5] dark:border-[#2a2a2a]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/15 dark:bg-orange-500/20 mb-4">
            <HugeiconsIcon icon={Calendar03Icon} size={28} className="text-orange-600 dark:text-orange-400" />
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#212121] dark:text-white mb-3">
            Agenda una demo en vivo (15 min)
          </h2>
          <p className="text-[#616161] dark:text-[#b0b0b0] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            En una sesión corta te mostramos cómo extraer en vivo{" "}
            <span className="text-[#212121] dark:text-white font-semibold">unos 20 prospectos reales</span>{" "}
            para tu negocio desde el mapa. Elige día y horario; te llevamos a WhatsApp con el mensaje listo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-[#fafafa] dark:bg-[#141414] p-6 sm:p-8 shadow-sm"
        >
          <p className="text-sm font-medium text-[#374151] dark:text-[#e5e5e5] mb-3">
            Día (lunes — viernes)
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {WEEKDAYS.map((d) => {
              const isActive = dayKey === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setDayKey(d.key)}
                  className={`min-w-[3.25rem] px-3.5 py-2 rounded-full text-sm font-semibold transition-all border ${
                    isActive
                      ? "bg-orange-500 text-white border-orange-500 shadow-md"
                      : "bg-white dark:bg-[#1a1a1a] text-[#374151] dark:text-[#e5e5e5] border-[#e0e0e0] dark:border-[#333] hover:border-orange-400/60 dark:hover:border-orange-500/50"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          <p className="text-sm font-medium text-[#374151] dark:text-[#e5e5e5] mb-3">
            Horario
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {TIME_SLOTS.map((slot) => {
              const isActive = timeId === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setTimeId(slot.id)}
                  className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all border ${
                    isActive
                      ? "bg-orange-500 text-white border-orange-500 shadow-md"
                      : "bg-white dark:bg-[#1a1a1a] text-[#374151] dark:text-[#e5e5e5] border-[#e0e0e0] dark:border-[#333] hover:border-orange-400/60 dark:hover:border-orange-500/50"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>

          {!canSend && (
            <p className="text-xs text-[#616161] dark:text-[#909090] mb-4 text-center sm:text-left">
              Selecciona un día y una hora para continuar.
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
            {selectedDay && selectedTime ? (
              <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                <span className="font-medium text-[#212121] dark:text-white">Tu elección:</span>{" "}
                {selectedDay.fullLabel}, {selectedTime.label}
              </p>
            ) : (
              <span />
            )}
            {canSend ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base transition-all bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141414]"
              >
                <HugeiconsIcon icon={Message01Icon} size={22} />
                Agendar demo
              </a>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base bg-[#e5e5e5] dark:bg-[#2a2a2a] text-[#9ca3af] cursor-not-allowed select-none">
                <HugeiconsIcon icon={Message01Icon} size={22} />
                Agendar demo
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
