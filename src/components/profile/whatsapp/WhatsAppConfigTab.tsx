"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkCircle01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
  EyeIcon,
  FlashIcon,
  ViewOffIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  COMPANY_WHATSAPP_SETTINGS_QUERY,
  COMPANY_WHATSAPP_WEBHOOK_INFO_QUERY,
  TEST_COMPANY_WHATSAPP_CONNECTION_MUTATION,
  UPDATE_COMPANY_WHATSAPP_SETTINGS_MUTATION,
  type CompanyWhatsappSettingsResponse,
  type CompanyWhatsappSettingsVariables,
  type CompanyWhatsappWebhookInfoResponse,
  type CompanyWhatsappWebhookInfoVariables,
  type TestCompanyWhatsappConnectionResponse,
  type TestCompanyWhatsappConnectionVariables,
  type UpdateCompanyWhatsappSettingsResponse,
  type UpdateCompanyWhatsappSettingsVariables,
} from "./queries";
import { WhatsAppChatImportSection } from "./WhatsAppChatImportSection";
import { WhatsAppConnectWizard } from "./WhatsAppConnectWizard";

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export interface WhatsAppConfigTabProps {
  companyId: string | null;
}

/** Botón pequeño para copiar un valor de la guía (URL del webhook, verify token, etc.). */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="inline-flex shrink-0 items-center rounded-md p-1 text-[#616161] transition-colors hover:bg-black/5 hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:bg-white/10 dark:hover:text-white"
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
    >
      <HugeiconsIcon
        icon={copied ? CheckmarkCircle01Icon : Copy01Icon}
        className="size-3.5"
      />
    </button>
  );
}

function HealthRow({ ok, label, hint }: { ok: boolean; label: string; hint?: string }) {
  return (
    <li className="flex items-start gap-2">
      <HugeiconsIcon
        icon={ok ? CheckmarkCircle02Icon : Alert02Icon}
        size={16}
        className={`mt-0.5 shrink-0 ${ok ? "text-emerald-600" : "text-amber-600"}`}
      />
      <span>
        {label}
        {hint ? <span className="block text-xs opacity-80">{hint}</span> : null}
      </span>
    </li>
  );
}

/**
 * Conectar WhatsApp Business (Cloud API de Meta) a la empresa: BYOK, cada empresa trae su
 * propia App de Meta. Mismo patrón de UI que AiSettingsSection (guardar / probar / quitar).
 */
