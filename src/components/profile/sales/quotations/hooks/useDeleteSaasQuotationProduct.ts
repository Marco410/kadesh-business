"use client";

import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import {
  DELETE_SAAS_QUOTATION_PRODUCT_MUTATION,
  SAAS_QUOTATION_DETAIL_QUERY,
  type DeleteSaasQuotationProductResponse,
  type DeleteSaasQuotationProductVariables,
} from "../queries";

export function useDeleteSaasQuotationProduct() {
  const [mutate, { loading }] = useMutation<
    DeleteSaasQuotationProductResponse,
    DeleteSaasQuotationProductVariables
  >(DELETE_SAAS_QUOTATION_PRODUCT_MUTATION, {
    onError: (err) => {
      sileo.error({
        title: err.message || "No se pudo eliminar el concepto.",
      });
    },
  });

  function deleteQuotationProduct(
    productId: string,
    options?: {
      onCompleted?: () => void;
      quotationDetailId?: string | null;
    },
  ) {
    const qid = options?.quotationDetailId?.trim();
    void mutate({
      variables: { where: { id: productId } },
      ...(qid
        ? {
            refetchQueries: [
              {
                query: SAAS_QUOTATION_DETAIL_QUERY,
                variables: { where: { id: qid } },
              },
            ],
            awaitRefetchQueries: true,
          }
        : {}),
    })
      .then((result) => {
        if (result.errors?.length) {
          sileo.error({
            title: result.errors.map((e) => e.message).join(", "),
          });
          return;
        }
        sileo.success({ title: "Concepto eliminado." });
        options?.onCompleted?.();
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "No se pudo eliminar el concepto.";
        sileo.error({ title: message });
      });
  }

  return { deleteQuotationProduct, loading };
}
