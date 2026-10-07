"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import ConfirmModal from "kadesh/components/shared/ConfirmModal";
import { cn } from "kadesh/utils/cn";
import { adminErrorText } from "./errors";
import {
  EMAIL_BRAND_PREVIEW,
  EMAIL_TEXT_PREVIEW,
  formatCalloutPreview,
  formatEmailBodyPreview,
  type EmailBrandId,
} from "./email-brands";
import {
  SEND_ADMIN_BROADCAST_EMAIL_MUTATION,
  type AdminEmailAudience,
  type SendAdminBroadcastEmailInput,
  type SendAdminBroadcastEmailResponse,
} from "./email-queries";
import { surfaceClass } from "./ui";

const fieldClass =
  "h-11 w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

const textareaClass =
  "w-full rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] px-3 py-2.5 text-sm text-[#212121] dark:text-white placeholder:text-[#9e9e9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

const labelClass =
  "block text-xs font-medium text-[#616161] dark:text-[#b0b0b0] mb-1";

const AUDIENCE_OPTIONS: Array<{
  id: AdminEmailAudience;
  label: string;
  description: string;
}> = [
  {
    id: "saas",
    label: "Negocios (SaaS)",
    description: "Usuarios con empresa",
  },
  {
    id: "pet",
    label: "Pet",
    description: "Usuarios sin empresa",
  },
  {
    id: "all",
    label: "Todos",
    description: "SaaS y Pet",
  },
  {
    id: "custom",
    label: "Específicos",
    description: "Correos que indiques",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmails(raw: string): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const part of raw.split(/[\s,;]+/)) {
    const email = part.trim();
    if (!email) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    emails.push(email);
  }
  return emails;
}

function defaultBrandForAudience(audience: AdminEmailAudience): EmailBrandId {
  if (audience === "pet") return "pet";
  return "saas";
}

