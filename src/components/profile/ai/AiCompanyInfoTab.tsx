"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import {
  UPDATE_SAAS_COMPANY_MUTATION,
  type UpdateSaasCompanyResponse,
  type UpdateSaasCompanyVariables,
} from "kadesh/utils/queries";
import {
  KADESH_URIM_AI_NAME,
  ONBOARDING_CONTEXT_FIELDS,
  type OnboardingContextKey,
} from "./constants";
import {
  COMPANY_AI_SETTINGS_QUERY,
  type CompanyAiSettingsResponse,
  type CompanyAiSettingsVariables,
} from "./queries";

const TEXTAREA_CLASS =
  "w-full min-h-[100px] px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-y";

const EMPTY_VALUES: Record<OnboardingContextKey, string> = {
  onboardingMainOffer: "",
  onboardingIdealCustomer: "",
  onboardingAvgTicketValue: "",
  onboardingSalesPain: "",
};

type AiCompanyInfoTabProps = {
  companyId: string;
};

/**
 * Perfil comercial de la empresa para Kadesh AI: oferta, cliente ideal, ticket y adquisición.
 */
export function AiCompanyInfoTab({ companyId }: AiCompanyInfoTabProps) {
  const { data, loading } = useQuery<
    CompanyAiSettingsResponse,
    CompanyAiSettingsVariables
  >(COMPANY_AI_SETTINGS_QUERY, {
    variables: { id: companyId },
    skip: !companyId,
  });

  const saved = data?.saasCompany ?? null;
  const [values, setValues] =
    useState<Record<OnboardingContextKey, string>>(EMPTY_VALUES);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!saved) {
      setValues(EMPTY_VALUES);
      return;
    }
    setValues({
      onboardingMainOffer: saved.onboardingMainOffer ?? "",
      onboardingIdealCustomer: saved.onboardingIdealCustomer ?? "",
      onboardingAvgTicketValue: saved.onboardingAvgTicketValue ?? "",
      onboardingSalesPain: saved.onboardingSalesPain ?? "",
    });
  }, [
    saved?.id,
    saved?.onboardingMainOffer,
    saved?.onboardingIdealCustomer,
    saved?.onboardingAvgTicketValue,
    saved?.onboardingSalesPain,
  ]);

  const isDirty = Boolean(
    saved &&
      ONBOARDING_CONTEXT_FIELDS.some(
        (field) =>
          (values[field.key] || "") !== (saved[field.key] ?? ""),
      ),
  );

  const [updateCompany, { loading: saving }] = useMutation<
    UpdateSaasCompanyResponse,
    UpdateSaasCompanyVariables
  >(UPDATE_SAAS_COMPANY_MUTATION);

  const handleSave = async () => {
    if (!saved?.id || !isDirty) return;
    setFormError("");
    try {
      const result = await updateCompany({
        variables: {
          where: { id: saved.id },
          data: {
            onboardingMainOffer: values.onboardingMainOffer.trim() || null,
            onboardingIdealCustomer:
              values.onboardingIdealCustomer.trim() || null,
            onboardingAvgTicketValue:
              values.onboardingAvgTicketValue.trim() || null,
            onboardingSalesPain: values.onboardingSalesPain.trim() || null,
          },
        },
        refetchQueries: [
          { query: COMPANY_AI_SETTINGS_QUERY, variables: { id: companyId } },
        ],
      });
      if (!result.data?.updateSaasCompany) {
        const message = "No se pudo guardar la información.";
        setFormError(message);
        sileo.error({ title: message });
        return;
      }
      sileo.success({ title: `Información guardada para ${KADESH_URIM_AI_NAME}` });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo guardar la información.";
      setFormError(message);
      sileo.error({ title: message });
    }
  };

  if (loading && !saved) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[#e0e0e0] bg-white py-16 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
        <span className="size-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#212121] dark:text-white">
            Información
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
            {KADESH_URIM_AI_NAME} ya conoce tu negocio con lo que vas dejando
            aquí y usando Kadesh: qué vendes, a quién, el ticket y cómo cierras.
          </p>
        </div>
        {isDirty ? (
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {saving ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : (
              "Guardar información"
            )}
          </button>
        ) : null}
      </div>

      {formError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {formError}
        </div>
      ) : null}

      <div className="space-y-6">
        {ONBOARDING_CONTEXT_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                className="size-4 shrink-0 text-orange-500 dark:text-orange-400"
              />
              {field.title}
            </label>
            <textarea
              value={values[field.key]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              placeholder={field.placeholder}
              className={TEXTAREA_CLASS}
              rows={3}
              disabled={saving}
            />
          </div>
        ))}
      </div>

      {isDirty ? (
        <div className="flex justify-center pt-6 sm:justify-end">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {saving ? "Guardando..." : "Guardar información"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
