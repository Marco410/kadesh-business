"use client";

import { useSearchParams } from "next/navigation";
import { useAdminNavigation } from "../hooks/useAdminNavigation";
import { AdminSegmented } from "../ui";
import AdminStoreOrdersPanel from "./AdminStoreOrdersPanel";
import AdminStoreProductsPanel from "./AdminStoreProductsPanel";
import AdminStoreReviewsPanel from "./AdminStoreReviewsPanel";
import AdminStoreSettingsPanel from "./AdminStoreSettingsPanel";
import AdminStoreTaxonomyPanel from "./AdminStoreTaxonomyPanel";
import { STORE_SECTIONS, STORE_SECTION_ITEMS, parseStoreSection } from "./constants";

/**
 * Operaciones → Kadesh Pet → Tienda. Orders, products, categories, brands, reviews and settings of
 * the Kadesh Pet store; the sub-section lives in `&seccion=` (none = orders). Only the open one is mounted, so each asks only for
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
          setParams({ seccion: next === STORE_SECTIONS.ORDERS ? null : next, producto: null, pedido: null, cola: null })
        }
        ariaLabel="Secciones de la tienda"
      />
      {section === STORE_SECTIONS.ORDERS ? <AdminStoreOrdersPanel /> : null}
      {section === STORE_SECTIONS.PRODUCTS ? <AdminStoreProductsPanel /> : null}
      {section === STORE_SECTIONS.CATEGORIES ? <AdminStoreTaxonomyPanel key="category" kind="category" /> : null}
      {section === STORE_SECTIONS.BRANDS ? <AdminStoreTaxonomyPanel key="brand" kind="brand" /> : null}
      {section === STORE_SECTIONS.REVIEWS ? <AdminStoreReviewsPanel /> : null}
      {section === STORE_SECTIONS.SETTINGS ? <AdminStoreSettingsPanel /> : null}
    </div>
  );
}