export default function AdminEmailsPanel() {
  const [audience, setAudience] = useState<AdminEmailAudience>("saas");
  const [brand, setBrand] = useState<EmailBrandId>("saas");
  const [emailsRaw, setEmailsRaw] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [eyebrow, setEyebrow] = useState("");
  const [preheader, setPreheader] = useState("");
  const [body, setBody] = useState("");
  const [callout, setCallout] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [footerNote, setFooterNote] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [busy, setBusy] = useState<"count" | "send" | null>(null);

  const [sendMutation] = useMutation<SendAdminBroadcastEmailResponse>(
    SEND_ADMIN_BROADCAST_EMAIL_MUTATION,
  );

  const customEmails = useMemo(() => parseEmails(emailsRaw), [emailsRaw]);
  const invalidCustom = customEmails.filter((email) => !EMAIL_PATTERN.test(email));

  const brandMeta = EMAIL_BRAND_PREVIEW[brand];

  const canCompose =
    subject.trim() !== "" &&
    title.trim() !== "" &&
    body.trim() !== "" &&
    (audience !== "custom" ||
      (customEmails.length > 0 && invalidCustom.length === 0)) &&
    ((!ctaLabel.trim() && !ctaUrl.trim()) ||
      (Boolean(ctaLabel.trim()) &&
        Boolean(ctaUrl.trim()) &&
        /^https?:\/\//i.test(ctaUrl.trim())));

  function buildInput(dryRun: boolean): SendAdminBroadcastEmailInput {
    return {
      audience,
      brand,
      emails: audience === "custom" ? customEmails : null,
      subject: subject.trim(),
      title: title.trim(),
      eyebrow: eyebrow.trim() || null,
      preheader: preheader.trim() || null,
      body: body.trim(),
      callout: callout.trim() || null,
      ctaLabel: ctaLabel.trim() || null,
      ctaUrl: ctaUrl.trim() || null,
      footerNote: footerNote.trim() || null,
      dryRun,
    };
  }

  async function countRecipients() {
    if (!canCompose) return;
    setBusy("count");
    try {
      const { data } = await sendMutation({
        variables: { input: buildInput(true) },
      });
      const result = data?.sendAdminBroadcastEmail;
      if (!result?.success) {
        sileo.error({ title: result?.message || "No se pudo contar destinatarios." });
        return;
      }
      setPendingCount(result.recipientCount);
      setConfirmOpen(true);
    } catch (err) {
      sileo.error({
        title: adminErrorText(err, "No se pudo contar destinatarios."),
      });
    } finally {
      setBusy(null);
    }
  }

  async function confirmSend() {
    setBusy("send");
    try {
      const { data } = await sendMutation({
        variables: { input: buildInput(false) },
      });
      const result = data?.sendAdminBroadcastEmail;
      if (!result) {
        sileo.error({ title: "No hubo respuesta del servidor." });
        return;
      }
      if (result.success) {
        sileo.success({ title: result.message });
        setConfirmOpen(false);
      } else {
        sileo.error({ title: result.message });
      }
    } catch (err) {
      sileo.error({
        title: adminErrorText(err, "No se pudo enviar el correo."),
      });
    } finally {
      setBusy(null);
    }
  }

  function onAudienceChange(next: AdminEmailAudience) {
    setAudience(next);
    setBrand(defaultBrandForAudience(next));
  }

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      <div className="flex flex-col gap-5">
        <section className={cn(surfaceClass, "p-4 sm:p-5")}>
          <h2 className="text-base font-semibold text-[#212121] dark:text-white">
            Destinatarios
          </h2>
          <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Elige a quién llega y con qué marca se ve el correo.
          </p>

          <div
            role="group"
            aria-label="Audiencia"
            className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {AUDIENCE_OPTIONS.map((option) => {
              const selected = audience === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onAudienceChange(option.id)}
                  className={cn(
                    "min-h-11 rounded-xl border px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
                    selected
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-[#e0e0e0] dark:border-[#3a3a3a] hover:border-[#bdbdbd] dark:hover:border-[#555]",
                  )}
                >
                  <span className="block text-sm font-semibold text-[#212121] dark:text-white">
                    {option.label}
                  </span>
                  <span className="block text-xs text-[#616161] dark:text-[#b0b0b0]">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>

          {audience === "custom" ? (
            <div className="mt-4">
              <label className={labelClass} htmlFor="admin-email-recipients">
                Correos (uno por línea, o separados por coma)
              </label>
              <textarea
                id="admin-email-recipients"
                rows={4}
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                placeholder={"ana@empresa.com\nluis@correo.com"}
                className={textareaClass}
              />
              {customEmails.length > 0 ? (
                <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                  {customEmails.length} correo
                  {customEmails.length === 1 ? "" : "s"}
                  {invalidCustom.length > 0
                    ? ` · ${invalidCustom.length} inválido${invalidCustom.length === 1 ? "" : "s"}`
                    : ""}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4">
            <p className={labelClass}>Marca del correo</p>
            <div
              role="group"
              aria-label="Marca"
              className="inline-flex rounded-xl bg-black/5 dark:bg-white/10 p-1"
            >
              {(Object.keys(EMAIL_BRAND_PREVIEW) as EmailBrandId[]).map((id) => {
                const selected = brand === id;
                const meta = EMAIL_BRAND_PREVIEW[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setBrand(id)}
                    className={cn(
                      "min-h-10 rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
                      selected
                        ? "bg-white dark:bg-[#2a2a2a] text-[#212121] dark:text-white shadow-sm"
                        : "text-[#616161] dark:text-[#b0b0b0]",
                    )}
                  >
                    <span
                      className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: meta.color }}
                      aria-hidden
                    />
                    {id === "saas" ? "Negocios" : "Pet"}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className={cn(surfaceClass, "p-4 sm:p-5")}>
          <h2 className="text-base font-semibold text-[#212121] dark:text-white">
            Contenido
          </h2>
          <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Usa párrafos separados por una línea en blanco. Negrita con{" "}
            <code className="text-xs">**así**</code> y enlaces con{" "}
            <code className="text-xs">[texto](https://…)</code>.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <Field label="Asunto" htmlFor="admin-email-subject">
              <input
                id="admin-email-subject"
                className={fieldClass}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Lo que se ve en la bandeja"
                maxLength={200}
              />
            </Field>

            <Field label="Título (cabecera)" htmlFor="admin-email-title">
              <input
                id="admin-email-title"
                className={fieldClass}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título grande del correo"
                maxLength={160}
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Etiqueta superior (opcional)" htmlFor="admin-email-eyebrow">
                <input
                  id="admin-email-eyebrow"
                  className={fieldClass}
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                  placeholder="Novedad, Aviso…"
                  maxLength={200}
                />
              </Field>
              <Field label="Vista previa bandeja (opcional)" htmlFor="admin-email-preheader">
                <input
                  id="admin-email-preheader"
                  className={fieldClass}
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Texto corto junto al asunto"
                  maxLength={200}
                />
              </Field>
            </div>

            <Field label="Cuerpo" htmlFor="admin-email-body">
              <textarea
                id="admin-email-body"
                rows={8}
                className={textareaClass}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  "Escribe el mensaje.\n\nSegundo párrafo con **énfasis** o un [enlace](https://kadesh.com.mx)."
                }
              />
            </Field>

            <Field label="Recuadro destacado (opcional)" htmlFor="admin-email-callout">
              <textarea
                id="admin-email-callout"
                rows={3}
                className={textareaClass}
                value={callout}
                onChange={(e) => setCallout(e.target.value)}
                placeholder="Dato importante con el color de la marca"
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Botón — texto (opcional)" htmlFor="admin-email-cta-label">
                <input
                  id="admin-email-cta-label"
                  className={fieldClass}
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Ir al panel"
                  maxLength={80}
                />
              </Field>
              <Field label="Botón — enlace" htmlFor="admin-email-cta-url">
                <input
                  id="admin-email-cta-url"
                  className={fieldClass}
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="https://"
                  inputMode="url"
                />
              </Field>
            </div>

            <Field label="Nota del pie (opcional)" htmlFor="admin-email-footer">
              <input
                id="admin-email-footer"
                className={fieldClass}
                value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)}
                placeholder="Recibes este correo porque…"
                maxLength={400}
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={!canCompose || busy !== null}
              onClick={countRecipients}
              className="min-h-11 rounded-xl bg-orange-500 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
              {busy === "count" ? "Contando…" : "Revisar y enviar"}
            </button>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0]">
          Vista previa · {brandMeta.name}
        </p>
        <EmailPreview
          brand={brand}
          title={title || "Título del correo"}
          eyebrow={eyebrow}
          body={body}
          callout={callout}
          ctaLabel={ctaLabel}
          ctaUrl={ctaUrl}
          footerNote={footerNote}
        />
      </aside>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          if (busy === "send") return;
          setConfirmOpen(false);
        }}
        onConfirm={confirmSend}
        title="Enviar correo"
        message={`Se enviará a ${pendingCount} destinatario${pendingCount === 1 ? "" : "s"} con la marca ${brandMeta.name}. ¿Continuar?`}
        confirmText={busy === "send" ? "Enviando…" : "Enviar ahora"}
        cancelText="Cancelar"
        isLoading={busy === "send"}
        confirmButtonColor="orange"
      />
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

function EmailPreview({
  brand,
  title,
  eyebrow,
  body,
  callout,
  ctaLabel,
  ctaUrl,
  footerNote,
}: {
  brand: EmailBrandId;
  title: string;
  eyebrow: string;
  body: string;
  callout: string;
  ctaLabel: string;
  ctaUrl: string;
  footerNote: string;
}) {
  const meta = EMAIL_BRAND_PREVIEW[brand];
  const year = new Date().getFullYear();
  const bodyHtml = formatEmailBodyPreview(
    body || "Aquí verás el cuerpo del mensaje.",
  );
  const calloutHtml = callout.trim() ? formatCalloutPreview(callout) : "";
  const showCta = ctaLabel.trim() && ctaUrl.trim();

  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a]"
      style={{ background: EMAIL_TEXT_PREVIEW.page }}
    >
      <div className="px-4 py-5 sm:px-6">
        <p
          className="mb-3 text-[15px] font-extrabold tracking-tight"
          style={{ color: EMAIL_TEXT_PREVIEW.heading }}
        >
          <span
            className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-middle"
            style={{ background: meta.color }}
            aria-hidden
          />
          {meta.name}
        </p>

        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_8px_32px_rgba(15,23,42,0.08)]">
          <div
            className="px-6 py-8 sm:px-9"
            style={{
              background: `linear-gradient(135deg, ${meta.color} 0%, ${meta.dark} 100%)`,
            }}
          >
            {eyebrow.trim() ? (
              <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.12em] text-white/85">
                {eyebrow.trim()}
              </p>
            ) : null}
            <h3 className="text-[22px] sm:text-[26px] font-extrabold leading-snug text-white">
              {title}
            </h3>
          </div>

          <div className="px-6 py-8 sm:px-9">
            <p
              className="mb-4 text-[18px] leading-snug"
              style={{ color: EMAIL_TEXT_PREVIEW.heading }}
            >
              Hola <strong>ahí</strong> 👋
            </p>
            <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            {calloutHtml ? (
              <div
                className="mt-4 rounded-lg px-[18px] py-4 text-[15px] leading-relaxed"
                style={{
                  background: meta.soft,
                  borderLeft: `4px solid ${meta.color}`,
                  color: EMAIL_TEXT_PREVIEW.body,
                }}
                dangerouslySetInnerHTML={{ __html: calloutHtml }}
              />
            ) : null}
            {showCta ? (
              <div className="mt-7">
                <a
                  href={ctaUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-[10px] px-8 py-3.5 text-base font-bold text-white no-underline"
                  style={{ background: meta.color }}
                >
                  {ctaLabel.trim()} →
                </a>
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-2 pt-6 text-center">
          <p
            className="mb-2.5 text-[13px] leading-relaxed"
            style={{ color: EMAIL_TEXT_PREVIEW.muted }}
          >
            {footerNote.trim() ||
              "Recibes este correo porque tienes una cuenta en Kadesh."}
          </p>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: EMAIL_TEXT_PREVIEW.faint }}
          >
            <strong style={{ color: EMAIL_TEXT_PREVIEW.muted }}>{meta.name}</strong>{" "}
            · {meta.tagline}
            <br />© {year} Kadesh. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
