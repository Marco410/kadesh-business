"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Idea01Icon,
  SparklesIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import {
  UPDATE_SAAS_COMPANY_MUTATION,
  type UpdateSaasCompanyResponse,
  type UpdateSaasCompanyVariables,
} from "kadesh/utils/queries";
import { useApplyOnKeyChange } from "kadesh/utils/useApplyOnKeyChange";
import { cn } from "kadesh/utils/cn";
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
import {
  PILLAR_GUIDE_POINTS,
  PILLAR_POINTS,
  draftCoverage,
} from "./companyKnowledge";
import { useCompanyKnowledge } from "./useCompanyKnowledge";
import { AiMeter, AiSegmentMeter } from "./AiVisuals";
import { aiMotionTransition, aiTabSwitchTransition } from "./motion";

const TEXTAREA_CLASS =
  "w-full min-h-[150px] px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#9e9e9e] dark:placeholder:text-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed resize-y";

const EMPTY_VALUES: Record<OnboardingContextKey, string> = {
  onboardingMainOffer: "",
  onboardingIdealCustomer: "",
  onboardingAvgTicketValue: "",
  onboardingSalesPain: "",
};

const DETAIL_LABELS = ["Sin responder", "Básico", "Bien", "Muy completo"];

type AiCompanyInfoTabProps = {
  companyId: string;
  initialStep?: OnboardingContextKey;
  onOpenDashboard: () => void;
};

/**
 * Perfil comercial de la empresa para Kadesh AI, una pregunta a la vez:
 * oferta, cliente ideal, ticket y adquisición. Cada respuesta guardada queda con check.
 */
export function AiCompanyInfoTab({
  companyId,
  initialStep,
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
  const [stepIndex, setStepIndex] = useState<number | null>(() => {
    if (!initialStep) return null;
    const index = ONBOARDING_CONTEXT_FIELDS.findIndex(
      (field) => field.key === initialStep,
    );
    return index >= 0 ? index : null;
  });
  const [finished, setFinished] = useState(false);

  useApplyOnKeyChange(
    [
      saved?.id,
      saved?.onboardingMainOffer,
      saved?.onboardingIdealCustomer,
      saved?.onboardingAvgTicketValue,
      saved?.onboardingSalesPain,
    ].join("\0"),
    () => {
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
    },
  );

  // Sin paso elegido, abre en la primera pregunta sin responder.
  if (saved && stepIndex === null) {
    const firstEmpty = ONBOARDING_CONTEXT_FIELDS.findIndex(
      (field) => !saved[field.key]?.trim(),
    );
    setStepIndex(firstEmpty >= 0 ? firstEmpty : 0);
  }

  const isDirty = Boolean(
    saved &&
      ONBOARDING_CONTEXT_FIELDS.some(
        (field) => (values[field.key] || "") !== (saved[field.key] ?? ""),
      ),
  );

  const [updateCompany, { loading: saving }] = useMutation<
    UpdateSaasCompanyResponse,
    UpdateSaasCompanyVariables
  >(UPDATE_SAAS_COMPANY_MUTATION);

  // El brief de “Lo que sabe” se regenera al abrir Dashboard si el perfil cambió
  // (`AiCompanyKnowledgeCard`), así un paso a paso no llama a la IA 4 veces.
  const save = async (): Promise<boolean> => {
    if (!saved?.id) return false;
    if (!isDirty) return true;
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
        awaitRefetchQueries: true,
      });
      if (!result.data?.updateSaasCompany) {
        const message =
          "No se pudo guardar. Revisa tu respuesta e inténtalo de nuevo.";
        setFormError(message);
        sileo.error({ title: message });
        return false;
      }
      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo guardar. Inténtalo de nuevo.";
      setFormError(message);
      sileo.error({ title: message });
      return false;
    }
  };

  if ((loading && !saved) || stepIndex === null) {
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
    <AiCompanyInfoWizard
      companyId={companyId}
      saved={saved}
      values={values}
      setValues={(key, value) => {
        setFinished(false);
        setValues((current) => ({ ...current, [key]: value }));
      }}
      stepIndex={stepIndex}
      setStepIndex={setStepIndex}
      isDirty={isDirty}
      saving={saving}
      formError={formError}
      finished={finished}
      onSave={save}
      onFinish={() => setFinished(true)}
      onOpenDashboard={onOpenDashboard}
    />
  );
}

