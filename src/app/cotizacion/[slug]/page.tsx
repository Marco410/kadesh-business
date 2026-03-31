"use client";

import { useQuery } from "@apollo/client";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import {
  PUBLIC_SAAS_QUOTATION_DETAIL_QUERY,
  type SaasQuotationDetailResponse,
  type SaasQuotationDetailVariables,
} from "kadesh/components/profile/sales/quotations/queries";
import { formatMoney } from "kadesh/utils/format-currency";
import { formatDateShort } from "kadesh/utils/format-date";
import { extractQuotationIdFromPublicSlug } from "kadesh/utils/quotation-public-link";
import { useParams, useSearchParams } from "next/navigation";
import { QUOTATION_DISCOUNT_TYPE_OPTIONS } from "kadesh/constants/constans";

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

export default function PublicQuotationPage() {
  const params = useParams<{ slug?: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug ?? "";
  const quotationId = useMemo(
    () => extractQuotationIdFromPublicSlug(slug),
    [slug],
  );

  const { data, loading, error } = useQuery<
    SaasQuotationDetailResponse,
    SaasQuotationDetailVariables
  >(PUBLIC_SAAS_QUOTATION_DETAIL_QUERY, {
    skip: !quotationId,
    variables: quotationId ? { where: { id: quotationId } } : undefined,
    fetchPolicy: "network-only",
  });

  const detail = data?.saasQuotation;
  const company = detail?.company ?? null;
  const primary = normalizeHexColor(company?.colorPrimary) ?? KADESH_PRIMARY;
  const secondary = normalizeHexColor(company?.colorSecondary) ?? KADESH_SECONDARY;
  const cc = detail?.currency?.trim() || "MXN";
  const showDiscount = Boolean(detail?.showDiscount);
  const showNotes = detail?.showNotes ?? true;
  const shouldAutoExportPdf = searchParams.get("export") === "pdf";

  useEffect(() => {
    if (!shouldAutoExportPdf) return;
    if (loading || error || !detail) return;
    const timer = window.setTimeout(() => {
      window.print();
    }, 280);
    return () => window.clearTimeout(timer);
  }, [shouldAutoExportPdf, loading, error, detail?.id]);

  if (!quotationId) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f6f6] dark:bg-[#121212] p-6">
        <div className="w-full max-w-xl rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6">
          <h1 className="text-lg font-bold">Enlace de cotización invalido</h1>
          <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Verifica que el enlace este completo.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f6f6] dark:bg-[#121212] p-6">
        <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">Cargando cotización...</p>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f6f6] dark:bg-[#121212] p-6">
        <div className="w-full max-w-xl rounded-2xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-6">
          <h1 className="text-lg font-bold">No se encontro la cotización</h1>
          <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
            {error?.message || "Este enlace puede haber expirado o no existe."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4f6] dark:bg-[#121212] py-8 px-4 print:bg-white print:p-0">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-lg print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div
          className="h-5 w-full"
          style={{
            background: `linear-gradient(90deg, ${primary} 0%, ${secondary} 100%)`,
          }}
        />

        <div className="px-6 py-7 sm:px-10">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm tracking-wide text-[#616161]">Folio</p>
              <p className="font-semibold text-[#212121]">{detail.quotationNumber}</p>
              <p className="mt-2 text-sm text-[#616161]">
                {formatDateShort(detail.createdAt, false)}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-3">
              {company?.logo?.url ? (
                <Image
                  src={company.logo.url}
                  alt={company?.name || "Logo de empresa"}
                  width={80}
                  height={80}
                  className="rounded-md object-cover border border-[#e5e7eb]"
                />
              ) : null}
              <h1 className="text-3xl font-black tracking-wide uppercase" style={{ color: primary }}>
                Cotización
              </h1>
              <p className="text-md text-[#616161]">{company?.name || "Empresa"}</p>
            </div>
          </header>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-[#616161] uppercase">
                Cliente
              </h2>
              <p className="mt-2 text-md font-semibold text-[#1f2937]">
                {detail.lead?.businessName || "Cliente"}
              </p>
              <p className="mt-2 text-sm text-[#6b7280]">
                {detail.lead?.address || ""}
              </p>
              {detail.project?.name ? (
                <p className="mt-1 text-md text-[#6b7280]">Proyecto: {detail.project.name}</p>
              ) : null}
            </div>
            <div className="sm:text-right">
              <h2 className="text-xs font-bold tracking-widest text-[#616161] uppercase">
                Asesor
              </h2>
              <p className="mt-2 text-md font-semibold text-[#1f2937]">
                {[
                  detail.assignedSeller?.name,
                  detail.assignedSeller?.lastName,
                  detail.assignedSeller?.secondLastName,
                ]
                  .filter((part): part is string => Boolean(part?.trim()))
                  .join(" ") || "Equipo comercial"}
              </p>
              {detail.assignedSeller?.businessEmail ? (
                <p className="mt-1 text-sm text-[#6b7280]">
                  Email: {detail.assignedSeller.businessEmail}
                </p>
              ) : null}
              {detail.assignedSeller?.businessPhone ? (
                <p className="mt-1 text-sm text-[#6b7280]">
                  Teléfono: {detail.assignedSeller.businessPhone}
                </p>
              ) : null}
              {detail.validUntil ? (
                <p className="mt-1 text-sm text-[#6b7280]">
                  Vigencia: {formatDateShort(detail.validUntil, false)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-15 overflow-x-auto rounded-xl border border-[#e5e7eb]">
            <table className="min-w-full text-sm">
              <thead style={{ background: primary }}>
                <tr className="text-white">
                  <th className="px-4 py-3 text-left font-semibold">Descripcion</th>
                  <th className="px-4 py-3 text-right font-semibold">Cant.</th>
                  <th className="px-4 py-3 text-right font-semibold">P. unit.</th>
                  {showDiscount ? (
                    <>
                      <th className="px-4 py-3 text-right font-semibold">Tipo desc.</th>
                      <th className="px-4 py-3 text-right font-semibold">Descuento</th>
                    </>
                  ) : null}
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {detail.quotationProducts.map((p) => (
                  <tr key={p.id} className="border-t border-[#e5e7eb] break-inside-avoid">
                    <td className="px-4 py-3 text-[#1f2937]">{p.description || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#111827]">
                      {p.quantity ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#111827] font-medium">
                      {formatMoney(p.unitPrice, cc)}
                    </td>
                    {showDiscount ? (
                      <>
                        <td className="px-4 py-3 text-right tabular-nums text-[#111827]">
                          {QUOTATION_DISCOUNT_TYPE_OPTIONS.find(opt => opt.value === p.discountType)?.label ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-[#111827] font-medium">
                          {formatRowDiscount(p.discountType, p.discountValue, cc)}
                        </td>
                      </>
                    ) : null}
                    <td className="px-4 py-3 text-right tabular-nums text-[#111827] font-semibold">
                      {formatMoney(p.lineTotal, cc)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-xs rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4 text-sm text-[#111827]">
              <div className="flex justify-between py-1">
                <span className="text-[#4b5563]">Subtotal</span>
                <span className="font-medium text-[#111827]">{formatMoney(detail.subtotal, cc)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#4b5563]">IVA</span>
                <span className="font-medium text-[#111827]">{formatMoney(detail.taxTotal, cc)}</span>
              </div>
              {showDiscount ? (
                <div className="flex justify-between py-1">
                  <span className="text-[#4b5563]">Descuento</span>
                  <span className="font-medium text-[#111827]">
                    {formatMoney(detail.discountTotal, cc)}
                  </span>
                </div>
              ) : null}
              <div className="mt-2 flex justify-between border-t border-[#d1d5db] pt-2 font-bold">
                <span className="text-[#111827]">Total</span>
                <span className="text-[#111827]">{formatMoney(detail.total, cc)}</span>
              </div>
            </div>
          </div>

          {( (showNotes && detail.notes) || detail.terms || company?.termsQuotation) ? (
            <div className="mt-8 space-y-3 break-inside-avoid">
              {showNotes && detail.notes ? (
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-[#616161] uppercase">
                    Notas
                  </h3>
                  <p className="mt-1 text-xs text-[#374151] whitespace-pre-wrap">{detail.notes}</p>
                </div>
              ) : null}

              {(detail.terms || company?.termsQuotation) ? (
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-[#616161] uppercase">
                    Términos y condiciones
                  </h3>
                  <p className="mt-1 text-[9px] leading-[1.35] text-[#374151] whitespace-pre-wrap text-justify">
                    {detail.terms || company?.termsQuotation}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-10 break-inside-avoid">
            <div className="pt-8">
              <div className="border-t border-[#9ca3af] pt-2 text-center text-sm text-[#374151]">
                Firma del cliente
              </div>
            </div>
            <div className="pt-8">
              <div className="border-t border-[#9ca3af] pt-2 text-center text-sm text-[#374151]">
                Firma del asesor
              </div>
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-[#e5e7eb] text-center">
            <p className="text-sm font-semibold text-[#374151]">
              {company?.name || ""}
            </p>
            {company?.contactEmail || company?.contactPhone ? (
              <div className="mt-1 space-y-0.5">
                {company?.contactEmail ? (
                  <p className="text-xs text-[#616161]">
                    Email:{" "}
                    <a
                      href={`mailto:${company.contactEmail}`}
                      className="underline decoration-dotted hover:text-[#111827] transition-colors"
                    >
                      {company.contactEmail}
                    </a>
                  </p>
                ) : null}
                {company?.contactPhone ? (
                  <p className="text-xs text-[#616161]">
                    Tel:{" "}
                    <a
                      href={`tel:${company.contactPhone.replace(/\s+/g, "")}`}
                      className="underline decoration-dotted hover:text-[#111827] transition-colors"
                    >
                      {company.contactPhone}
                    </a>
                  </p>
                ) : null}
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </section>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            background: #fff !important;
          }
        }
      `}</style>
    </main>
  );
}
