"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Edit02Icon,
} from "@hugeicons/core-free-icons";
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
import { useRefreshCompanyAiBrief } from "./useRefreshCompanyAiBrief";
import {
  aiFadeUpVariants,
  aiMotionTransition,
  aiStaggerContainer,
} from "./motion";

const TEXTAREA_CLASS =
  "w-full min-h-[120px] px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-y";

const EMPTY_VALUES: Record<OnboardingContextKey, string> = {
  onboardingMainOffer: "",
  onboardingIdealCustomer: "",
  onboardingAvgTicketValue: "",
  onboardingSalesPain: "",
};

type AiCompanyInfoTabProps = {
  companyId: string;
  onOpenDashboard: () => void;
};

/**
 * Perfil comercial de la empresa para Kadesh AI: oferta, cliente ideal, ticket y adquisición.
 */
export function AiCompanyInfoTab({
  companyId,
  onOpenDashboard,
}: AiCompanyInfoTabProps) {
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
  const [justSaved, setJustSaved] = useState(false);

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
        (field) => (values[field.key] || "") !== (saved[field.key] ?? ""),
      ),
  );

  const { refresh: refreshBrief } = useRefreshCompanyAiBrief(companyId);

  const [updateCompany, { loading: saving }] = useMutation<
    UpdateSaasCompanyResponse,
    UpdateSaasCompanyVariables
  >(UPDATE_SAAS_COMPANY_MUTATION);

  const handleSave = async () => {
    if (!saved?.id || !isDirty) return;
    setFormError("");
    setJustSaved(false);
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
        const message = "No se pudo guardar. Revisa los recuadros e inténtalo de nuevo.";
        setFormError(message);
        sileo.error({ title: message });
        return;
      }
      sileo.success({
        title: "Perfil de negocio guardado",
        description: `El resumen de ${KADESH_URIM_AI_NAME} en Dashboard se está actualizando.`,
      });
      setJustSaved(true);
      void refreshBrief({ force: true });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo guardar. Inténtalo de nuevo.";
      setFormError(message);
      sileo.error({ title: message });
    }
  };

  if (loading && !saved) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center rounded-2xl border border-[#e0e0e0] bg-white py-16 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
      >
        <span className="size-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </motion.div>
    );
  }

  return (
    <AiCompanyInfoForm
      values={values}
      setValues={setValues}
      setJustSaved={setJustSaved}
      isDirty={isDirty}
      justSaved={justSaved}
      formError={formError}
      saving={saving}
      onSave={handleSave}
      onOpenDashboard={onOpenDashboard}
    />
  );
}

function AiCompanyInfoForm({
  values,
  setValues,
  setJustSaved,
  isDirty,
  justSaved,
  formError,
  saving,
  onSave,
  onOpenDashboard,
}: {
  values: Record<OnboardingContextKey, string>;
  setValues: React.Dispatch<
    React.SetStateAction<Record<OnboardingContextKey, string>>
  >;
  setJustSaved: (value: boolean) => void;
  isDirty: boolean;
  justSaved: boolean;
  formError: string;
  saving: boolean;
  onSave: () => void;
  onOpenDashboard: () => void;
}) {
  const reduce = useReducedMotion();
  const fadeUp = aiFadeUpVariants(reduce);

  return (
    <div className="space-y-4 pb-24">
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={aiMotionTransition(reduce)}
        className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-8"
      >
        <h3 className="text-lg font-semibold text-[#212121] dark:text-white">
          Edita el perfil de tu negocio
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
          Estos cuatro recuadros son editables. Escribe o corrige, pulsa
          Guardar, y en Dashboard verás cómo {KADESH_URIM_AI_NAME} resume tu
          empresa y qué le falta por conocer.
        </p>

        <ol className="mt-5 grid gap-3 sm:grid-cols-3 items-stretch">
          <li className="h-full rounded-xl bg-[#f7f7f7] px-3 py-3 text-sm dark:bg-[#2a2a2a]">
            <span className="font-semibold text-[#212121] dark:text-white">
              1. Edita
            </span>
            <span className="mt-1 block text-[#616161] dark:text-[#b0b0b0]">
              Haz clic en un recuadro y cambia el texto.
            </span>
          </li>
          <li className="h-full rounded-xl bg-[#f7f7f7] px-3 py-3 text-sm dark:bg-[#2a2a2a]">
            <span className="font-semibold text-[#212121] dark:text-white">
              2. Guarda
            </span>
            <span className="mt-1 block text-[#616161] dark:text-[#b0b0b0]">
              Sin guardar, Dashboard sigue con la versión anterior.
            </span>
          </li>
          <li className="h-full rounded-xl bg-[#f7f7f7] px-3 py-3 text-sm dark:bg-[#2a2a2a]">
            <span className="font-semibold text-[#212121] dark:text-white">
              3. Revisa
            </span>
            <span className="mt-1 block text-[#616161] dark:text-[#b0b0b0]">
              El resumen de tu negocio queda a la derecha en Dashboard.
            </span>
          </li>
        </ol>

        <AnimatePresence>
          {justSaved && !isDirty ? (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={aiMotionTransition(reduce)}
              className="mt-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900/60 dark:bg-emerald-950/30"
            >
            <p className="inline-flex items-start gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={18}
                className="mt-0.5 shrink-0"
              />
              Guardado. El resumen de {KADESH_URIM_AI_NAME} en Dashboard ya se
              está actualizando.
            </p>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex shrink-0 items-center justify-center gap-1 text-sm font-semibold text-orange-600 hover:underline dark:text-orange-400"
            >
              Ver en Dashboard
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
            </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
        {formError ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={aiMotionTransition(reduce)}
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
          >
            {formError}
          </motion.div>
        ) : null}
        </AnimatePresence>

        <motion.div
          className="mt-8 space-y-6"
          variants={aiStaggerContainer(reduce, 0.05)}
          initial="hidden"
          animate="show"
        >
          {ONBOARDING_CONTEXT_FIELDS.map((field) => (
            <motion.div
              key={field.key}
              variants={fadeUp}
              transition={aiMotionTransition(reduce)}
            >
              <label
                htmlFor={field.key}
                className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-[#212121] dark:text-white"
              >
                <HugeiconsIcon
                  icon={Edit02Icon}
                  className="size-4 shrink-0 text-orange-500 dark:text-orange-400"
                />
                {field.title}
              </label>
              <p className="mb-2 text-xs leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                {field.hint}
              </p>
              <textarea
                id={field.key}
                value={values[field.key]}
                onChange={(event) => {
                  setJustSaved(false);
                  setValues((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }));
                }}
                placeholder={field.placeholder}
                className={TEXTAREA_CLASS}
                rows={4}
                disabled={saving}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isDirty ? (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={aiMotionTransition(reduce)}
            className="sticky bottom-3 z-10 rounded-xl border border-orange-200 bg-white p-3 shadow-lg dark:border-orange-900/50 dark:bg-[#1e1e1e] sm:flex sm:items-center sm:justify-between sm:gap-4"
          >
            <p className="px-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Tienes cambios sin guardar. Dashboard todavía muestra la versión
              anterior.
            </p>
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={saving}
              className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto"
            >
              {saving ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando…
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
