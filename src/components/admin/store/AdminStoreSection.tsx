"use client";

import { useSearchParams } from "next/navigation";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { AdminSegmented } from "../ui";
import AdminStoreProductsPanel from "./AdminStoreProductsPanel";
import AdminStoreReviewsPanel from "./AdminStoreReviewsPanel";
import AdminStoreTaxonomyPanel from "./AdminStoreTaxonomyPanel";
import { STORE_SECTIONS, STORE_SECTION_ITEMS, parseStoreSection } from "./constants";

/**
 * Operaciones → Kadesh Pet → Tienda. Products, categories, brands and reviews of the Kadesh Pet
 * store; the sub-section lives in `&seccion=`. Only the open one is mounted, so each asks only for
 * its own data.
 */
export default function AdminStoreSection() {
  const searchParams = useSearchParams();
  const { setParams } = useAdminNavigation();
  const section = parseStoreSection(searchParams.get("seccion"));

  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented
        items={STORE_SECTION_ITEMS}
        value={section}
        onChange={(next) =>
          setParams({ seccion: next === STORE_SECTIONS.PRODUCTS ? null : next, producto: null })
        }
        ariaLabel="Secciones de la tienda"
      />
      {section === STORE_SECTIONS.PRODUCTS ? <AdminStoreProductsPanel /> : null}
      {section === STORE_SECTIONS.CATEGORIES ? <AdminStoreTaxonomyPanel key="category" kind="category" /> : null}
      {section === STORE_SECTIONS.BRANDS ? <AdminStoreTaxonomyPanel key="brand" kind="brand" /> : null}
      {section === STORE_SECTIONS.REVIEWS ? <AdminStoreReviewsPanel /> : null}
    </div>
  );
}
