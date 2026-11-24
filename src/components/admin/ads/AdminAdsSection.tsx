"use client";

import { useSearchParams } from "next/navigation";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { AdminSegmented } from "../ui";
import AdminAdsPanel from "./AdminAdsPanel";
import AdminAdsSummaryPanel from "./AdminAdsSummaryPanel";
import { AD_SECTIONS, AD_SECTION_ITEMS, parseAdSection } from "./constants";

/**
 * Operaciones → Kadesh Pet → Anuncios: the ads of Kadesh Pet (web and app) and their report. The
 * sub-section lives in `&seccion=` (none = the list). Only the open one is mounted.
 */
export default function AdminAdsSection() {
  const searchParams = useSearchParams();
  const { setParams } = useAdminNavigation();
  const section = parseAdSection(searchParams.get("seccion"));

  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented
        items={AD_SECTION_ITEMS}
        value={section}
        onChange={(next) =>
          setParams({ seccion: next === AD_SECTIONS.LIST ? null : next, anuncio: null, estado: null, tipo: null, q: null, pagina: null })
        }
        ariaLabel="Secciones de anuncios"
      />
      {section === AD_SECTIONS.LIST ? <AdminAdsPanel /> : null}
      {section === AD_SECTIONS.SUMMARY ? <AdminAdsSummaryPanel /> : null}
    </div>
  );
}
