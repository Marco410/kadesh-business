"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import {
  CREATE_SAAS_QUOTATION_PRODUCT_MUTATION,
  UPDATE_SAAS_QUOTATION_PRODUCT_MUTATION,
  type CreateSaasQuotationProductResponse,
  type CreateSaasQuotationProductVariables,
  type SaasQuotationProductRow,
  type UpdateSaasQuotationProductResponse,
  type UpdateSaasQuotationProductVariables,
} from "./queries";

const inputClassName =
  "w-full rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#2a2a2a] px-3 py-2 text-[#212121] dark:text-[#ffffff] text-sm placeholder-[#9ca3af] focus:ring-2 focus:ring-orange-500 focus:border-orange-500";
const labelClassName = "block text-sm font-medium text-[#616161] dark:text-[#b0b0b0] mb-1.5";

function parseNum(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export interface QuotationProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode: "create" | "edit";
  product: SaasQuotationProductRow | null;
  presetQuotationId?: string | null;
}

export default function QuotationProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  product,
  presetQuotationId = null,
}: QuotationProductFormModalProps) {
  const [quotationId, setQuotationId] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && product) {
      setQuotationId(product.quotation?.id ?? "");
      setDescription(product.description ?? "");
      setUnitPrice(
        product.unitPrice != null ? String(product.unitPrice) : "",
      );
      setQuantity(product.quantity != null ? String(product.quantity) : "");
      setTaxRate(product.taxRate != null ? String(product.taxRate) : "");
      setDiscountType(product.discountType ?? "");
      setDiscountValue(
        product.discountValue != null ? String(product.discountValue) : "",
      );
    } else {
      setQuotationId(presetQuotationId?.trim() ?? "");
      setDescription("");
      setUnitPrice("");
      setQuantity("");
      setTaxRate("");
      setDiscountType("");
      setDiscountValue("");
    }
  }, [isOpen, mode, product, presetQuotationId]);

  const [createProduct, { loading: creating }] = useMutation<
    CreateSaasQuotationProductResponse,
    CreateSaasQuotationProductVariables
  >(CREATE_SAAS_QUOTATION_PRODUCT_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Producto / servicio creado." });
      onSuccess?.();
      handleClose();
    },
    onError: (err) => {
      sileo.error({
        title: err.message || "No se pudo crear el ítem.",
      });
    },
  });

  const [updateProduct, { loading: updating }] = useMutation<
    UpdateSaasQuotationProductResponse,
    UpdateSaasQuotationProductVariables
  >(UPDATE_SAAS_QUOTATION_PRODUCT_MUTATION, {
    onCompleted: () => {
      sileo.success({ title: "Cambios guardados." });
      onSuccess?.();
      handleClose();
    },
    onError: (err) => {
      sileo.error({
        title: err.message || "No se pudo actualizar el ítem.",
      });
    },
  });

  function handleClose() {
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const up = parseNum(unitPrice);
    const qty = parseNum(quantity);
    const tax = parseNum(taxRate);
    const discVal = parseNum(discountValue);
    const discType = discountType.trim() || null;

    if (mode === "create") {
      const qid = (presetQuotationId?.trim() || quotationId.trim());
      if (!qid) {
        sileo.error({ title: "Indica el ID de la cotización." });
        return;
      }
      if (up == null || qty == null) {
        sileo.error({ title: "Precio unitario y cantidad son obligatorios." });
        return;
      }
      createProduct({
        variables: {
          data: {
            quotation: { connect: { id: qid } },
            description: description.trim() || null,
            unitPrice: up,
            quantity: qty,
            taxRate: tax,
            discountType: discType,
            discountValue: discVal,
          },
        },
      });
      return;
    }

    if (!product?.id) return;
    if (up == null || qty == null) {
      sileo.error({ title: "Precio unitario y cantidad son obligatorios." });
      return;
    }
    updateProduct({
      variables: {
        where: { id: product.id },
        data: {
          description: description.trim() || null,
          unitPrice: up,
          quantity: qty,
          taxRate: tax,
          discountType: discType,
          discountValue: discVal,
        },
      },
    });
  }

  const saving = creating || updating;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="qp-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[95] flex items-center justify-center p-4"
        onClick={handleClose}
      />
      <motion.div
        key="qp-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-[#ffffff] dark:bg-[#1e1e1e] rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden pointer-events-auto border border-[#e0e0e0] dark:border-[#3a3a3a] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quotation-product-modal-title"
        >
          <div className="flex justify-between items-center p-4 border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f5f5f5] dark:bg-[#2a2a2a]">
            <h4
              id="quotation-product-modal-title"
              className="text-lg font-bold text-[#212121] dark:text-[#ffffff]"
            >
              {mode === "create"
                ? "Agregar producto / servicio"
                : "Editar línea"}
            </h4>
            <button
              type="button"
              onClick={handleClose}
              className="text-2xl font-bold text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#e5e5e5] dark:hover:bg-[#333]"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 overflow-y-auto space-y-4 flex-1"
          >
            {mode === "create" && presetQuotationId?.trim() && (
              <div>
                <span className={labelClassName}>Cotización</span>
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] font-mono break-all">
                  {presetQuotationId.trim()}
                </p>
              </div>
            )}

            {mode === "create" && !presetQuotationId?.trim() && (
              <div>
                <label htmlFor="qp-quotation-id" className={labelClassName}>
                  ID de cotización <span className="text-red-500">*</span>
                </label>
                <input
                  id="qp-quotation-id"
                  type="text"
                  value={quotationId}
                  onChange={(e) => setQuotationId(e.target.value)}
                  placeholder="Pega el ID de la cotización padre"
                  className={inputClassName}
                  required
                />
              </div>
            )}

            {mode === "edit" && quotationId && (
              <div>
                <span className={labelClassName}>Cotización (ID)</span>
                <p className="text-sm text-[#616161] dark:text-[#b0b0b0] font-mono break-all">
                  {quotationId}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="qp-description" className={labelClassName}>
                Descripción
              </label>
              <textarea
                id="qp-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Concepto o descripción del ítem"
                className={inputClassName}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="qp-unit-price" className={labelClassName}>
                  Precio unitario <span className="text-red-500">*</span>
                </label>
                <input
                  id="qp-unit-price"
                  type="text"
                  inputMode="decimal"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  className={inputClassName}
                  required
                />
              </div>
              <div>
                <label htmlFor="qp-qty" className={labelClassName}>
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  id="qp-qty"
                  type="text"
                  inputMode="decimal"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  className={inputClassName}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="qp-tax" className={labelClassName}>
                  Tasa de impuesto (%)
                </label>
                <input
                  id="qp-tax"
                  type="text"
                  inputMode="decimal"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="16"
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="qp-discount-type" className={labelClassName}>
                  Tipo de descuento
                </label>
                <input
                  id="qp-discount-type"
                  type="text"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  placeholder="Ej. PERCENTAGE, FIXED"
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label htmlFor="qp-discount-value" className={labelClassName}>
                Valor del descuento
              </label>
              <input
                id="qp-discount-value"
                type="text"
                inputMode="decimal"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className={inputClassName}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-[#e0e0e0] dark:border-[#3a3a3a]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-[#212121] dark:text-[#ffffff] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none"
              >
                {saving ? "Guardando…" : mode === "create" ? "Crear" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