export function WhatsAppConfigTab({ companyId }: WhatsAppConfigTabProps) {
  const { data, loading, refetch } = useQuery<
    CompanyWhatsappSettingsResponse,
    CompanyWhatsappSettingsVariables
  >(COMPANY_WHATSAPP_SETTINGS_QUERY, {
    variables: { id: companyId ?? "" },
    skip: !companyId,
    // Mientras se espera que Meta apruebe la plantilla de inicio de conversación (creada sola
    // al probar la conexión), refresca sin que el usuario tenga que recargar la página.
    pollInterval: 20000,
  });

  const saved = data?.saasCompany ?? null;

  // Callback URL + Verify Token del webhook: nunca hardcodeados aquí, se piden autenticados
  // (ver COMPANY_WHATSAPP_WEBHOOK_INFO_QUERY) y solo se resuelven para quien ya puede
  // administrar el WhatsApp de esta empresa (canManageCompanyWhatsapp en el backend).
  const { data: webhookInfoData } = useQuery<
    CompanyWhatsappWebhookInfoResponse,
    CompanyWhatsappWebhookInfoVariables
  >(COMPANY_WHATSAPP_WEBHOOK_INFO_QUERY, {
    variables: { companyId: companyId ?? "" },
    skip: !companyId,
  });
  const webhookInfo = webhookInfoData?.companyWhatsappWebhookInfo ?? null;

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [showWebhookToken, setShowWebhookToken] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [formError, setFormError] = useState("");
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  // Motivo real (de Meta) de que no se creó la plantilla. Solo llega en la respuesta de la
  // prueba de conexión (no se guarda en el back), así que vive aquí hasta la siguiente prueba.
  const [templateError, setTemplateError] = useState<string | null>(null);

  useEffect(() => {
    setPhoneNumberId(saved?.whatsappPhoneNumberId ?? "");
    setBusinessAccountId(saved?.whatsappBusinessAccountId ?? "");
    setAccessToken("");
    setAppSecret("");
    setShowSecrets(false);
    setConfirmClear(false);
    setFormError("");
    // testResult NO se limpia aquí: un test exitoso actualiza whatsappConnectedAt en el
    // backend (ver testCompanyWhatsappConnection.ts), y el refetch de handleTestConnection
    // vuelve a disparar este efecto — si limpiáramos testResult aquí, el mensaje de "Conexión
    // OK" desaparecería solo justo después de aparecer. Ya se limpia explícitamente al
    // iniciar cada prueba nueva.
  }, [
    saved?.id,
    saved?.whatsappPhoneNumberId,
    saved?.whatsappBusinessAccountId,
    saved?.whatsappTokenPreview,
    saved?.whatsappConnectedAt,
  ]);

  const [updateSettings, { loading: saving }] = useMutation<
    UpdateCompanyWhatsappSettingsResponse,
    UpdateCompanyWhatsappSettingsVariables
  >(UPDATE_COMPANY_WHATSAPP_SETTINGS_MUTATION);

  const [testConnection, { loading: testing }] = useMutation<
    TestCompanyWhatsappConnectionResponse,
    TestCompanyWhatsappConnectionVariables
  >(TEST_COMPANY_WHATSAPP_CONNECTION_MUTATION);

  const isConnected = Boolean(saved?.whatsappConnectedAt);
  const templateStatus = saved?.whatsappTemplateStatus ?? "none";
  const busy = saving || testing;

  const isDirty = Boolean(
    saved &&
      (phoneNumberId.trim() !== (saved.whatsappPhoneNumberId ?? "") ||
        businessAccountId.trim() !== (saved.whatsappBusinessAccountId ?? "") ||
        accessToken.trim() !== "" ||
        appSecret.trim() !== ""),
  );

  const persist = async (overrides?: { clear?: boolean }) => {
    if (!companyId) return;
    setFormError("");

    const input = overrides?.clear
      ? {
          companyId,
          phoneNumberId: "",
          businessAccountId: "",
          accessToken: "",
          appSecret: "",
        }
      : {
          companyId,
          phoneNumberId: phoneNumberId.trim(),
          businessAccountId: businessAccountId.trim(),
          ...(accessToken.trim() ? { accessToken: accessToken.trim() } : {}),
          ...(appSecret.trim() ? { appSecret: appSecret.trim() } : {}),
        };

    try {
      const result = await updateSettings({ variables: { input } });
      const payload = result.data?.updateCompanyWhatsappSettings;
      if (!payload?.success) {
        const message = payload?.message || "No se pudo guardar la configuración.";
        setFormError(message);
        sileo.error({ title: message });
        return;
      }
      setAccessToken("");
      setAppSecret("");
      setConfirmClear(false);
      await refetch();
      sileo.success({ title: payload.message || "Configuración de WhatsApp guardada" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar la configuración.";
      setFormError(message);
      sileo.error({ title: message });
    }
  };

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await persist({ clear: true });
  };

  const handleTestConnection = async () => {
    if (!companyId || isDirty) return;
    setTestResult(null);
    setTemplateError(null);
    try {
      const result = await testConnection({ variables: { companyId } });
      const payload = result.data?.testCompanyWhatsappConnection;
      const success = payload?.success ?? false;
      const message = success
        ? `Conexión OK: ${payload?.displayPhoneNumber || "número verificado"}`
        : payload?.message || "No se pudo probar la conexión.";
      setTestResult({ success, message });
      setTemplateError(payload?.templateError ?? null);
      success ? sileo.success({ title: message }) : sileo.error({ title: message });
      if (success) await refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo probar la conexión.";
      setTestResult({ success: false, message });
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
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
          <HugeiconsIcon icon={WhatsappIcon} size={22} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-[#212121] dark:text-white">
            WhatsApp Business
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
            Conecta tu propia cuenta de WhatsApp Business (Cloud API de Meta) para mandar y
            recibir mensajes con tus leads desde el CRM.
          </p>
        </div>
      </div>

      {!isConnected && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <HugeiconsIcon icon={Alert02Icon} size={18} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            <strong>Antes de conectar tu número:</strong> si ya lo usas en la app normal de
            WhatsApp, exporta cada conversación que quieras conservar (en el chat, menú → Más →
            Exportar chat). Al mover un número a la Cloud API de Meta dejas de poder usarlo en
            la app normal, así que después no vas a poder sacar ese historial. Luego sube esos
            archivos en &quot;Importar historial de chats&quot;, más abajo.
          </p>
        </div>
      )}

      {isConnected && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} className="shrink-0" />
          <span>
            Conectado{saved?.whatsappDisplayPhoneNumber ? ` — ${saved.whatsappDisplayPhoneNumber}` : ""}
            {saved?.whatsappConnectedAt
              ? ` (actualizado ${formatDateShort(saved.whatsappConnectedAt)})`
              : ""}
          </span>
        </div>
      )}

      {isConnected && templateStatus !== "approved" && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl border p-4 text-sm ${
            templateStatus === "rejected"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
          }`}
        >
          <HugeiconsIcon icon={Alert02Icon} size={18} className="mt-0.5 shrink-0" />
          <p className="leading-relaxed">
            {templateStatus === "rejected" ? (
              <>
                La plantilla para iniciar conversaciones con leads nuevos fue{" "}
                <strong>rechazada por Meta</strong>. Contacta a soporte de Kadesh para
                resolverlo — mientras tanto solo podrás contestar a leads que ya te
                escribieron.
              </>
            ) : templateStatus === "pending" ? (
              <>
                La plantilla para iniciar conversaciones con leads nuevos está{" "}
                <strong>pendiente de aprobación de Meta</strong> (puede tardar de minutos a un
                par de días). Mientras tanto solo podrás contestar a leads que ya te
                escribieron.
                <span className="mt-1 block">
                  Si en WhatsApp Manager ya te aparece aprobada, dale a{" "}
                  <strong>&quot;Probar conexión&quot;</strong> para actualizar el estado aquí.
                </span>
              </>
            ) : (
              <>
                No se pudo crear la plantilla para iniciar conversaciones. Vuelve a darle{" "}
                <strong>&quot;Probar conexión&quot;</strong> para reintentarlo.
                {templateError ? (
                  <>
                    {" "}
                    <span className="mt-1 block">
                      Meta respondió: <em>{templateError}</em>
                    </span>
                  </>
                ) : null}
              </>
            )}
          </p>
        </div>
      )}

      {formError && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {formError}
        </div>
      )}


      {isConnected && (
        <div className="mt-3 rounded-xl border border-[#e0e0e0] p-4 text-sm dark:border-[#3a3a3a]">
          <p className="font-semibold text-[#212121] dark:text-white">Estado de la conexión</p>
          <ul className="mt-2 space-y-1.5 text-[#616161] dark:text-[#b0b0b0]">
            <HealthRow ok label="Conexión" />
            <HealthRow
              ok={Boolean(saved?.whatsappWebhookConfiguredAt)}
              label="Webhook configurado"
              hint={saved?.whatsappWebhookConfiguredAt ? undefined : "Configúralo a mano (ver Configuración manual)."}
            />
            <HealthRow
              ok={Boolean(saved?.whatsappLastWebhookAt)}
              label="Mensajes reales recibidos"
              hint={
                saved?.whatsappLastWebhookAt
                  ? `Último: ${formatDateShort(saved.whatsappLastWebhookAt)}`
                  : saved?.whatsappWebhookConfiguredAt
                    ? "Aún no llega ninguno. ¿Publicaste la App en modo Live? (paso 5)"
                    : undefined
              }
            />
            <HealthRow
              ok={templateStatus === "approved"}
              label={`Plantilla de inicio: ${
                templateStatus === "approved"
                  ? "aprobada"
                  : templateStatus === "pending"
                    ? "pendiente de Meta"
                    : templateStatus === "rejected"
                      ? "rechazada"
                      : "no creada"
              }`}
              hint={templateStatus === "none" && templateError ? templateError : undefined}
            />
          </ul>
          <p className="mt-3 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Meta pide un método de pago en tu cuenta de WhatsApp Business para las plantillas de
            inicio de conversación; el cobro es directo de Meta a tu tarjeta.
          </p>
        </div>
      )}

      {companyId && (
        <WhatsAppConnectWizard
          companyId={companyId}
          saved={saved}
          onConnected={async () => {
            await refetch();
          }}
        />
      )}

      {isConnected && (
        <div className="mt-6 text-right">
            {confirmClear ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-[#616161] dark:text-[#b0b0b0]">¿Quitar la conexión?</span>
                <button
                  type="button"
                  onClick={() => void handleClear()}
                  disabled={busy}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
                >
                  Sí, quitar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  disabled={busy}
                  className="rounded-lg border border-[#e0e0e0] px-3 py-1.5 text-sm font-medium text-[#212121] transition-colors hover:bg-[#f5f5f5] dark:border-[#3a3a3a] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                disabled={busy}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-60 dark:text-red-400 dark:hover:text-red-300"
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
                Quitar conexión
              </button>
            )}
        </div>
      )}
      <details className="mt-8 rounded-xl border border-[#e0e0e0] p-4 dark:border-[#3a3a3a]">
        <summary className="cursor-pointer text-sm font-semibold text-[#212121] dark:text-white">Configuración manual (avanzado)</summary>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="wa-phone-number-id" className="mb-2 block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]">
            Phone Number ID
          </label>
          <input
            id="wa-phone-number-id"
            type="text"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            disabled={busy}
            placeholder="Ej. 109876543210987"
            className={INPUT_CLASS}
          />
          <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Tu App → WhatsApp → Configuración de la API, campo &quot;De&quot;.
          </p>
        </div>

        <div>
          <label htmlFor="wa-waba-id" className="mb-2 block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]">
            WhatsApp Business Account ID
          </label>
          <input
            id="wa-waba-id"
            type="text"
            value={businessAccountId}
            onChange={(e) => setBusinessAccountId(e.target.value)}
            disabled={busy}
            placeholder="Ej. 123456789012345"
            className={INPUT_CLASS}
          />
          <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Mismo panel, arriba a la derecha: &quot;ID de la cuenta de WhatsApp Business&quot;.
          </p>
        </div>

        <div>
          <label htmlFor="wa-access-token" className="mb-2 block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]">
            Access Token
          </label>
          <div className="relative">
            <input
              id="wa-access-token"
              type={showSecrets ? "text" : "password"}
              value={accessToken}
              onChange={(e) => {
                setAccessToken(e.target.value);
                setConfirmClear(false);
              }}
              autoComplete="new-password"
              spellCheck={false}
              disabled={busy}
              placeholder={
                saved?.whatsappTokenPreview
                  ? `Guardado: ${saved.whatsappTokenPreview}`
                  : "Pega el access token permanente"
              }
              className={`${INPUT_CLASS} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowSecrets((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#616161] transition-colors hover:bg-[#f0f0f0] hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:bg-[#2a2a2a] dark:hover:text-white"
              aria-label={showSecrets ? "Ocultar" : "Mostrar"}
            >
              <HugeiconsIcon icon={showSecrets ? ViewOffIcon : EyeIcon} className="size-5" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Configuración de la empresa → Usuarios del sistema → genera uno permanente con
            los permisos <code>whatsapp_business_messaging</code> y{" "}
            <code>whatsapp_business_management</code>. Déjalo vacío para conservar el actual.
          </p>
        </div>

        <div>
          <label htmlFor="wa-app-secret" className="mb-2 block text-sm font-semibold text-[#616161] dark:text-[#b0b0b0]">
            App Secret
          </label>
          <input
            id="wa-app-secret"
            type={showSecrets ? "text" : "password"}
            value={appSecret}
            onChange={(e) => {
              setAppSecret(e.target.value);
              setConfirmClear(false);
            }}
            autoComplete="new-password"
            spellCheck={false}
            disabled={busy}
            placeholder={isConnected ? "Guardado" : "App Secret de tu App de Meta"}
            className={INPUT_CLASS}
          />
          <p className="mt-1.5 text-xs text-[#616161] dark:text-[#b0b0b0]">
            Configuración de la app → Básica → Mostrar, junto a &quot;Clave secreta de la
            aplicación&quot;. Verifica la firma de los mensajes entrantes. Déjalo vacío para
            conservar el actual.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => void persist()}
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
          disabled={busy || isDirty || !isConnected}
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
          Guarda los cambios para poder probar la conexión con la configuración nueva.
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
          {testResult.message}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-[#e0e0e0] bg-[#fafafa] p-4 text-sm leading-relaxed text-[#616161] dark:border-[#3a3a3a] dark:bg-[#252525] dark:text-[#b0b0b0]">
        <p className="font-semibold text-[#212121] dark:text-white">Webhook (solo si Kadesh no pudo configurarlo)</p>
        <p className="mt-1">
          En <strong>WhatsApp → Configuración → Webhook</strong> de tu App, usa esta Callback URL y
          Verify Token, guarda y suscríbete al campo <code>messages</code>.
        </p>
        {webhookInfo?.success && webhookInfo.webhookUrl && webhookInfo.verifyToken ? (
          <div className="mt-2 space-y-1.5">
            <span className="flex items-center gap-1.5">
              <code className="select-all break-all">{webhookInfo.webhookUrl}</code>
              <CopyButton value={webhookInfo.webhookUrl} label="URL del webhook" />
            </span>
            <span className="flex items-center gap-1.5">
              <code className="select-all break-all">
                {showWebhookToken ? webhookInfo.verifyToken : "\u2022".repeat(24)}
              </code>
              <button
                type="button"
                onClick={() => setShowWebhookToken((prev) => !prev)}
                className="inline-flex shrink-0 items-center rounded-md p-1 text-[#616161] transition-colors hover:bg-black/5 hover:text-[#212121] dark:text-[#b0b0b0] dark:hover:bg-white/10 dark:hover:text-white"
                aria-label={showWebhookToken ? "Ocultar Verify Token" : "Mostrar Verify Token"}
              >
                <HugeiconsIcon icon={showWebhookToken ? ViewOffIcon : EyeIcon} className="size-3.5" />
              </button>
              <CopyButton value={webhookInfo.verifyToken} label="Verify Token" />
            </span>
          </div>
        ) : (
          <p className="mt-2 italic">Pídeselos a tu contacto en Kadesh.</p>
        )}
      </div>
      </details>

      <WhatsAppChatImportSection />
    </div>
  );
}