import type { jsPDF } from "jspdf";
import { QUOTATION_DISCOUNT_TYPE_OPTIONS } from "kadesh/constants/constans";
import type { SaasQuotationDetail } from "kadesh/components/profile/sales/quotations/queries";
import { formatDateShort } from "kadesh/utils/format-date";
import { formatMoney } from "kadesh/utils/format-currency";

const KADESH_PRIMARY = "#f7945e";
const KADESH_SECONDARY = "#E07C3A";

function normalizeHexColor(input: string | null | undefined): string | null {
  if (!input) return null;
  const t = input.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(t)) return t;
  if (/^#[0-9a-fA-F]{3}$/.test(t)) return t;
  return null;
}

function hexToRgb(hex: string): [number, number, number] {
  const t = hex.replace("#", "");
  if (t.length === 3) {
    const r = parseInt(`${t[0]}${t[0]}`, 16);
    const g = parseInt(`${t[1]}${t[1]}`, 16);
    const b = parseInt(`${t[2]}${t[2]}`, 16);
    return [r, g, b];
  }
  const r = parseInt(t.slice(0, 2), 16);
  const g = parseInt(t.slice(2, 4), 16);
  const b = parseInt(t.slice(4, 6), 16);
  return [r, g, b];
}

function discountLabel(type: string | null | undefined): string {
  const normalized = type?.trim().toLowerCase();
  if (!normalized || normalized === "none") return "—";
  return (
    QUOTATION_DISCOUNT_TYPE_OPTIONS.find((opt) => opt.value === normalized)?.label ??
    normalized
  );
}

function discountValue(
  type: string | null | undefined,
  value: number | null | undefined,
  currency: string,
): string {
  const normalized = type?.trim().toLowerCase();
  if (!normalized || normalized === "none" || value == null || Number.isNaN(value)) {
    return "—";
  }
  if (normalized === "percent") return `${value}%`;
  if (normalized === "amount") return formatMoney(value, currency);
  return String(value);
}

function sanitizePdfText(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "") // emojis
    .replace(/[\u{2600}-\u{27BF}]/gu, "") // dingbats/symbols
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u00FF]/g, "") // keep latin-1 printable
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function drawJustifiedBlocks(
  doc: jsPDF,
  text: string,
  x: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
  bottomMargin: number,
): number {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  let y = startY;
  const pageHeight = doc.internal.pageSize.getHeight();
  blocks.forEach((block, idx) => {
    const lines = doc.splitTextToSize(block, maxWidth);
    const blockHeight = lines.length * lineHeight;
    if (y + blockHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = bottomMargin;
    }
    doc.text(block, x, y, { maxWidth, align: "justify" });
    y += lines.length * lineHeight;
    if (idx < blocks.length - 1) y += lineHeight;
  });
  return y;
}

function ensureSpace(doc: jsPDF, y: number, needed: number, margin = 42): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed <= pageHeight - margin) return y;
  doc.addPage();
  return margin;
}

