"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  EyeIcon,
  FlashIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { Routes } from "kadesh/core/routes";
import { formatDateShort } from "kadesh/utils/format-date";
import { useRemainingCredits } from "kadesh/components/panel/hooks";
import {
  KADESH_URIM_AI_NAME,
  AI_BILLING_MODE,
  AI_BILLING_MODE_OPTIONS,
  AI_MANAGED_MAX_PER_DAY,
  AI_MANAGED_MAX_PER_MINUTE,
  AI_OUTPUT_TOKEN_WEIGHT,
  AI_PROVIDER_OPTIONS,
  AI_TOKENS_PER_CREDIT,
  DEFAULT_AI_MODELS,
  ONBOARDING_CONTEXT_FIELDS,
  TYPICAL_DIGEST_CREDITS,
  isAiBillingMode,
  isAiProviderKey,
  type AiBillingMode,
  type AiProviderKey,
} from "./constants";
import { ByokApiKeyGuide } from "./ByokApiKeyGuide";
import {
  COMPANY_AI_SETTINGS_QUERY,
  COMPANY_AI_LIVE_QUERY,
  TEST_COMPANY_AI_CONNECTION_MUTATION,
  UPDATE_COMPANY_AI_SETTINGS_MUTATION,
  type CompanyAiSettingsResponse,
  type CompanyAiSettingsVariables,
  type TestCompanyAiConnectionResponse,
  type TestCompanyAiConnectionVariables,
  type UpdateCompanyAiSettingsResponse,
  type UpdateCompanyAiSettingsVariables,
} from "./queries";

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed";

function formatCreditPeriod(year: number | null, month: number | null): string {
  if (!year || !month) return "";
  return new Date(year, month - 1, 1).toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });
}

function defaultModelForProvider(provider: string): string {
  if (!isAiProviderKey(provider)) return "";
  return DEFAULT_AI_MODELS[provider];
}

export interface AiSettingsSectionProps {
  companyId: string | null;
  onOpenCompanyInfo?: () => void;
}

/**
 * Settings de Kadesh Urim AI a nivel empresa: BYOK vs administrado, proveedor, API key y prueba de conexión.
 */
