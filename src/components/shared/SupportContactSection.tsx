import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon, Message01Icon } from "@hugeicons/core-free-icons";
import {
  buildSupportMailtoUrl,
  buildSupportWhatsAppUrl,
  DEFAULT_SUPPORT_EMAIL_SUBJECT,
  DEFAULT_SUPPORT_WHATSAPP_MESSAGE,
  KADESH_SUPPORT,
} from "kadesh/constants/support";
import { cn } from "kadesh/utils/cn";

const SUPPORT_TOPICS = [
  "Dudas sobre suscripciones, créditos y planes",
  "Verificar tu plan o facturación",
  "Reportar problemas con el pago",
  "Cualquier otro tema de soporte",
] as const;

export type SupportContactSectionProps = {
  className?: string;
  title?: string;
  description?: string;
  whatsappMessage?: string;
  emailSubject?: string;
};

export default function SupportContactSection({
  className,
  title = "¿Necesitas ayuda?",
  description = "Si tienes dudas sobre tu suscripción, quieres verificar tu plan, reportar un problema o necesitas soporte, contáctanos directamente.",
  whatsappMessage = DEFAULT_SUPPORT_WHATSAPP_MESSAGE,
  emailSubject = DEFAULT_SUPPORT_EMAIL_SUBJECT,
}: SupportContactSectionProps) {
  const whatsappHref = buildSupportWhatsAppUrl(whatsappMessage);
  const mailHref = buildSupportMailtoUrl(emailSubject);

  return (
    <section
      className={cn(
        "rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6 sm:p-8",
        className,
      )}
      aria-labelledby="support-contact-heading"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-4">
          <div>
            <h2
              id="support-contact-heading"
              className="text-lg font-bold text-[#212121] dark:text-[#ffffff]"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
              {description}
            </p>
          </div>
          <ul className="space-y-2">
            {SUPPORT_TOPICS.map((topic) => (
              <li
                key={topic}
                className="flex items-start gap-2 text-sm text-[#616161] dark:text-[#b0b0b0]"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange-500"
                  aria-hidden
                />
                {topic}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:min-w-[280px] lg:flex-col">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1ebe57] focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 dark:focus:ring-offset-[#1e1e1e]"
          >
            <HugeiconsIcon icon={Message01Icon} size={20} aria-hidden />
            WhatsApp
            <span className="sr-only">: {KADESH_SUPPORT.phoneDisplay}</span>
          </a>
          <a
            href={mailHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#e0e0e0] bg-white px-5 py-3 text-sm font-semibold text-[#212121] transition-colors hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a] dark:focus:ring-offset-[#1e1e1e]"
          >
            <HugeiconsIcon icon={Mail01Icon} size={20} aria-hidden />
            {KADESH_SUPPORT.email}
          </a>
        </div>
      </div>

      <p className="mt-5 border-t border-[#f0f0f0] pt-4 text-xs text-[#9e9e9e] dark:border-[#2a2a2a] dark:text-[#6f6f6f]">
        También puedes llamarnos al{" "}
        <a
          href={KADESH_SUPPORT.tel}
          className="font-medium text-[#616161] underline decoration-[#c4c4c4]/80 underline-offset-2 hover:text-orange-500 hover:decoration-orange-500/60 dark:text-[#b0b0b0] dark:decoration-[#525252] dark:hover:text-orange-400"
        >
          {KADESH_SUPPORT.phoneDisplay}
        </a>
        .
      </p>
    </section>
  );
}