async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onloadend = () => resolve(typeof fr.result === "string" ? fr.result : null);
      fr.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportQuotationPdf(detail: SaasQuotationDetail): Promise<void> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 42;
  const contentW = pageW - margin * 2;
  const cc = detail.currency?.trim() || "MXN";
  const showDiscount = Boolean(detail.showDiscount);
  const showNotes = detail.showNotes ?? true;

  const primary = normalizeHexColor(detail.company?.colorPrimary) ?? KADESH_PRIMARY;
  const secondary = normalizeHexColor(detail.company?.colorSecondary) ?? KADESH_SECONDARY;
  const [pr, pg, pb] = hexToRgb(primary);
  const [sr, sg, sb] = hexToRgb(secondary);

  // Top strip
  doc.setFillColor(pr, pg, pb);
  doc.rect(0, 0, pageW * 0.6, 18, "F");
  doc.setFillColor(sr, sg, sb);
  doc.rect(pageW * 0.6, 0, pageW * 0.4, 18, "F");

  // Header
  let y = 44;
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Folio", margin, y);
  y += 16;
  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(detail.quotationNumber || "—", margin, y);
  y += 18;
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(formatDateShort(detail.createdAt, false), margin, y);

  const logoX = pageW - margin - 62;
  if (detail.company?.logo?.url) {
    const logoData = await loadImageDataUrl(detail.company.logo.url);
    if (logoData) {
      try {
        doc.addImage(logoData, "PNG", logoX, 34, 56, 56, undefined, "FAST");
      } catch {
        // ignore image issues
      }
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(pr, pg, pb);
  doc.text("COTIZACION", pageW - margin, 92, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(95, 95, 95);
  doc.text(detail.company?.name || "Empresa", pageW - margin, 112, { align: "right" });

  // Client / advisor blocks (2 fixed columns, no overlap)
  y = 152;
  const metaGutter = 32;
  const leftColW = contentW * 0.55;
  const rightColW = contentW - leftColW - metaGutter;
  const leftX = margin;
  const rightX = margin + leftColW + metaGutter;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text("CLIENTE", leftX, y);
  doc.text("ASESOR", rightX + rightColW, y, { align: "right" });

  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  const clientName = detail.lead?.businessName || "Cliente";
  const advisorName =
    [
      detail.assignedSeller?.name,
      detail.assignedSeller?.lastName,
      detail.assignedSeller?.secondLastName,
    ]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(" ") || "Equipo comercial";

  const clientLines = doc.splitTextToSize(sanitizePdfText(clientName), leftColW);
  const advisorLines = doc.splitTextToSize(sanitizePdfText(advisorName), rightColW);
  doc.text(clientLines, leftX, y);
  doc.text(advisorLines, rightX + rightColW, y, { align: "right" });
  y += Math.max(clientLines.length, advisorLines.length) * 15;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  const metaStartY = y + 4;
  let clientMetaY = metaStartY;
  let advisorMetaY = metaStartY;
  const lineH = 12;
  const drawMetaLine = (
    text: string,
    x: number,
    maxWidth: number,
    currentY: number,
    align: "left" | "right" = "left",
  ): number => {
    const parts = doc.splitTextToSize(sanitizePdfText(text), maxWidth);
    if (align === "right") {
      doc.text(parts, x + maxWidth, currentY, { align: "right" });
    } else {
      doc.text(parts, x, currentY);
    }
    return currentY + parts.length * lineH;
  };
  if (detail.project?.name) {
    clientMetaY = drawMetaLine(`Proyecto: ${detail.project.name}`, leftX, leftColW, clientMetaY);
  }
  if (detail.lead?.address?.trim()) {
    clientMetaY = drawMetaLine(detail.lead.address, leftX, leftColW, clientMetaY);
  }
  if (detail.assignedSeller?.businessEmail?.trim()) {
    advisorMetaY = drawMetaLine(
      `Email: ${detail.assignedSeller.businessEmail}`,
      rightX,
      rightColW,
      advisorMetaY,
      "right",
    );
  }
  if (detail.assignedSeller?.businessPhone?.trim()) {
    advisorMetaY = drawMetaLine(
      `Tel: ${detail.assignedSeller.businessPhone}`,
      rightX,
      rightColW,
      advisorMetaY,
      "right",
    );
  }
  if (detail.validUntil) {
    advisorMetaY = drawMetaLine(
      `Vigencia: ${formatDateShort(detail.validUntil, false)}`,
      rightX,
      rightColW,
      advisorMetaY,
      "right",
    );
  }

  // Products table
  const tableStartY = Math.max(clientMetaY, advisorMetaY) + 18;
  const head = [
    [
      "Descripcion",
      "Cant.",
      "P. unit.",
      ...(showDiscount ? ["Descuento"] : []),
      "Total",
    ],
  ];
  const body = (detail.quotationProducts ?? []).map((p) => [
    sanitizePdfText(p.description ?? "—"),
    p.quantity ?? "—",
    formatMoney(p.unitPrice, cc),
    ...(showDiscount ? [discountValue(p.discountType, p.discountValue, cc)] : []),
    formatMoney(p.lineTotal, cc),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head,
    body,
    styles: {
      fontSize: 8,
      cellPadding: 4.5,
      textColor: [31, 41, 55],
      lineColor: [229, 231, 235],
      lineWidth: 0.4,
      overflow: "linebreak",
    },
    tableWidth: contentW,
    headStyles: {
      fillColor: [pr, pg, pb],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { halign: "left", cellWidth: showDiscount ? 210 : 260 },
      1: { halign: "right", cellWidth: showDiscount ? 40 : 50 },
      2: { halign: "right", cellWidth: showDiscount ? 90 : 95 },
      ...(showDiscount
        ? {
            3: { halign: "right", cellWidth: 80 },
            4: { halign: "right", cellWidth: 91 },
          }
        : { 3: { halign: "right", cellWidth: 106 } }),
    },
    bodyStyles: {
      valign: "middle",
    },
    rowPageBreak: "avoid",
  });

  const afterTableY = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? tableStartY) + 16;
  const tableFinalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY;
  if (tableFinalY) {
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.8);
    doc.roundedRect(
      margin,
      tableStartY,
      contentW,
      Math.max(0, tableFinalY - tableStartY),
      8,
      8,
      "S",
    );
    doc.setLineWidth(0.2);
  }

  // Totals summary
  let totalsY = ensureSpace(doc, afterTableY, 96, margin);
  const boxW = 230;
  const boxX = pageW - margin - boxW;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(boxX, totalsY, boxW, 90, 10, 10, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 99);

  const rows: Array<[string, string]> = [
    ["Subtotal", formatMoney(detail.subtotal, cc)],
    ["IVA", formatMoney(detail.taxTotal, cc)],
    ...(showDiscount ? [["Descuento", formatMoney(detail.discountTotal, cc)] as [string, string]] : []),
  ];
  let lineY = totalsY + 16;
  rows.forEach(([k, v]) => {
    doc.text(k, boxX + 12, lineY);
    doc.text(v, boxX + boxW - 12, lineY, { align: "right" });
    lineY += 14;
  });
  doc.setDrawColor(209, 213, 219);
  doc.line(boxX + 12, totalsY + 66, boxX + boxW - 12, totalsY + 66);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Total", boxX + 12, totalsY + 82);
  doc.text(formatMoney(detail.total, cc), boxX + boxW - 12, totalsY + 82, { align: "right" });

  // Notes and terms at end
  let tailY = Math.max(afterTableY, totalsY + 106);
  const pageHeight = doc.internal.pageSize.getHeight();
  const notes = sanitizePdfText(detail.notes?.trim() || "");
  const terms = sanitizePdfText(
    (detail.terms?.trim() || detail.company?.termsQuotation?.trim() || "").trim(),
  );

  if (showNotes && notes) {
    if (tailY + 24 > pageHeight - margin) {
      doc.addPage();
      tailY = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(97, 97, 97);
    doc.setFontSize(9);
    doc.text("NOTAS", margin, tailY);
    tailY += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(9);
    tailY = drawJustifiedBlocks(doc, notes, margin, tailY, contentW, 12, margin);
    tailY += 14;
  }

  if (terms) {
    if (tailY + 24 > pageHeight - margin) {
      doc.addPage();
      tailY = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setTextColor(97, 97, 97);
    doc.setFontSize(9);
    doc.text("TÉRMINOS Y CONDICIONES", margin, tailY);
    tailY += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(7);
    tailY = drawJustifiedBlocks(doc, terms, margin, tailY, contentW, 9, margin);
    tailY += 12;
  }

  // Signatures + contact footer (como un bloque final unido)
  const contactItems = [
    detail.company?.name?.trim(),
    detail.company?.contactEmail?.trim()
      ? `Email: ${detail.company.contactEmail.trim()}`
      : null,
    detail.company?.contactPhone?.trim()
      ? `Tel: ${detail.company.contactPhone.trim()}`
      : null,
  ].filter(Boolean) as string[];
  const signatureLabelOffset = 11;
  const contactTopGap = 6;
  const contactLineHeight = 9;
  const contactFontSize = 8;
  const contactBlockTailHeight = contactItems.length
    ? contactTopGap + (contactItems.length - 1) * contactLineHeight + 2
    : 0;
  const finalBlockHeight = signatureLabelOffset + contactBlockTailHeight;
  const fixedBottomSignatureY = pageHeight - margin - finalBlockHeight;
  let signatureY = fixedBottomSignatureY;
  // Evita crear una página "casi vacía" solo para firmas.
  // Si no caben en el anclaje inferior, se colocan debajo del contenido actual.
  if (tailY > fixedBottomSignatureY - 10) {
    signatureY = tailY + 10;
  }
  // Si tampoco caben en esta hoja, ahora sí se mueve a una hoja nueva.
  // En ese escenario evitamos dejar una página casi vacía con todo al fondo:
  // renderizamos el bloque final en la parte alta de la nueva hoja.
  const maxSignatureY = pageHeight - margin - finalBlockHeight;
  if (signatureY > maxSignatureY) {
    doc.addPage();
    signatureY = margin + 22;
  }
  const gap = 24;
  const lineW = (contentW - gap) / 2;
  doc.setDrawColor(156, 163, 175);
  doc.line(margin, signatureY, margin + lineW, signatureY);
  doc.line(
    margin + lineW + gap,
    signatureY,
    margin + lineW + gap + lineW,
    signatureY,
  );
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(9);
  doc.text("Firma del cliente", margin + lineW / 2, signatureY + signatureLabelOffset, {
    align: "center",
  });
  doc.text("Firma del asesor", margin + lineW + gap + lineW / 2, signatureY + signatureLabelOffset, {
    align: "center",
  });
  tailY = signatureY + signatureLabelOffset;

  // Contact footer (siempre en la misma hoja que firmas)
  if (contactItems.length) {
    const contactY = tailY + contactTopGap;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(97, 97, 97);
    doc.setFontSize(contactFontSize);
    contactItems.forEach((line, idx) => {
      doc.text(line, pageW / 2, contactY + idx * contactLineHeight, { align: "center" });
    });
  }

  const safeFolio = (detail.quotationNumber || "cotizacion")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "");
  doc.save(`${safeFolio}.pdf`);
}