function AiCompanyInfoWizard({
  companyId,
  saved,
  values,
  setValues,
  stepIndex,
  setStepIndex,
  isDirty,
  saving,
  formError,
  finished,
  onSave,
  onFinish,
  onOpenDashboard,
}: {
  companyId: string;
  saved: CompanyAiSettingsResponse["saasCompany"];
  values: Record<OnboardingContextKey, string>;
  setValues: (key: OnboardingContextKey, value: string) => void;
  stepIndex: number;
  setStepIndex: (index: number) => void;
  isDirty: boolean;
  saving: boolean;
  formError: string;
  finished: boolean;
  onSave: () => Promise<boolean>;
  onFinish: () => void;
  onOpenDashboard: () => void;
}) {
  const reduce = useReducedMotion();
  const knowledge = useCompanyKnowledge(companyId);
  const fields = ONBOARDING_CONTEXT_FIELDS;
  const field = fields[stepIndex];
  const isLast = stepIndex === fields.length - 1;
  const value = values[field.key];
  const savedValue = saved?.[field.key] ?? "";
  const stepDirty = value !== savedValue;
  const answeredCount = fields.filter((item) => saved?.[item.key]?.trim())
    .length;
  const detail = draftCoverage(value);
  const pillar = knowledge.coverage.find((item) => item.key === field.key);
  const aiGaps = pillar?.fromAi ? pillar.gaps : [];
  const showAiGaps = !stepDirty && aiGaps.length > 0;

  const goNext = async () => {
    const ok = await onSave();
    if (!ok) return;
    if (isLast) {
      onFinish();
      return;
    }
    setStepIndex(stepIndex + 1);
  };

  const primaryLabel = isDirty
    ? isLast
      ? "Guardar y terminar"
      : "Guardar y seguir"
    : isLast
      ? "Terminar"
      : value.trim()
        ? "Siguiente"
        : "Saltar por ahora";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[#212121] dark:text-white">
              Cuéntale a {KADESH_URIM_AI_NAME} de tu negocio
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
              4 preguntas cortas. Con tus respuestas arma tu resumen del día y
              tus recomendaciones.
            </p>
          </div>
          <div className="w-full shrink-0 sm:w-56">
            <p className="mb-1.5 text-right text-xs text-[#616161] dark:text-[#b0b0b0]">
              <span className="font-semibold text-[#212121] dark:text-white">
                {answeredCount} de {fields.length}
              </span>{" "}
              respondidas
            </p>
            <AiMeter
              value={(answeredCount / fields.length) * 100}
              label="Preguntas respondidas"
            />
          </div>
        </div>

        <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Preguntas">
          {fields.map((item, index) => {
            const done = Boolean(saved?.[item.key]?.trim());
            const active = index === stepIndex;
            const pending = values[item.key] !== (saved?.[item.key] ?? "");
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setStepIndex(index)}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "flex w-full flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-center transition-colors sm:flex-row sm:gap-2.5 sm:px-3 sm:text-left",
                    active
                      ? "border-violet-400 bg-violet-50 dark:border-violet-500/60 dark:bg-violet-500/10"
                      : "border-[#ececec] hover:border-[#d6d6d6] dark:border-[#2e2e2e] dark:hover:border-[#4a4a4a]",
                  )}
                >
                  <span
                    className={cn(
                      "relative flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "ai-urim-fill"
                          : "bg-[#efefef] text-[#616161] dark:bg-[#2e2e2e] dark:text-[#b0b0b0]",
                    )}
                  >
                    {done ? (
                      <HugeiconsIcon icon={Tick02Icon} size={14} />
                    ) : (
                      index + 1
                    )}
                    {pending ? (
                      <span
                        className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white bg-orange-500 dark:border-[#1e1e1e]"
                        title="Cambios sin guardar"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-[#212121] dark:text-white sm:text-sm">
                      {item.shortLabel}
                    </span>
                    <span className="hidden truncate text-xs text-[#616161] dark:text-[#b0b0b0] sm:block">
                      {done ? "Respondida" : item.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <AnimatePresence>
          {finished && !isDirty ? (
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
                {answeredCount === fields.length
                  ? `Listo. ${KADESH_URIM_AI_NAME} ya tiene las 4 respuestas de tu negocio.`
                  : `Guardado. Te faltan ${fields.length - answeredCount} pregunta${fields.length - answeredCount === 1 ? "" : "s"}; puedes volver cuando quieras.`}
              </p>
              <button
                type="button"
                onClick={onOpenDashboard}
                className="inline-flex shrink-0 items-center justify-center gap-1 text-sm font-semibold text-orange-600 hover:underline dark:text-orange-400"
              >
                Ver lo que sabe en Dashboard
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <AnimatePresence mode="wait">
        <motion.section
          key={field.key}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={aiTabSwitchTransition(reduce)}
          className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-6"
        >
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
            Pregunta {stepIndex + 1} de {fields.length} · {field.label}
          </p>
          <label
            htmlFor={field.key}
            className="mt-1 block text-xl font-semibold text-[#212121] dark:text-white"
          >
            {field.question}
          </label>
          <p className="mt-1 text-sm text-[#616161] dark:text-[#b0b0b0]">
            {field.hint}
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="min-w-0">
              <textarea
                id={field.key}
                value={value}
                onChange={(event) => setValues(field.key, event.target.value)}
                placeholder={field.example}
                className={TEXTAREA_CLASS}
                rows={6}
                disabled={saving}
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs text-[#616161] dark:text-[#b0b0b0]">
                  <AiSegmentMeter covered={detail} total={PILLAR_POINTS} />
                  Nivel de detalle:{" "}
                  <span className="font-medium text-[#212121] dark:text-white">
                    {DETAIL_LABELS[detail]}
                  </span>
                </span>
                {stepDirty ? (
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    Sin guardar
                  </span>
                ) : savedValue.trim() ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <HugeiconsIcon icon={Tick02Icon} size={12} />
                    Guardada
                  </span>
                ) : null}
              </div>
            </div>

            <aside className="rounded-xl bg-[#fafafa] p-3.5 dark:bg-[#252525]">
              {showAiGaps ? (
                <>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[#212121] dark:text-white">
                    <span className="ai-urim-icon">
                      <HugeiconsIcon icon={SparklesIcon} size={16} />
                    </span>
                    {KADESH_URIM_AI_NAME} aún no sabe
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {aiGaps.map((gap) => (
                      <li
                        key={gap}
                        className="flex gap-2 text-sm leading-snug text-[#616161] dark:text-[#b0b0b0]"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-violet-400"
                        />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[#212121] dark:text-white">
                    <HugeiconsIcon
                      icon={Idea01Icon}
                      size={16}
                      className="text-orange-500"
                    />
                    Para una buena respuesta, menciona
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {PILLAR_GUIDE_POINTS[field.key].map((point) => (
                      <li
                        key={point}
                        className="flex gap-2 text-sm leading-snug text-[#616161] dark:text-[#b0b0b0]"
                      >
                        <span
                          aria-hidden
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-orange-400"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </aside>
          </div>

          <AnimatePresence>
            {formError ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
              >
                {formError}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-[#ececec] pt-4 dark:border-[#2a2a2a] sm:flex-row sm:items-center sm:justify-between">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={() => setStepIndex(stepIndex - 1)}
                disabled={saving}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-[#616161] hover:bg-[#f5f5f5] disabled:opacity-60 dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                Anterior
              </button>
            ) : (
              <span className="hidden sm:block" />
            )}
            <button
              type="button"
              onClick={() => void goNext()}
              disabled={saving}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70",
                isDirty || value.trim()
                  ? "bg-orange-500 text-white hover:bg-orange-600"
                  : "border border-[#e0e0e0] text-[#616161] hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a]",
              )}
            >
              {saving ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Guardando…
                </>
              ) : (
                <>
                  {primaryLabel}
                  {!isLast ? (
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  ) : null}
                </>
              )}
            </button>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
