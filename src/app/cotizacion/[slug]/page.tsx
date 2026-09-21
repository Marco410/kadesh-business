"use client";

import { useQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import {
  PUBLIC_SAAS_QUOTATION_DETAIL_QUERY,
  type SaasQuotationDetailResponse,
  type SaasQuotationDetailVariables,
} from "kadesh/components/profile/sales/quotations/queries";
import { extractQuotationIdFromPublicSlug } from "kadesh/utils/quotation-public-link";
import { useParams, useSearchParams } from "next/navigation";
import PublicQuotationView, {
  PublicQuotationMessage,
  PublicQuotationSkeleton,
} from "kadesh/components/profile/sales/quotations/PublicQuotationView";

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
      <PublicQuotationMessage title="Enlace de cotización inválido">
        Verifica que el enlace esté completo. Pídele al asesor que te lo envíe
        de nuevo si sigue fallando.
      </PublicQuotationMessage>
    );
  }

  if (loading) {
    return <PublicQuotationSkeleton />;
  }

  if (error || !detail) {
    return (
      <PublicQuotationMessage title="No se encontró la cotización">
        {error?.message ||
          "Este enlace puede haber expirado o ya no existe. Contacta a la empresa que te lo envió."}
      </PublicQuotationMessage>
    );
  }

  return (
    <>
      <PublicQuotationView detail={detail} />
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            background: #fff !important;
          }
          [aria-label="Consentimiento de cookies"] {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
