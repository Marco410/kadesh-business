"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  Delete02Icon,
  ImageAdd01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { ConfirmModal, ModalPortal } from "kadesh/components/shared";
import { ANIMAL_TYPE_LABELS } from "../animals/constants";
import { imageFileError } from "../blog-image";
import { adminErrorText } from "../errors";
import {
  AdminButton,
  AdminErrorState,
  AdminLoadingRows,
  AdminModal,
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
  adminSelectClass,
  adminTextareaClass,
} from "../ui";
import {
  ADMIN_STORE_MAX_IMAGES,
  ADMIN_STORE_MAX_VARIANTS,
  ADMIN_STORE_TAXONOMY_TAKE,
  STORE_INVENTORY,
  STORE_INVENTORY_OPTIONS,
  STORE_NEW_PRODUCT,
  STORE_SOURCE,
  STORE_SOURCE_LABELS,
  STORE_SOURCE_OPTIONS,
  STORE_STATUS,
  STORE_STATUS_LABELS,
  centsToInput,
  formatCents,
  inputToCents,
  inputToInt,
  isMercadoLibreUrl,
} from "./constants";
import {
  ADMIN_STORE_OPTIONS_QUERY,
  ADMIN_STORE_PRODUCT_QUERY,
  CREATE_ADMIN_STORE_PRODUCT_MUTATION,
  DELETE_ADMIN_STORE_PRODUCT_MUTATION,
  SAVE_ADMIN_STORE_PRODUCT_MUTATION,
  type AdminStoreOptionsResponse,
  type AdminStoreProductDetail,
} from "./queries";

type VariantDraft = {
  key: string;
  id?: string;
  title: string;
  sku: string;
  price: string;
  compareAt: string;
  cost: string;
  stock: string;
  isActive: boolean;
};

type ImageDraft = {
  key: string;
  id?: string;
  /** What to show: the signed URL, the pasted link or a local preview. */
  url: string;
  file?: File;
  externalUrl?: string;
  alt: string;
};

type FormState = {
  name: string;
  shortDescription: string;
  description: string;
  source: string;
  status: string;
  isFeatured: boolean;
  inventoryPolicy: string;
  categoryId: string;
  brandId: string;
  animalTypeIds: string[];
  externalId: string;
  externalUrl: string;
  affiliateUrl: string;
  metaTitle: string;
  metaDescription: string;
};

let draftCounter = 0;
function draftKey(): string {
  draftCounter += 1;
  return `draft-${draftCounter}`;
}

function emptyVariant(): VariantDraft {
  return { key: draftKey(), title: "", sku: "", price: "", compareAt: "", cost: "", stock: "0", isActive: true };
}

function initialForm(product: AdminStoreProductDetail | null): FormState {
  return {
    name: product?.name ?? "",
    shortDescription: product?.shortDescription ?? "",
    description: product?.description ?? "",
    source: product?.source ?? STORE_SOURCE.OWN,
    status: product?.status ?? STORE_STATUS.DRAFT,
    isFeatured: Boolean(product?.isFeatured),
    inventoryPolicy: product?.inventoryPolicy ?? STORE_INVENTORY.TRACKED,
    categoryId: product?.category?.id ?? "",
    brandId: product?.brand?.id ?? "",
    animalTypeIds: (product?.animalTypes ?? []).map((type) => type.id),
    externalId: product?.externalId ?? "",
    externalUrl: product?.externalUrl ?? "",
    affiliateUrl: product?.affiliateUrl ?? "",
    metaTitle: product?.metaTitle ?? "",
    metaDescription: product?.metaDescription ?? "",
  };
}

function initialVariants(product: AdminStoreProductDetail | null): VariantDraft[] {
  if (!product || product.variants.length === 0) return [emptyVariant()];
  return product.variants.map((variant) => ({
    key: variant.id,
    id: variant.id,
    title: variant.title ?? "",
    sku: variant.sku ?? "",
    price: centsToInput(variant.priceCents),
    compareAt: centsToInput(variant.compareAtPriceCents),
    cost: centsToInput(variant.costCents),
    stock: String(variant.stock ?? 0),
    isActive: variant.isActive !== false,
  }));
}

