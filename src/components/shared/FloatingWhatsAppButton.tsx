import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon } from "@hugeicons/core-free-icons";
import { buildSupportWhatsAppUrl } from "kadesh/constants/support";
import { cn } from "kadesh/utils/cn";

const LANDING_WHATSAPP_MESSAGE =
  "Hola KADESH, tengo una duda sobre la plataforma y me gustaría recibir ayuda.";

export type FloatingWhatsAppButtonProps = {
  className?: string;
  message?: string;
};

export default function FloatingWhatsAppButton({
  className,
  message = LANDING_WHATSAPP_MESSAGE,
}: FloatingWhatsAppButtonProps) {
  const href = buildSupportWhatsAppUrl(message);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp si tienes dudas"
      className={cn(
        "group fixed bottom-5 right-5 z-50 flex items-center sm:bottom-6 sm:right-6",
        className,
      )}
    >
      <span
        className="pointer-events-none absolute right-full mr-3 hidden rounded-full bg-[#212121] px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:block dark:bg-white dark:text-[#212121]"
        aria-hidden
      >
        ¿Dudas?
      </span>

      <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_14px_rgba(37,211,102,0.45)] ring-1 ring-white/20 transition-colors duration-200 group-hover:bg-[#1ebe57] group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-[#25D366] group-focus-visible:ring-offset-2 dark:group-focus-visible:ring-offset-[#0d0d0d]">
        <HugeiconsIcon icon={Message01Icon} size={26} className="shrink-0" aria-hidden />
      </span>
    </a>
  );
}
