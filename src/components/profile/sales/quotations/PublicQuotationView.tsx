"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CallIcon,
  Invoice01Icon,
  Mail01Icon,
  PrinterIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { formatMoney } from "kadesh/utils/format-currency";
import { formatDateShort } from "kadesh/utils/format-date";
import { QUOTATION_DISCOUNT_TYPE_OPTIONS } from "kadesh/constants/constans";
import type { SaasQuotationDetail } from "./queries";
import {
  quotationFadeUp,
  quotationMotionTransition,
  quotationStagger,
} from "./motion";

const KADESH_PRIMARY = "#f7945e";
const KADESH_SECONDARY = "#E07C3A";

function normalizeHexColor(input: string | null | undefined): string | null {
  if (!input) return null;
  const t = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(t)) return t;
  if (/^#[0-9a-fA-F]{3}$/.test(t)) return t;
  return null;
}

function formatRowDiscount(
  type: string | null | undefined,
  value: number | null | undefined,
  currency: string,
): string {
  if (type == null || value == null || Number.isNaN(value)) return "—";
  const normalized = type.trim().toLowerCase();
  if (!normalized || normalized === "none") return "—";
  if (normalized === "percent") return `${value}%`;
  if (normalized === "amount") return formatMoney(value, currency);
  return String(value);
}

function sellerName(detail: SaasQuotationDetail): string {
  return (
    [
      detail.assignedSeller?.name,
      detail.assignedSeller?.lastName,
      detail.assignedSeller?.secondLastName,
    ]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(" ") || "Equipo comercial"
  );
}

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function whatsappHref(phone: string): string {
  const digits = phoneDigits(phone);
  if (!digits) return "";
  const withCountry = digits.length === 10 ? `52${digits}` : digits;
  return `https://wa.me/${withCountry}`;
}

function isExpired(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return end.getTime() < Date.now();
}

const paperLinkClass =
  "underline decoration-dotted underline-offset-2 hover:text-[#212121]";

export function PublicQuotationMessage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f6f6] px-4 py-16 dark:bg-[#0a0a0a]">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={quotationMotionTransition(reduce)}
        className="w-full max-w-md rounded-2xl border border-[#e0e0e0] bg-white p-6 text-center shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-8"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
          <HugeiconsIcon icon={Invoice01Icon} size={24} />
        </span>
        <h1 className="mt-4 text-lg font-bold tracking-tight text-[#212121] dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
          {children}
        </p>
      </motion.div>
    </main>
  );
}

