"use client";

import { useMemo } from "react";
import AdminBlogCategoriesPanel from "./AdminBlogCategoriesPanel";
import { AdminBlogPostsPanel } from "./AdminBlogPanel";
import AdminBlogTagsPanel from "./AdminBlogTagsPanel";
import AdminEmailsPanel from "./AdminEmailsPanel";
import { CONTENT_VISTAS, parseContentVista, type ContentVista } from "./constants";
import { useAdminNavigation } from "./hooks/useAdminNavigation";
import { AdminSegmented } from "./ui";

/** Contenido = Blog (artículos, categorías, etiquetas) + Correos. */
export default function AdminContentSection() {
  const { searchParams, setParams } = useAdminNavigation();
  const vista = parseContentVista(searchParams.get("vista"));
  const para = searchParams.get("para");
  const initialEmails = useMemo(
    () =>
      (para ?? "")
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean),
    [para],
  );

  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented<ContentVista>
        ariaLabel="Vista de contenido"
        items={[
          { id: CONTENT_VISTAS.ARTICLES, label: "Artículos" },
          { id: CONTENT_VISTAS.CATEGORIES, label: "Categorías" },
          { id: CONTENT_VISTAS.TAGS, label: "Etiquetas" },
          { id: CONTENT_VISTAS.EMAILS, label: "Correos" },
        ]}
        value={vista}
        onChange={(next) =>
          setParams({ vista: next === CONTENT_VISTAS.ARTICLES ? null : next, para: null })
        }
      />
      {vista === CONTENT_VISTAS.ARTICLES ? <AdminBlogPostsPanel /> : null}
      {vista === CONTENT_VISTAS.CATEGORIES ? <AdminBlogCategoriesPanel /> : null}
      {vista === CONTENT_VISTAS.TAGS ? <AdminBlogTagsPanel /> : null}
      {vista === CONTENT_VISTAS.EMAILS ? (
        <AdminEmailsPanel key={para ?? "sin-destinatarios"} initialEmails={initialEmails} />
      ) : null}
    </div>
  );
}