function initialImages(product: AdminStoreProductDetail | null): ImageDraft[] {
  return (product?.images ?? [])
    .map((image) => ({
      key: image.id,
      id: image.id,
      url: image.image?.url ?? image.externalUrl ?? "",
      alt: image.alt ?? "",
    }))
    .filter((image) => image.url);
}

function isHttps(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className={adminLabelClass}>{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-dash-faint">{hint}</span> : null}
    </label>
  );
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-dash-ink">{title}</h3>
      {description ? <p className="mt-0.5 text-[13px] text-dash-muted">{description}</p> : null}
    </div>
  );
}

/**
 * Editor of a store product: data, origin (own, Dropi or a Mercado Libre affiliate link),
 * variants with price and stock, and photos. One request per save.
 */
export default function AdminStoreProductEditor({
  productId,
  onClose,
  onSaved,
}: {
  /** `null` = closed; `nuevo` = empty editor; otherwise the product id. */
  productId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = productId === STORE_NEW_PRODUCT;
  const { data, loading, error } = useQuery<{ storeProduct: AdminStoreProductDetail | null }>(
    ADMIN_STORE_PRODUCT_QUERY,
    {
      variables: { id: productId },
      skip: !productId || isNew,
      // Signed image URLs and stock must be fresh every time the editor opens.
      fetchPolicy: "network-only",
    },
  );
  const { data: options } = useQuery<AdminStoreOptionsResponse>(ADMIN_STORE_OPTIONS_QUERY, {
    variables: { take: ADMIN_STORE_TAXONOMY_TAKE },
    fetchPolicy: "cache-first",
    skip: !productId,
  });

  if (!productId) return null;

  const product = isNew ? null : data?.storeProduct ?? null;
  // Wait for the fresh copy: Apollo can hand back the one from the last time this product was
  // opened, and the form keeps whatever it starts with (saving it again would undo the last save).
  if (!isNew && (loading || !product)) {
    return (
      <AdminModal open onClose={onClose} title="Producto" ariaLabel="Editar producto" size="xl">
        {error ? (
          <AdminErrorState message={adminErrorText(error, "No se pudo cargar el producto.")} />
        ) : loading ? (
          <AdminLoadingRows rows={6} />
        ) : (
          <AdminErrorState message="No encontramos este producto." />
        )}
      </AdminModal>
    );
  }

  return (
    <ProductForm
      key={productId}
      product={product}
      options={options ?? null}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function ProductForm({
  product,
  options,
  onClose,
  onSaved,
}: {
  product: AdminStoreProductDetail | null;
  options: AdminStoreOptionsResponse | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => initialForm(product));
  const [variants, setVariants] = useState<VariantDraft[]>(() => initialVariants(product));
  const [images, setImages] = useState<ImageDraft[]>(() => initialImages(product));
  const [removedVariantIds, setRemovedVariantIds] = useState<string[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [imageLink, setImageLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  // What the form started with, to know if closing would lose changes.
  const [pristine] = useState(() =>
    JSON.stringify([initialForm(product), initialVariants(product), initialImages(product)]),
  );
  const dirty =
    removedVariantIds.length > 0 ||
    removedImageIds.length > 0 ||
    JSON.stringify([form, variants, images]) !== pristine;
  // Esc, the X or «Cancelar» with unsaved changes asks first.
  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  const [createProduct] = useMutation(CREATE_ADMIN_STORE_PRODUCT_MUTATION);
  const [saveProduct] = useMutation(SAVE_ADMIN_STORE_PRODUCT_MUTATION);
  const [deleteProduct] = useMutation(DELETE_ADMIN_STORE_PRODUCT_MUTATION);

  // Local previews are object URLs: released when the editor closes.
  const previews = useRef<string[]>([]);
  useEffect(() => {
    const created = previews.current;
    return () => {
      for (const url of created) URL.revokeObjectURL(url);
    };
  }, []);

  const isAffiliate = form.source === STORE_SOURCE.MERCADO_LIBRE;
  const isDropi = form.source === STORE_SOURCE.DROPI;
  const tracked = form.inventoryPolicy === STORE_INVENTORY.TRACKED;
  // An affiliate product has one price and no stock of ours.
  const shownVariants = isAffiliate ? variants.slice(0, 1) : variants;

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  const setVariant = (key: string, patch: Partial<VariantDraft>) =>
    setVariants((current) => current.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant)));

  function removeVariant(variant: VariantDraft) {
    if (variant.id) setRemovedVariantIds((current) => [...current, variant.id!]);
    setVariants((current) => current.filter((entry) => entry.key !== variant.key));
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const next: ImageDraft[] = [];
    for (const file of Array.from(files)) {
      if (images.length + next.length >= ADMIN_STORE_MAX_IMAGES) {
        sileo.warning({ title: `Máximo ${ADMIN_STORE_MAX_IMAGES} fotos por producto.` });
        break;
      }
      const message = imageFileError(file);
      if (message) {
        sileo.warning({ title: message, description: file.name });
        continue;
      }
      const url = URL.createObjectURL(file);
      previews.current.push(url);
      next.push({ key: draftKey(), url, file, alt: "" });
    }
    if (next.length > 0) setImages((current) => [...current, ...next]);
  }

  function addImageLink() {
    const link = imageLink.trim();
    if (!link) return;
    if (!isHttps(link)) {
      sileo.warning({ title: "El enlace de la imagen debe empezar con https://." });
      return;
    }
    if (images.length >= ADMIN_STORE_MAX_IMAGES) {
      sileo.warning({ title: `Máximo ${ADMIN_STORE_MAX_IMAGES} fotos por producto.` });
      return;
    }
    setImages((current) => [...current, { key: draftKey(), url: link, externalUrl: link, alt: "" }]);
    setImageLink("");
  }

  function removeImage(image: ImageDraft) {
    if (image.id) setRemovedImageIds((current) => [...current, image.id!]);
    setImages((current) => current.filter((entry) => entry.key !== image.key));
  }

  function moveImage(index: number, delta: number) {
    setImages((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleAnimalType(id: string) {
    set(
      "animalTypeIds",
      form.animalTypeIds.includes(id)
        ? form.animalTypeIds.filter((entry) => entry !== id)
        : [...form.animalTypeIds, id],
    );
  }

  /** Variant fields as the API wants them, or the message of the first problem. */
  function variantData(variant: VariantDraft, index: number): Record<string, unknown> | string {
    const label = shownVariants.length > 1 ? `Variante ${index + 1}` : "El producto";
    const priceCents = inputToCents(variant.price);
    if (priceCents === null) return `${label}: falta el precio.`;
    if (Number.isNaN(priceCents)) return `${label}: el precio no es válido.`;
    const compareAt = inputToCents(variant.compareAt);
    if (Number.isNaN(compareAt)) return `${label}: el precio anterior no es válido.`;
    if (compareAt !== null && compareAt <= priceCents) {
      return `${label}: el precio anterior debe ser mayor que el precio.`;
    }
    const cost = inputToCents(variant.cost);
    if (Number.isNaN(cost)) return `${label}: el costo no es válido.`;
    const stock = isAffiliate || !tracked ? 0 : inputToInt(variant.stock);
    if (stock === null || Number.isNaN(stock)) return `${label}: el stock debe ser un número entero.`;
    return {
      title: variant.title.trim(),
      sku: variant.sku.trim() || null,
      priceCents,
      compareAtPriceCents: compareAt,
      costCents: cost,
      stock,
      isActive: variant.isActive,
      order: index + 1,
    };
  }

  // Only links to Mercado Libre (or its meli.la short links): the button sends shoppers there.
  const affiliateUrlError =
    form.affiliateUrl.trim() && !isMercadoLibreUrl(form.affiliateUrl)
      ? "El enlace debe ser https y de Mercado Libre (mercadolibre.com.mx, mercadolibre.com o meli.la)."
      : null;

  async function handleSave() {
    const name = form.name.trim();
    if (!name) return void sileo.warning({ title: "Escribe el nombre del producto." });
    if (isAffiliate && !isHttps(form.affiliateUrl.trim())) {
      return void sileo.warning({ title: "Pega el enlace de afiliado de Mercado Libre (https://…)." });
    }
    if (isAffiliate && affiliateUrlError) return void sileo.warning({ title: affiliateUrlError });
    if (form.externalUrl.trim() && !isHttps(form.externalUrl.trim())) {
      return void sileo.warning({ title: "El enlace del producto debe empezar con https://." });
    }
    if (isDropi && !form.externalId.trim()) {
      return void sileo.warning({ title: "Escribe el id del producto en Dropi." });
    }
    if (shownVariants.length === 0) return void sileo.warning({ title: "Agrega al menos una variante con precio." });

    const built: Array<{ draft: VariantDraft; data: Record<string, unknown> }> = [];
    for (const [index, draft] of shownVariants.entries()) {
      const data = variantData(draft, index);
      if (typeof data === "string") return void sileo.warning({ title: data });
      built.push({ draft, data });
    }
    if (
      form.status === STORE_STATUS.ACTIVE &&
      !built.some((entry) => entry.data.isActive && Number(entry.data.priceCents) > 0)
    ) {
      return void sileo.warning({
        title: "Para activarlo necesita un precio mayor a cero.",
        description: "Sin precio no se muestra en la tienda.",
      });
    }

    const common: Record<string, unknown> = {
      name,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      status: form.status,
      isFeatured: form.isFeatured,
      inventoryPolicy: form.inventoryPolicy,
      externalId: isAffiliate || isDropi ? form.externalId.trim() : "",
      externalUrl: isAffiliate ? form.externalUrl.trim() : "",
      affiliateUrl: isAffiliate ? form.affiliateUrl.trim() : "",
      metaTitle: form.metaTitle.trim(),
      metaDescription: form.metaDescription.trim(),
    };
    const imageCreate = (image: ImageDraft, order: number) => ({
      order,
      alt: image.alt.trim(),
      ...(image.file ? { image: { upload: image.file } } : { externalUrl: image.externalUrl }),
    });

    setSaving(true);
    try {
      if (!product) {
        await createProduct({
          variables: {
            data: {
              ...common,
              source: form.source,
              ...(form.categoryId ? { category: { connect: { id: form.categoryId } } } : {}),
              ...(form.brandId ? { brand: { connect: { id: form.brandId } } } : {}),
              animalTypes: { connect: form.animalTypeIds.map((id) => ({ id })) },
              variants: { create: built.map((entry) => entry.data) },
              images: { create: images.map((image, index) => imageCreate(image, index + 1)) },
            },
          },
        });
        sileo.success({ title: "Producto creado" });
      } else {
        // The variants an affiliate product no longer shows are removed too.
        const keptIds = new Set(built.map((entry) => entry.draft.id).filter(Boolean));
        const hiddenIds = variants.filter((variant) => variant.id && !keptIds.has(variant.id)).map((variant) => variant.id!);
        const newVariants = built.filter((entry) => !entry.draft.id).map((entry) => entry.data);
        const newImages = images
          .map((image, index) => ({ image, order: index + 1 }))
          .filter((entry) => !entry.image.id)
          .map((entry) => imageCreate(entry.image, entry.order));

        await saveProduct({
          variables: {
            id: product.id,
            data: {
              ...common,
              category: form.categoryId ? { connect: { id: form.categoryId } } : { disconnect: true },
              brand: form.brandId ? { connect: { id: form.brandId } } : { disconnect: true },
              animalTypes: { set: form.animalTypeIds.map((id) => ({ id })) },
              ...(newVariants.length > 0 ? { variants: { create: newVariants } } : {}),
              ...(newImages.length > 0 ? { images: { create: newImages } } : {}),
            },
            variantUpdates: built
              .filter((entry) => entry.draft.id)
              .map((entry) => ({ where: { id: entry.draft.id }, data: entry.data })),
            variantDeletes: [...new Set([...removedVariantIds, ...hiddenIds])].map((id) => ({ id })),
            imageUpdates: images
              .map((image, index) => ({ image, order: index + 1 }))
              .filter((entry) => entry.image.id)
              .map((entry) => ({
                where: { id: entry.image.id },
                data: { order: entry.order, alt: entry.image.alt.trim() },
              })),
            imageDeletes: removedImageIds.map((id) => ({ id })),
          },
        });
        sileo.success({ title: "Producto guardado" });
      }
      onSaved();
      onClose();
    } catch (err) {
      sileo.error({
        title: "No se pudo guardar el producto",
        description: adminErrorText(err, "Revisa los datos e intenta de nuevo."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    setSaving(true);
    try {
      await deleteProduct({ variables: { id: product.id } });
      sileo.success({ title: "Producto borrado" });
      onSaved();
      onClose();
    } catch (err) {
      sileo.error({
        title: "No se pudo borrar",
        description: adminErrorText(err, "Si tiene reseñas, archívalo en vez de borrarlo."),
      });
    } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  }

  const gridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2";

  return (
    <AdminModal
      open
      onClose={requestClose}
      title={product ? "Editar producto" : "Nuevo producto"}
      subtitle={
        product
          ? `${STORE_SOURCE_LABELS[product.source] ?? product.source} · ${
              (product.ratingCount ?? 0) > 0
                ? `${(product.ratingAverage ?? 0).toFixed(1)} estrellas en ${product.ratingCount} reseñas`
                : "Sin reseñas todavía"
            }`
          : "Los productos nuevos empiezan como borrador y sin estrellas."
      }
      ariaLabel={product ? "Editar producto" : "Nuevo producto"}
      size="xl"
      footer={
        <>
          {product ? (
            <AdminButton variant="danger-ghost" size="sm" onClick={() => setConfirmDelete(true)} disabled={saving} className="mr-auto">
              Borrar
            </AdminButton>
          ) : null}
          <AdminButton variant="ghost" onClick={requestClose} disabled={saving}>
            Cancelar
          </AdminButton>
          <AdminButton onClick={() => void handleSave()} disabled={saving}>
            {saving ? "Guardando…" : product ? "Guardar producto" : "Crear producto"}
          </AdminButton>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <SectionTitle title="Datos" />
          <Field label="Nombre">
            <input
              value={form.name}
              onChange={(event) => set("name", event.target.value)}
              className={adminInputClass}
              placeholder="Croquetas premium de pollo 2 kg"
              maxLength={160}
            />
          </Field>
          <Field label="Descripción corta" hint="Una línea: sale en la tarjeta del producto.">
            <input
              value={form.shortDescription}
              onChange={(event) => set("shortDescription", event.target.value)}
              className={adminInputClass}
              maxLength={200}
            />
          </Field>
          <Field label="Descripción">
            <textarea
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
              className={`${adminTextareaClass} min-h-36`}
            />
          </Field>
          <div className={gridClass}>
            <Field label="Estatus" hint="Solo «Activo» se ve en la tienda.">
              <select value={form.status} onChange={(event) => set("status", event.target.value)} className={adminSelectClass}>
                {Object.entries(STORE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex h-11 cursor-pointer items-center gap-2 self-end text-[15px] text-dash-ink">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => set("isFeatured", event.target.checked)}
                className="size-4 accent-orange-500"
              />
              Destacado en la tienda
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle
            title="Origen"
            description="Es interno. En la tienda, los productos propios y los de Dropi aparecen como vendidos por Kadesh."
          />
          <div className={gridClass}>
            <Field label="Origen" hint={product ? "No se cambia después de crear el producto." : undefined}>
              <select
                value={form.source}
                onChange={(event) => set("source", event.target.value)}
                disabled={Boolean(product)}
                className={adminSelectClass}
              >
                {STORE_SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            {isDropi ? (
              <Field
                label="Id del producto en Dropi"
                hint={
                  product?.suggestedPriceCents
                    ? `Precio sugerido por Dropi: ${formatCents(product.suggestedPriceCents)}`
                    : undefined
                }
              >
                <input
                  value={form.externalId}
                  onChange={(event) => set("externalId", event.target.value)}
                  className={adminInputClass}
                  inputMode="numeric"
                  placeholder="2110"
                />
              </Field>
            ) : null}
            {isAffiliate ? (
              <Field label="Id en Mercado Libre (opcional)">
                <input
                  value={form.externalId}
                  onChange={(event) => set("externalId", event.target.value)}
                  className={adminInputClass}
                  placeholder="MLM123456789"
                />
              </Field>
            ) : null}
          </div>
          {isAffiliate ? (
            <>
              <Field
                label="Enlace de afiliado"
                hint="El que genera el portal de afiliados de Mercado Libre. A él lleva el botón «Ver en Mercado Libre»."
              >
                <input
                  value={form.affiliateUrl}
                  onChange={(event) => set("affiliateUrl", event.target.value)}
                  className={adminInputClass}
                  inputMode="url"
                  placeholder="https://mercadolibre.com/sec/…"
                  aria-invalid={affiliateUrlError ? true : undefined}
                  aria-describedby={affiliateUrlError ? "affiliate-url-error" : undefined}
                />
                {affiliateUrlError ? (
                  <p id="affiliate-url-error" role="alert" className="mt-1 text-sm text-red-700 dark:text-red-400">
                    {affiliateUrlError}
                  </p>
                ) : null}
              </Field>
              <Field label="Enlace normal del producto (opcional)" hint="Para volver a revisar su precio.">
                <input
                  value={form.externalUrl}
                  onChange={(event) => set("externalUrl", event.target.value)}
                  className={adminInputClass}
                  inputMode="url"
                  placeholder="https://www.mercadolibre.com.mx/…"
                />
              </Field>
            </>
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle title="Organización" />
          <div className={gridClass}>
            <Field label="Categoría">
              <select
                value={form.categoryId}
                onChange={(event) => set("categoryId", event.target.value)}
                className={adminSelectClass}
              >
                <option value="">Sin categoría</option>
                {(options?.storeCategories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.parent ? `${category.parent.name} › ${category.name}` : category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Marca">
              <select value={form.brandId} onChange={(event) => set("brandId", event.target.value)} className={adminSelectClass}>
                <option value="">Sin marca</option>
                {(options?.storeBrands ?? []).map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <fieldset>
            <legend className={adminLabelClass}>Para qué animales</legend>
            <div className="flex flex-wrap gap-2">
              {(options?.animalTypes ?? []).map((type) => {
                const selected = form.animalTypeIds.includes(type.id);
                return (
                  <button
                    key={type.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleAnimalType(type.id)}
                    className={`h-11 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                      selected
                        ? "border-dash-ink bg-dash-ink text-dash-on-ink"
                        : "border-dash-line bg-dash-surface text-dash-soft hover:border-dash-line-strong"
                    }`}
                  >
                    {ANIMAL_TYPE_LABELS[type.name] ?? type.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle
            title={isAffiliate ? "Precio" : "Precio y stock"}
            description={
              isAffiliate
                ? "Precio aproximado: el real lo pone Mercado Libre. Al guardarlo queda la fecha de revisión, que se muestra junto al precio."
                : "Cada variante es algo que se puede comprar (una talla, un tamaño). Un producto sin opciones tiene una sola."
            }
          />
          {!isAffiliate ? (
            <div className={gridClass}>
              <Field label="Inventario">
                <select
                  value={form.inventoryPolicy}
                  onChange={(event) => set("inventoryPolicy", event.target.value)}
                  className={adminSelectClass}
                >
                  {STORE_INVENTORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          ) : null}

          <ul className="flex flex-col gap-3">
            {shownVariants.map((variant, index) => {
              const price = inputToCents(variant.price);
              const cost = inputToCents(variant.cost);
              const margin =
                price && cost && !Number.isNaN(price) && !Number.isNaN(cost) ? price - cost : null;
              return (
                <li key={variant.key} className="rounded-2xl border border-dash-line p-4">
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                    {!isAffiliate ? (
                      <div className="col-span-2">
                        <Field label="Variante">
                          <input
                            value={variant.title}
                            onChange={(event) => setVariant(variant.key, { title: event.target.value })}
                            className={adminInputClass}
                            placeholder={shownVariants.length > 1 ? "Talla M" : "Vacío si no tiene opciones"}
                          />
                        </Field>
                      </div>
                    ) : null}
                    <Field label="Precio">
                      <input
                        value={variant.price}
                        onChange={(event) => setVariant(variant.key, { price: event.target.value })}
                        className={adminInputClass}
                        inputMode="decimal"
                        placeholder="0.00"
                      />
                    </Field>
                    <Field label="Precio anterior">
                      <input
                        value={variant.compareAt}
                        onChange={(event) => setVariant(variant.key, { compareAt: event.target.value })}
                        className={adminInputClass}
                        inputMode="decimal"
                        placeholder="Tachado"
                      />
                    </Field>
                    {!isAffiliate ? (
                      <>
                        <Field label="Costo">
                          <input
                            value={variant.cost}
                            onChange={(event) => setVariant(variant.key, { cost: event.target.value })}
                            className={adminInputClass}
                            inputMode="decimal"
                            placeholder="Interno"
                          />
                        </Field>
                        <Field label="Stock">
                          <input
                            value={tracked ? variant.stock : ""}
                            onChange={(event) => setVariant(variant.key, { stock: event.target.value })}
                            className={adminInputClass}
                            inputMode="numeric"
                            disabled={!tracked}
                            placeholder={tracked ? "0" : "Sobre pedido"}
                          />
                        </Field>
                      </>
                    ) : null}
                  </div>
                  {!isAffiliate ? (
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="w-full sm:w-48">
                        <input
                          value={variant.sku}
                          onChange={(event) => setVariant(variant.key, { sku: event.target.value })}
                          className={adminInputClass}
                          placeholder="SKU (opcional)"
                          aria-label="SKU"
                        />
                      </div>
                      <label className="inline-flex h-11 cursor-pointer items-center gap-2 text-sm text-dash-soft">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(event) => setVariant(variant.key, { isActive: event.target.checked })}
                          className="size-4 accent-orange-500"
                        />
                        A la venta
                      </label>
                      {margin !== null ? (
                        <span className={`text-sm ${margin < 0 ? "font-semibold text-red-700 dark:text-red-400" : "text-dash-muted"}`}>
                          Margen: {formatCents(margin)}
                          {price ? ` (${Math.round((margin / price) * 100)} %)` : ""}
                        </span>
                      ) : null}
                      {shownVariants.length > 1 ? (
                        <AdminButton
                          variant="danger-ghost"
                          size="sm"
                          icon={Delete02Icon}
                          onClick={() => removeVariant(variant)}
                          className="ml-auto"
                        >
                          Quitar
                        </AdminButton>
                      ) : null}
                    </div>
                  ) : null}
                  <span className="sr-only">Variante {index + 1}</span>
                </li>
              );
            })}
          </ul>
          {!isAffiliate && variants.length < ADMIN_STORE_MAX_VARIANTS ? (
            <AdminButton
              variant="outline"
              size="sm"
              icon={PlusSignIcon}
              onClick={() => setVariants((current) => [...current, emptyVariant()])}
              className="self-start"
            >
              Agregar variante
            </AdminButton>
          ) : null}
        </section>

        <section className="flex flex-col gap-4">
          <SectionTitle title="Fotos" description="La primera es la portada. JPG, PNG, WEBP o GIF de hasta 8 MB." />
          {images.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image, index) => (
                <li key={image.key} className="flex flex-col gap-2 rounded-2xl border border-dash-line p-2">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                    {index === 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-dash-ink px-2 py-0.5 text-[11px] font-semibold text-dash-on-ink">
                        Portada
                      </span>
                    ) : null}
                  </div>
                  <input
                    value={image.alt}
                    onChange={(event) =>
                      setImages((current) =>
                        current.map((entry) => (entry.key === image.key ? { ...entry, alt: event.target.value } : entry)),
                      )
                    }
                    className={`${adminInputClass} h-10 text-sm`}
                    placeholder="Qué se ve en la foto"
                    aria-label="Texto alternativo"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        aria-label="Mover antes"
                        className={adminButtonClass({ variant: "ghost", size: "icon-sm" })}
                      >
                        <HugeiconsIcon icon={ArrowUp01Icon} size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === images.length - 1}
                        aria-label="Mover después"
                        className={adminButtonClass({ variant: "ghost", size: "icon-sm" })}
                      >
                        <HugeiconsIcon icon={ArrowDown01Icon} size={18} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(image)}
                      aria-label="Quitar foto"
                      className={adminButtonClass({ variant: "danger-ghost", size: "icon-sm" })}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className={adminButtonClass({ variant: "outline", size: "sm" })}>
              <HugeiconsIcon icon={ImageAdd01Icon} size={16} />
              Subir fotos
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            <div className="flex min-w-0 flex-1 gap-2">
              <input
                value={imageLink}
                onChange={(event) => setImageLink(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  addImageLink();
                }}
                className={adminInputClass}
                inputMode="url"
                placeholder="O pega el enlace de una imagen (https://…)"
                aria-label="Enlace de una imagen"
              />
              <AdminButton variant="outline" size="sm" onClick={addImageLink} disabled={!imageLink.trim()}>
                Agregar
              </AdminButton>
            </div>
          </div>
        </section>

        <details className="rounded-2xl border border-dash-line p-4">
          <summary className="cursor-pointer text-[15px] font-semibold text-dash-ink">Buscadores (opcional)</summary>
          <div className="mt-4 flex flex-col gap-4">
            <Field label="Título para buscadores" hint="Vacío = el nombre del producto.">
              <input
                value={form.metaTitle}
                onChange={(event) => set("metaTitle", event.target.value)}
                className={adminInputClass}
                maxLength={70}
              />
            </Field>
            <Field label="Descripción para buscadores" hint="Vacío = la descripción corta.">
              <textarea
                value={form.metaDescription}
                onChange={(event) => set("metaDescription", event.target.value)}
                className={adminTextareaClass}
                maxLength={170}
              />
            </Field>
          </div>
        </details>
      </div>
      <ModalPortal>
        <ConfirmModal
          isOpen={confirmDiscard}
          onClose={() => setConfirmDiscard(false)}
          onConfirm={() => {
            setConfirmDiscard(false);
            onClose();
          }}
          title="Descartar cambios"
          message="Tienes cambios sin guardar en este producto. ¿Cerrar sin guardarlos?"
          confirmText="Descartar"
          cancelText="Seguir editando"
          confirmButtonColor="red"
          stackedOverModal
        />
      </ModalPortal>
      {product ? (
        <ModalPortal>
          <ConfirmModal
            isOpen={confirmDelete}
            onClose={() => {
              if (!saving) setConfirmDelete(false);
            }}
            onConfirm={() => void handleDelete()}
            title="Borrar producto"
            message={`¿Borrar "${product.name}"? Se borran también sus variantes y fotos. No se puede deshacer.`}
            confirmText="Borrar"
            cancelText="Cancelar"
            isLoading={saving}
            confirmButtonColor="red"
            stackedOverModal
          />
        </ModalPortal>
      ) : null}
    </AdminModal>
  );
}