export function PublicQuotationSkeleton() {
  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 py-8 dark:bg-[#0a0a0a] sm:py-12">
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-sm dark:border-[#3a3a3a]">
        <div className="h-1.5 w-full bg-orange-500/40" />
        <div className="space-y-6 p-6 sm:p-10">
          <div className="flex justify-between gap-4">
            <div className="h-10 w-36 rounded-lg bg-[#ececec] animate-pulse" />
            <div className="h-8 w-24 rounded-lg bg-[#ececec] animate-pulse" />
          </div>
          <div className="h-4 w-48 rounded bg-[#ececec] animate-pulse" />
          <div className="h-40 rounded-xl bg-[#f5f5f5] animate-pulse" />
          <div className="ml-auto h-24 w-48 rounded-xl bg-[#ececec] animate-pulse" />
        </div>
      </div>
      <p className="sr-only">Cargando cotización</p>
    </main>
  );
}

export default function PublicQuotationView({
  detail,
}: {
  detail: SaasQuotationDetail;
}) {
  const reduce = useReducedMotion();
  const fadeUp = quotationFadeUp(reduce);
  const company = detail.company ?? null;
  const primary = normalizeHexColor(company?.colorPrimary) ?? KADESH_PRIMARY;
  const secondary = normalizeHexColor(company?.colorSecondary) ?? KADESH_SECONDARY;
  const cc = detail.currency?.trim() || "MXN";
  const showDiscount = Boolean(detail.showDiscount);
  const showNotes = detail.showNotes ?? true;
  const products = detail.quotationProducts ?? [];
  const expired = isExpired(detail.validUntil);
  const sellerPhone =
    detail.assignedSeller?.businessPhone ||
    detail.assignedSeller?.phone ||
    company?.contactPhone ||
    "";
  const sellerEmail =
    detail.assignedSeller?.businessEmail ||
    detail.assignedSeller?.email ||
    company?.contactEmail ||
    "";
  const wa = sellerPhone ? whatsappHref(sellerPhone) : "";

  const handlePrint = () => window.print();

  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 py-6 pb-28 dark:bg-[#0a0a0a] sm:py-10 md:pb-10 print:bg-white print:p-0 print:pb-0">
      <motion.div
        className="mx-auto w-full max-w-3xl"
        variants={quotationStagger(reduce, 0.04)}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={fadeUp}
          transition={quotationMotionTransition(reduce)}
          className="mb-4 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
            Propuesta de {company?.name || "la empresa"}.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#e0e0e0] bg-white px-3.5 text-sm font-medium text-[#212121] hover:border-orange-500/40 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-white"
              >
                <HugeiconsIcon icon={WhatsappIcon} size={16} />
                WhatsApp
              </a>
            ) : null}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(231,124,58,0.55)] hover:bg-orange-600"
            >
              <HugeiconsIcon icon={PrinterIcon} size={16} />
              Imprimir
            </button>
          </div>
        </motion.div>

        <motion.article
          variants={fadeUp}
          transition={quotationMotionTransition(reduce)}
          className="overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white text-[#212121] shadow-[0_12px_40px_-24px_rgba(33,33,33,0.35)] print:max-w-none print:rounded-none print:border-0 print:shadow-none"
        >
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
            }}
          />

          <div className="px-5 py-7 sm:px-10 sm:py-9">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                {company?.logo?.url ? (
                  <Image
                    src={company.logo.url}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                    className="h-14 w-14 shrink-0 rounded-xl border border-[#e5e7eb] bg-white object-contain p-1"
                  />
                ) : (
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                    style={{ background: primary }}
                    aria-hidden
                  >
                    {(company?.name || "C").charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {company?.name || "Cotización"}
                  </h1>
                  <p className="mt-0.5 text-sm text-[#616161]">
                    Cotización {detail.quotationNumber}
                  </p>
                  <p className="mt-1 text-xs text-[#616161]">
                    {formatDateShort(detail.createdAt, false)}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <p className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                  {formatMoney(detail.total, cc)}
                </p>
                {detail.validUntil ? (
                  <p
                    className={`mt-1 text-xs font-medium ${
                      expired ? "text-red-600" : "text-[#616161]"
                    }`}
                  >
                    {expired
                      ? `Venció el ${formatDateShort(detail.validUntil, false)}`
                      : `Vigente hasta ${formatDateShort(detail.validUntil, false)}`}
                  </p>
                ) : null}
              </div>
            </header>

            {expired ? (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                Esta cotización ya no está vigente. Escribe al asesor para una
                versión actualizada.
              </p>
            ) : null}

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h2 className="text-sm font-semibold text-[#212121]">Cliente</h2>
                <p className="mt-1.5 font-medium">
                  {detail.lead?.businessName || "Cliente"}
                </p>
                {detail.lead?.address ? (
                  <p className="mt-1 text-sm leading-relaxed text-[#616161]">
                    {detail.lead.address}
                  </p>
                ) : null}
                {detail.project?.name ? (
                  <p className="mt-1 text-sm text-[#616161]">
                    Proyecto: {detail.project.name}
                  </p>
                ) : null}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#212121]">Asesor</h2>
                <p className="mt-1.5 font-medium">{sellerName(detail)}</p>
                {sellerEmail ? (
                  <p className="mt-1 text-sm text-[#616161]">
                    <a href={`mailto:${sellerEmail}`} className={paperLinkClass}>
                      {sellerEmail}
                    </a>
                  </p>
                ) : null}
                {sellerPhone ? (
                  <p className="mt-1 text-sm text-[#616161]">
                    <a href={telHref(sellerPhone)} className={paperLinkClass}>
                      {sellerPhone}
                    </a>
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-semibold text-[#212121]">Conceptos</h2>
              {products.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-[#e0e0e0] px-4 py-8 text-center text-sm text-[#616161]">
                  Esta cotización no tiene conceptos todavía.
                </p>
              ) : (
                <>
                  <ul className="mt-3 divide-y divide-[#eee] overflow-hidden rounded-xl border border-[#e8e8e8] md:hidden">
                    {products.map((p) => (
                      <li key={p.id} className="px-4 py-3.5">
                        <p className="font-medium leading-snug">
                          {p.description || "—"}
                        </p>
                        <div className="mt-2 flex items-end justify-between gap-3 text-sm">
                          <p className="text-[#616161]">
                            {p.quantity ?? "—"} × {formatMoney(p.unitPrice, cc)}
                            {showDiscount &&
                            p.discountType &&
                            p.discountType !== "none"
                              ? ` · desc. ${formatRowDiscount(p.discountType, p.discountValue, cc)}`
                              : ""}
                          </p>
                          <p className="shrink-0 font-semibold tabular-nums">
                            {formatMoney(p.lineTotal, cc)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 hidden overflow-x-auto rounded-xl border border-[#e8e8e8] md:block">
                    <table className="min-w-full text-sm">
                      <thead style={{ background: primary }}>
                        <tr className="text-white">
                          <th className="px-4 py-3 text-left font-semibold">
                            Descripción
                          </th>
                          <th className="px-4 py-3 text-right font-semibold">
                            Cant.
                          </th>
                          <th className="px-4 py-3 text-right font-semibold">
                            P. unit.
                          </th>
                          {showDiscount ? (
                            <>
                              <th className="px-4 py-3 text-right font-semibold">
                                Tipo desc.
                              </th>
                              <th className="px-4 py-3 text-right font-semibold">
                                Descuento
                              </th>
                            </>
                          ) : null}
                          <th className="px-4 py-3 text-right font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr
                            key={p.id}
                            className="border-t border-[#eee] break-inside-avoid"
                          >
                            <td className="px-4 py-3">{p.description || "—"}</td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {p.quantity ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-right font-medium tabular-nums">
                              {formatMoney(p.unitPrice, cc)}
                            </td>
                            {showDiscount ? (
                              <>
                                <td className="px-4 py-3 text-right tabular-nums">
                                  {QUOTATION_DISCOUNT_TYPE_OPTIONS.find(
                                    (opt) => opt.value === p.discountType,
                                  )?.label ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-right font-medium tabular-nums">
                                  {formatRowDiscount(
                                    p.discountType,
                                    p.discountValue,
                                    cc,
                                  )}
                                </td>
                              </>
                            ) : null}
                            <td className="px-4 py-3 text-right font-semibold tabular-nums">
                              {formatMoney(p.lineTotal, cc)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <dl className="w-full max-w-xs space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#616161]">Subtotal</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMoney(detail.subtotal, cc)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#616161]">IVA</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMoney(detail.taxTotal, cc)}
                  </dd>
                </div>
                {showDiscount ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#616161]">Descuento</dt>
                    <dd className="font-medium tabular-nums">
                      {formatMoney(detail.discountTotal, cc)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4 border-t border-[#e0e0e0] pt-2 text-base font-bold">
                  <dt>Total</dt>
                  <dd className="tabular-nums" style={{ color: primary }}>
                    {formatMoney(detail.total, cc)}
                  </dd>
                </div>
              </dl>
            </div>

            {(showNotes && detail.notes) ||
            detail.terms ||
            company?.termsQuotation ? (
              <div className="mt-10 space-y-6 break-inside-avoid">
                {showNotes && detail.notes ? (
                  <div>
                    <h3 className="text-sm font-semibold">Notas</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#424242]">
                      {detail.notes}
                    </p>
                  </div>
                ) : null}
                {detail.terms || company?.termsQuotation ? (
                  <div>
                    <h3 className="text-sm font-semibold">
                      Términos y condiciones
                    </h3>
                    <p className="mt-2 max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-[#424242]">
                      {detail.terms || company?.termsQuotation}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-14 hidden grid-cols-2 gap-10 break-inside-avoid print:grid">
              <div className="pt-10">
                <div className="border-t border-[#9ca3af] pt-2 text-center text-sm text-[#616161]">
                  Firma del cliente
                </div>
              </div>
              <div className="pt-10">
                <div className="border-t border-[#9ca3af] pt-2 text-center text-sm text-[#616161]">
                  Firma del asesor
                </div>
              </div>
            </div>

            <footer className="mt-10 border-t border-[#eee] pt-5 text-center">
              <p className="text-sm font-semibold">{company?.name || ""}</p>
              {company?.contactEmail || company?.contactPhone ? (
                <div className="mt-1 space-y-0.5 text-sm text-[#616161]">
                  {company?.contactEmail ? (
                    <p>
                      <a
                        href={`mailto:${company.contactEmail}`}
                        className={paperLinkClass}
                      >
                        {company.contactEmail}
                      </a>
                    </p>
                  ) : null}
                  {company?.contactPhone ? (
                    <p>
                      <a
                        href={telHref(company.contactPhone)}
                        className={paperLinkClass}
                      >
                        {company.contactPhone}
                      </a>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </footer>
          </div>
        </motion.article>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e0e0e0] bg-white px-4 py-3 print:hidden md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[#616161]">Total</p>
            <p className="truncate text-base font-bold tabular-nums">
              {formatMoney(detail.total, cc)}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e0e0e0] text-[#212121]"
              >
                <HugeiconsIcon icon={WhatsappIcon} size={18} />
              </a>
            ) : sellerEmail ? (
              <a
                href={`mailto:${sellerEmail}`}
                aria-label="Enviar correo"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e0e0e0] text-[#212121]"
              >
                <HugeiconsIcon icon={Mail01Icon} size={18} />
              </a>
            ) : sellerPhone ? (
              <a
                href={telHref(sellerPhone)}
                aria-label="Llamar"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e0e0e0] text-[#212121]"
              >
                <HugeiconsIcon icon={CallIcon} size={18} />
              </a>
            ) : null}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white"
            >
              <HugeiconsIcon icon={PrinterIcon} size={16} />
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
