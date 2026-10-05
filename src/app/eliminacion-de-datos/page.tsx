import type { Metadata } from "next";
import { Footer, Navigation } from "kadesh/components/layout";
import {
  DataDeletionSection,
  fetchDataDeletionStatus,
  type DataDeletionLookup,
} from "kadesh/components/data-deletion";
import { Routes } from "kadesh/core/routes";
import { SITE_URL } from "kadesh/core/site";

const PAGE_URL = `${SITE_URL}${Routes.dataDeletion}`;
const TITLE = "Eliminación de datos | KADESH";
const DESCRIPTION =
  "Consulta el estado de una solicitud de eliminación de datos de Kadesh o pide la eliminación desde Facebook o por correo.";

type PageProps = {
  searchParams: Promise<{ code?: string | string[] }>;
};

function readCodeParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() ?? "";
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { code } = await searchParams;
  const hasCode = Boolean(readCodeParam(code));

  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: PAGE_URL },
    robots: hasCode ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      siteName: "Kadesh",
      locale: "es_MX",
      type: "website",
    },
  };
}

export default async function EliminacionDeDatosPage({ searchParams }: PageProps) {
  const { code: codeParam } = await searchParams;
  const code = readCodeParam(codeParam);
  let lookup: DataDeletionLookup | null = null;
  if (code.length > 256) {
    lookup = { kind: "not_found" };
  } else if (code) {
    lookup = await fetchDataDeletionStatus(code);
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <Navigation />
      <main>
        <DataDeletionSection lookup={lookup} />
      </main>
      <Footer />
    </div>
  );
}
