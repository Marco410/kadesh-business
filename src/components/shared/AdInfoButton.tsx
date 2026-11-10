"use client";

import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  HelpCircleIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { buildSupportWhatsAppUrl } from "kadesh/constants/support";

function advertiseMessage() {
  const page = typeof window !== "undefined" ? window.location.href : "";
  return `Hola, me gustaría que mi negocio aparezca como publicidad en el blog de KADESH. ¿Me pueden dar información?${page ? `\nLo vi en: ${page}` : ""}`;
}

/** Botón "?" junto a la etiqueta Publicidad: explica por qué hay anuncios y cómo anunciarse. */
export default function AdInfoButton() {
  // <dialog> nativo con showModal(): Esc, foco, fondo inerte y backdrop los da el navegador.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="¿Por qué ves publicidad?"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#757575] transition-colors hover:bg-[#f5f5f5] hover:text-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 dark:text-[#9e9e9e] dark:hover:bg-white/10"
      >
        <HugeiconsIcon icon={HelpCircleIcon} size={14} strokeWidth={2} />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="ad-info-title"
        // Clic fuera del panel (sobre el backdrop) cierra.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-[#e0e0e0] bg-white p-0 text-left shadow-2xl backdrop:bg-black/50 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
      >
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2
              id="ad-info-title"
              className="text-xl font-black tracking-[-0.02em] text-[#212121] dark:text-white"
            >
              ¿Por qué ves publicidad?
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="-mr-2 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#616161] transition-colors hover:bg-[#f5f5f5] dark:text-[#b0b0b0] dark:hover:bg-white/10"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} strokeWidth={2} />
            </button>
          </div>
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-[#424242] dark:text-[#e0e0e0]">
            <p>
              El blog de KADESH es gratis: guías y consejos para prospectar, organizar y cerrar más
              ventas, sin registrarte.
            </p>
            <p>
              Mostramos pocos anuncios, siempre marcados como &quot;Publicidad&quot; y separados del
              artículo, para ayudar a cubrir parte de lo que cuesta mantenerlo.
            </p>

            <div className="mt-1 rounded-xl bg-[#f5f5f5] p-4 dark:bg-[#121212]">
              <p className="font-bold text-[#212121] dark:text-white">
                ¿Te gustaría que tu negocio aparezca aquí?
              </p>
              <p className="mt-1">
                Si tu producto o servicio le sirve a negocios y equipos de ventas, podemos mostrarlo
                en este espacio.
              </p>
              <a
                href={buildSupportWhatsAppUrl(advertiseMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-[#121212] transition-colors hover:bg-[#1ebe5a]"
              >
                <HugeiconsIcon icon={WhatsappIcon} size={18} strokeWidth={1.75} />
                Envíanos un mensaje
              </a>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