export function AiSettingsSection({
  companyId,
  onOpenCompanyInfo,
}: AiSettingsSectionProps) {
  const { data, loading, refetch } = useQuery<
    CompanyAiSettingsResponse,
    CompanyAiSettingsVariables
  >(COMPANY_AI_SETTINGS_QUERY, {
    variables: { id: companyId ?? "" },
    skip: !companyId,
  });

  const saved = data?.saasCompany ?? null;

  const {
    remainingQuota,
    extraCredits,
    planLeadLimit,
    year,
    month,
    loading: creditsLoading,
  } = useRemainingCredits(companyId);

  const [billingMode, setBillingMode] = useState<AiBillingMode>(
    AI_BILLING_MODE.BYOK,
  );
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [confirmClearKey, setConfirmClearKey] = useState(false);
  const [formError, setFormError] = useState("");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!saved) {
      setBillingMode(AI_BILLING_MODE.BYOK);
      setProvider("");
      setModel("");
      setApiKey("");
      setShowApiKey(false);
      setConfirmClearKey(false);
      setFormError("");
      setTestResult(null);
      return;
    }
    const nextMode = saved.aiBillingMode ?? "";
    setBillingMode(isAiBillingMode(nextMode) ? nextMode : AI_BILLING_MODE.BYOK);
    setProvider(saved.aiProvider ?? "");
    setModel(saved.aiModel ?? "");
    setApiKey("");
    setShowApiKey(false);
    setConfirmClearKey(false);
    setFormError("");
    setTestResult(null);
  }, [
    saved?.id,
    saved?.aiBillingMode,
    saved?.aiProvider,
    saved?.aiModel,
    saved?.aiApiKeyPreview,
    saved?.aiKeyUpdatedAt,
  ]);

  const [updateSettings, { loading: saving }] = useMutation<
    UpdateCompanyAiSettingsResponse,
    UpdateCompanyAiSettingsVariables
  >(UPDATE_COMPANY_AI_SETTINGS_MUTATION);

  const [testConnection, { loading: testing }] = useMutation<
    TestCompanyAiConnectionResponse,
    TestCompanyAiConnectionVariables
  >(TEST_COMPANY_AI_CONNECTION_MUTATION);

  const savedModeRaw = saved?.aiBillingMode ?? "";
  const savedBillingMode = isAiBillingMode(savedModeRaw)
    ? savedModeRaw
    : AI_BILLING_MODE.BYOK;
  const savedProvider = saved?.aiProvider ?? "";
  const savedModel = saved?.aiModel ?? "";
  const hasSavedKey = Boolean(saved?.aiApiKeyPreview);

  const isDirty = Boolean(
    saved &&
    (billingMode !== savedBillingMode ||
      provider !== savedProvider ||
      model.trim() !== savedModel.trim() ||
      apiKey.trim() !== ""),
  );

  const missingContext = useMemo(() => {
    if (!saved) return ONBOARDING_CONTEXT_FIELDS.map((field) => field.label);
    return ONBOARDING_CONTEXT_FIELDS.filter((field) => {
      const value = saved[field.key];
      return !value?.trim();
    }).map((field) => field.label);
  }, [saved]);

  const contextComplete = missingContext.length === 0;
  const isManaged = billingMode === AI_BILLING_MODE.MANAGED;
  const modelPlaceholder =
    defaultModelForProvider(provider) || "Modelo default del proveedor";
  const creditPeriod = formatCreditPeriod(year, month);
  const busy = saving || testing;

  const persistSettings = async (overrides?: {
    apiKey?: string;
    clearKey?: boolean;
  }) => {
    if (!companyId) return false;
    const nextKey = overrides?.clearKey
      ? ""
      : overrides?.apiKey !== undefined
        ? overrides.apiKey
        : apiKey.trim();
    const shouldSendKey = overrides?.clearKey || nextKey !== "";

    if (
      billingMode === AI_BILLING_MODE.BYOK &&
      (shouldSendKey ? nextKey !== "" : hasSavedKey) &&
      !provider
    ) {
      setFormError(
        "Elige un proveedor (Claude, OpenAI o Gemini) antes de guardar la API key.",
      );
      return false;
    }

    setFormError("");
    try {
      const result = await updateSettings({
        variables: {
          input: {
            companyId,
            billingMode,
            provider: provider || null,
            model: model.trim() || null,
            ...(shouldSendKey ? { apiKey: nextKey } : {}),
          },
        },
        refetchQueries: [
          { query: COMPANY_AI_LIVE_QUERY, variables: { companyId } },
        ],
      });
      const payload = result.data?.updateCompanyAiSettings;
      if (!payload?.success) {
        const message =
          payload?.message || "No se pudo guardar la configuración.";
        setFormError(message);
        sileo.error({ title: message });
        return false;
      }
      setApiKey("");
      setConfirmClearKey(false);
      await refetch();
      sileo.success({
        title: payload.message || "Configuración de IA guardada",
      });
      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo guardar la configuración.";
      setFormError(message);
      sileo.error({ title: message });
      return false;
    }
  };

  const handleSave = async () => {
    if (!isDirty) return;
    await persistSettings();
  };

  const handleClearKey = async () => {
    if (!confirmClearKey) {
      setConfirmClearKey(true);
      return;
    }
    await persistSettings({ clearKey: true });
  };

  const handleTestConnection = async () => {
    if (!companyId || isDirty) return;
    setTestResult(null);
    try {
      const result = await testConnection({
        variables: { companyId },
        refetchQueries: [
          { query: COMPANY_AI_LIVE_QUERY, variables: { companyId } },
        ],
      });
      const payload = result.data?.testCompanyAiConnection;
      const success = payload?.success ?? false;
      const message = success
        ? `Conexión OK con ${KADESH_URIM_AI_NAME}`
        : payload?.message || "No se pudo probar la conexión.";
      setTestResult({ success, message });
      if (success) {
        sileo.success({ title: message });
      } else {
        sileo.error({ title: message });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo probar la conexión.";
      setTestResult({ success: false, message });
      sileo.error({ title: message });
    }
  };

  const saveAndTest = (
    <>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={busy || !isDirty}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Guardando...
            </>
          ) : (
            "Guardar configuración"
          )}
        </button>
        <button
          type="button"
          onClick={() => void handleTestConnection()}
          disabled={busy || isDirty}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e0e0e0] px-5 py-2.5 text-sm font-semibold text-[#212121] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#3a3a3a] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
        >
          {testing ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              Probando...
            </>
          ) : (
            <>
              <HugeiconsIcon icon={FlashIcon} size={16} />
              Probar conexión
            </>
          )}
        </button>
      </div>
      {isDirty && (
        <p className="mt-2 text-xs text-[#616161] dark:text-[#b0b0b0]">
          Guarda los cambios para poder probar la conexión con la configuración
          nueva.
        </p>
      )}
      {testResult && (
        <div
          className={`mt-5 rounded-xl border p-4 text-sm ${
            testResult.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          <p className="flex items-start gap-2 font-medium">
            <HugeiconsIcon
              icon={testResult.success ? CheckmarkCircle02Icon : FlashIcon}
              size={18}
              className="mt-0.5 shrink-0"
            />
            {testResult.message}
          </p>
        </div>
      )}
    </>
  );

  if (loading && !saved) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-[#e0e0e0] bg-white py-16 dark:border-[#3a3a3a] dark:bg-[#1e1e1e]">
        <div className="text-center">
          <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="mt-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
            Cargando {KADESH_URIM_AI_NAME}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`rounded-2xl border p-5 sm:p-6 ${
          contextComplete
            ? "border-[#e0e0e0] bg-white dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
            : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
        }`}
      >
        <h3 className="text-sm font-semibold text-[#212121] dark:text-white">
          Contexto de tu negocio
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
          {contextComplete
            ? `${KADESH_URIM_AI_NAME} ya tiene el perfil de tu empresa: oferta, cliente ideal, ticket y cómo vendes.`
            : `Cuéntale a ${KADESH_URIM_AI_NAME} qué vendes, a quién y cómo cierras. Lo que agregues aquí y lo que uses en Kadesh es lo que ya sabe de tu negocio.`}
        </p>
        {!contextComplete && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#616161] dark:text-[#b0b0b0]">
            {missingContext.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        )}
        {onOpenCompanyInfo ? (
          <button
            type="button"
            onClick={onOpenCompanyInfo}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            {contextComplete ? "Editar información" : "Completar información"}
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </button>
        ) : (
          <Link
            href={Routes.panelProfile}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            {contextComplete ? "Editar en el perfil" : "Completar en el perfil"}
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-8">
        {formError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
            {formError}
          </div>
        )}

        <fieldset className="min-w-0">
          <legend className="text-sm font-semibold text-[#212121] dark:text-white">
            Cómo paga tu empresa la IA
          </legend>
          <div
            role="radiogroup"
            aria-label="Modalidad de pago de IA"
            className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {AI_BILLING_MODE_OPTIONS.map((option) => {
              const selected = billingMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={busy}
                  onClick={() => setBillingMode(option.value)}
                  className={`rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1e1e1e] ${
                    selected
                      ? "border-orange-500 bg-orange-500/10 dark:bg-orange-500/15"
                      : "border-[#e0e0e0] bg-white hover:border-orange-300 dark:border-[#3a3a3a] dark:bg-[#161616] dark:hover:border-orange-500/50"
                  }`}
                >
                  <span className="block text-sm font-semibold text-[#212121] dark:text-white">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {isManaged ? (
          <>
            <div className="mt-8 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-5 dark:border-[#3a3a3a] dark:bg-[#252525]">
              <p className="text-sm font-semibold text-[#212121] dark:text-white">
                Saldo de créditos
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                Es la misma bolsa que usas para extraer leads. Probar la
                conexión no cobra.
              </p>
              <p className="mt-4 text-3xl font-bold tabular-nums text-[#212121] dark:text-white">
                {creditsLoading ? "…" : (remainingQuota ?? "—")}
                <span className="ml-2 text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
                  créditos disponibles
                </span>
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {planLeadLimit != null && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                      Incluidos en el plan
                    </dt>
                    <dd className="font-semibold tabular-nums text-[#212121] dark:text-white">
                      {planLeadLimit}
                    </dd>
                  </div>
                )}
                {extraCredits != null && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                      Recargas extra
                    </dt>
                    <dd className="font-semibold tabular-nums text-[#212121] dark:text-white">
                      {extraCredits}
                    </dd>
                  </div>
                )}
                {creditPeriod && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-medium uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                      Periodo
                    </dt>
                    <dd className="capitalize text-[#212121] dark:text-white">
                      {creditPeriod}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 space-y-3 border-t border-[#ececec] pt-4 dark:border-[#2a2a2a]">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                    Cómo se cobra
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                    1 crédito cubre{" "}
                    {AI_TOKENS_PER_CREDIT.toLocaleString("es-MX")} tokens. Los
                    tokens es lo que le mandamos a {KADESH_URIM_AI_NAME}.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9e9e9e] dark:text-[#888]">
                    Tope de uso
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                    Hasta {AI_MANAGED_MAX_PER_MINUTE} consultas por minuto y{" "}
                    {AI_MANAGED_MAX_PER_DAY} al día. Si se llena, espera un
                    momento o usa tu API key: ahí no hay este tope ni se
                    descuentan créditos de Kadesh.
                  </p>
                </div>
              </div>
              <Link
                href={Routes.panelCredits}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                Comprar créditos
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </Link>
            </div>
            {saveAndTest}
          </>
        ) : (
          <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
            <div className="min-w-0 space-y-5">
              <div>
                <label
                  htmlFor="ai-provider"
                  className="mb-2 block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]"
                >
                  Proveedor
                </label>
                <select
                  id="ai-provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  disabled={busy}
                  className={INPUT_CLASS}
                >
                  <option value="">Selecciona un proveedor</option>
                  {AI_PROVIDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="ai-api-key"
                  className="mb-2 block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]"
                >
                  API key
                </label>
                <div className="relative">
                  <input
                    id="ai-api-key"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setConfirmClearKey(false);
                    }}
                    autoComplete="new-password"
                    spellCheck={false}
                    disabled={busy}
                    placeholder={
                      hasSavedKey
                        ? `Key guardada: ${saved?.aiApiKeyPreview}`
                        : "Pega tu API key"
                    }
                    className={`${INPUT_CLASS} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#616161] transition-colors hover:bg-[#f0f0f0] hover:text-[#212121] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a] dark:hover:text-white"
                    aria-label={
                      showApiKey ? "Ocultar API key" : "Mostrar API key"
                    }
                  >
                    <HugeiconsIcon
                      icon={showApiKey ? ViewOffIcon : EyeIcon}
                      className="size-5"
                    />
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                  La key nunca se muestra completa. Déjala vacía para conservar
                  la actual; escríbela solo si quieres reemplazarla.
                </p>
                {hasSavedKey && saved?.aiKeyUpdatedAt && (
                  <p className="mt-1 text-xs text-[#9e9e9e] dark:text-[#888]">
                    Actualizada {formatDateShort(saved.aiKeyUpdatedAt)}.
                  </p>
                )}
                {hasSavedKey && (
                  <div className="mt-3">
                    {confirmClearKey ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                          ¿Quitar la API key guardada?
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleClearKey()}
                          disabled={busy}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                        >
                          Sí, quitar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClearKey(false)}
                          disabled={busy}
                          className="rounded-lg border border-[#e0e0e0] px-3 py-1.5 text-sm font-medium text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmClearKey(true)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                        Quitar API key guardada
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="ai-model"
                  className="mb-2 block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]"
                >
                  Modelo (opcional)
                </label>
                <input
                  id="ai-model"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={busy}
                  placeholder={modelPlaceholder}
                  className={INPUT_CLASS}
                />
                <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
                  Vacío usa el default del proveedor
                  {isAiProviderKey(provider)
                    ? ` (${DEFAULT_AI_MODELS[provider as AiProviderKey]})`
                    : ""}
                  .
                </p>
              </div>
              {saveAndTest}
            </div>
            <ByokApiKeyGuide
              provider={provider}
              disabled={busy}
              onSelectProvider={setProvider}
              className="w-full lg:sticky lg:top-28"
            />
          </div>
        )}
      </div>
    </div>
  );
}
