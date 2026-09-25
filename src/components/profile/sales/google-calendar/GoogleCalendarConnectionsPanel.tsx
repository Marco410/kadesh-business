"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowDown01Icon,
  CalendarIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { sileo } from "sileo";
import { useUser } from "kadesh/utils/UserContext";
import { isAdminCompanyUser, isPlatformAdminUser } from "kadesh/utils/user-roles";
import { ConfirmModal } from "kadesh/components/shared";
import {
  DISCONNECT_GOOGLE_CALENDAR_ACCOUNT_MUTATION,
  GET_GOOGLE_CALENDAR_AUTH_URL_MUTATION,
  REFRESH_GOOGLE_CALENDAR_LIST_MUTATION,
  SET_GOOGLE_CALENDAR_PUSH_SETTINGS_MUTATION,
  TOGGLE_GOOGLE_CALENDAR_SELECTION_MUTATION,
  type DisconnectGoogleCalendarAccountResponse,
  type GetGoogleCalendarAuthUrlResponse,
  type GetGoogleCalendarAuthUrlVariables,
  type GoogleCalendarAccountItem,
  type GoogleCalendarScopeType,
  type GoogleCalendarSelectionItem,
  type GooglePushFlag,
  type RefreshGoogleCalendarListResponse,
  type SetGoogleCalendarPushSettingsResponse,
  type ToggleGoogleCalendarSelectionResponse,
} from "./queries";
import { useGoogleCalendarAccounts } from "./useGoogleCalendarAccounts";
import { accountDisplayLabel, calendarDisplayName } from "./labels";

const DEFAULT_COLOR = "#039be5";

const BUTTON_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60";
const BUTTON_SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#e0e0e0] px-4 py-2.5 text-sm font-semibold text-[#212121] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#3a3a3a] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]";
const BUTTON_SMALL =
  "rounded-lg border border-[#e0e0e0] bg-white px-3 py-1.5 text-xs font-semibold text-[#212121] transition-colors hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-[#e0e0e0] dark:hover:bg-[#2a2a2a]";
const BUTTON_SMALL_PRIMARY =
  "rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60";

/** Registros del CRM que se pueden enviar a cada calendario. */
const PUSH_OPTIONS: { flag: GooglePushFlag; label: string }[] = [
  { flag: "pushActivities", label: "Actividades" },
  { flag: "pushProposals", label: "Propuestas" },
  { flag: "pushFollowUps", label: "Seguimientos" },
  { flag: "pushTasks", label: "Tareas" },
];

interface GoogleCalendarConnectionsPanelProps {
  /** Se llama tras cambiar cuentas o calendarios (para refrescar el calendario). */
  onChanged?: () => void;
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        on ? "bg-orange-500" : "bg-[#c9c9c9] dark:bg-[#555]"
      }`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </span>
  );
}

export default function GoogleCalendarConnectionsPanel({
  onChanged,
}: GoogleCalendarConnectionsPanelProps) {
  const { user } = useUser();
  const { accounts, loading, refetch } = useGoogleCalendarAccounts();

  const canManageCompanyAccount = isAdminCompanyUser(user) || isPlatformAdminUser(user);
  const hasCompanyAccount = accounts.some((a) => a.scopeType === "company");

  const [getAuthUrl, { loading: gettingUrl }] = useMutation<
    GetGoogleCalendarAuthUrlResponse,
    GetGoogleCalendarAuthUrlVariables
  >(GET_GOOGLE_CALENDAR_AUTH_URL_MUTATION);
  const [disconnect, { loading: disconnecting }] =
    useMutation<DisconnectGoogleCalendarAccountResponse>(
      DISCONNECT_GOOGLE_CALENDAR_ACCOUNT_MUTATION,
    );
  const [refreshList] = useMutation<RefreshGoogleCalendarListResponse>(
    REFRESH_GOOGLE_CALENDAR_LIST_MUTATION,
  );
  const [toggleSelection] = useMutation<ToggleGoogleCalendarSelectionResponse>(
    TOGGLE_GOOGLE_CALENDAR_SELECTION_MUTATION,
  );
  const [setPushSettings] = useMutation<SetGoogleCalendarPushSettingsResponse>(
    SET_GOOGLE_CALENDAR_PUSH_SETTINGS_MUTATION,
  );

  const [busyAccountId, setBusyAccountId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchByAccount, setSearchByAccount] = useState<Record<string, string>>({});
  const [accountToDisconnect, setAccountToDisconnect] =
    useState<GoogleCalendarAccountItem | null>(null);

  const toggleExpanded = (accountId: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });

  const canManage = (account: GoogleCalendarAccountItem) =>
    account.scopeType === "personal"
      ? account.user?.id === user?.id || isPlatformAdminUser(user)
      : canManageCompanyAccount;

  // Solo se listan las cuentas que el usuario puede administrar (p. ej. un vendedor no ve la
  // cuenta compartida de la empresa aquí; sus calendarios visibles sí salen en el calendario).
  const manageableAccounts = accounts.filter(canManage);

  const handleConnect = async (scopeType: GoogleCalendarScopeType) => {
    try {
      const { data } = await getAuthUrl({ variables: { scopeType } });
      const result = data?.getGoogleCalendarAuthUrl;
      if (!result?.success || !result.url) {
        sileo.error({ title: result?.message || "No se pudo iniciar la conexión con Google." });
        return;
      }
      // Google pide el consentimiento y regresa a /panel/google-calendar/callback.
      window.location.assign(result.url);
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo iniciar la conexión con Google.",
      });
    }
  };

  const handleToggle = async (selectionId: string, isSelected: boolean) => {
    try {
      const { data } = await toggleSelection({ variables: { selectionId, isSelected } });
      const result = data?.toggleGoogleCalendarSelection;
      if (!result?.success) {
        sileo.error({ title: result?.message || "No se pudo actualizar el calendario." });
        return;
      }
      await refetch();
      onChanged?.();
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo actualizar el calendario.",
      });
    }
  };

  const handlePushFlag = async (selectionId: string, flag: GooglePushFlag, value: boolean) => {
    try {
      const { data } = await setPushSettings({
        variables: { selectionId, settings: { [flag]: value } },
      });
      if (!data?.setGoogleCalendarPushSettings.success) {
        sileo.error({
          title: data?.setGoogleCalendarPushSettings.message || "No se pudo guardar la preferencia.",
        });
        return;
      }
      await refetch();
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo guardar la preferencia.",
      });
    }
  };

  const handleRefresh = async (account: GoogleCalendarAccountItem) => {
    setBusyAccountId(account.id);
    try {
      const { data } = await refreshList({ variables: { accountId: account.id } });
      const result = data?.refreshGoogleCalendarList;
      if (result?.success) {
        sileo.success({ title: result.message });
        await refetch();
        onChanged?.();
      } else {
        sileo.error({ title: result?.message || "No se pudo actualizar la lista." });
      }
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo actualizar la lista.",
      });
    } finally {
      setBusyAccountId(null);
    }
  };

  const handleDisconnect = async () => {
    if (!accountToDisconnect) return;
    try {
      const { data } = await disconnect({ variables: { accountId: accountToDisconnect.id } });
      const result = data?.disconnectGoogleCalendarAccount;
      if (result?.success) {
        sileo.success({ title: result.message });
        setAccountToDisconnect(null);
        await refetch();
        onChanged?.();
      } else {
        sileo.error({ title: result?.message || "No se pudo desconectar la cuenta." });
      }
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "No se pudo desconectar la cuenta.",
      });
    }
  };

  const renderCalendarRow = (
    account: GoogleCalendarAccountItem,
    calendar: GoogleCalendarSelectionItem,
  ) => (
    <li
      key={calendar.id}
      className={`rounded-lg border transition-colors ${
        calendar.isSelected
          ? "border-orange-500/40 bg-orange-500/5"
          : "border-[#e0e0e0] bg-white dark:border-[#3a3a3a] dark:bg-[#1e1e1e]"
      }`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={calendar.isSelected}
        onClick={() => handleToggle(calendar.id, !calendar.isSelected)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: calendar.colorHex ?? DEFAULT_COLOR }}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-[#212121] dark:text-[#ffffff]">
            {calendarDisplayName(account, calendar)}
          </span>
          {calendar.isPrimary ? (
            <span className="text-[11px] text-[#9e9e9e]">Principal</span>
          ) : null}
        </span>
        <span className="hidden text-xs text-[#9e9e9e] sm:inline">
          {calendar.isSelected ? "Visible" : "Oculto"}
        </span>
        <Switch on={calendar.isSelected} />
      </button>

      {calendar.isSelected ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-orange-500/20 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9e9e9e]">
            Kadesh envía aquí
          </span>
          {PUSH_OPTIONS.map(({ flag, label }) => (
            <label
              key={flag}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-[#212121] dark:text-[#e0e0e0]"
            >
              <input
                type="checkbox"
                checked={calendar[flag]}
                onChange={(e) => handlePushFlag(calendar.id, flag, e.target.checked)}
                className="size-3.5 accent-orange-500"
              />
              {label}
            </label>
          ))}
        </div>
      ) : null}
    </li>
  );

  return (
    <section
      data-tour="calendar-google-accounts"
      className="w-full rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#212121] dark:text-[#ffffff]">
            Cuentas y calendarios de Google
          </h3>
          <p className="mt-1 max-w-xl text-sm text-[#616161] dark:text-[#b0b0b0]">
            Activa los calendarios que quieres ver. En cada uno decide qué envía Kadesh
            automáticamente; los eventos que creas a mano eligen su calendario al crearlos.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <button
            type="button"
            data-tour="calendar-google-connect"
            onClick={() => handleConnect("personal")}
            disabled={gettingUrl}
            className={BUTTON_PRIMARY}
          >
            <HugeiconsIcon icon={CalendarIcon} size={18} />
            Conectar mi cuenta
          </button>
          {canManageCompanyAccount ? (
            <button
              type="button"
              onClick={() => handleConnect("company")}
              disabled={gettingUrl}
              className={BUTTON_SECONDARY}
            >
              {hasCompanyAccount ? "Otra cuenta compartida" : "Cuenta compartida de la empresa"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading && manageableAccounts.length === 0 ? (
          <div className="flex justify-center py-6">
            <span className="size-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          </div>
        ) : manageableAccounts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#e0e0e0] px-4 py-6 text-center dark:border-[#3a3a3a]">
            <p className="text-sm font-medium text-[#212121] dark:text-[#ffffff]">
              Aún no conectas una cuenta de Google
            </p>
            <p className="mt-1 text-xs text-[#616161] dark:text-[#b0b0b0]">
              Conecta tu cuenta para ver tus eventos aquí y enviar los que crees en Kadesh.
            </p>
          </div>
        ) : (
          manageableAccounts.map((account) => {
            const busy = busyAccountId === account.id;
            const expanded = expandedIds.has(account.id);
            const visibleCount = account.calendars.filter((c) => c.isSelected).length;
            const search = (searchByAccount[account.id] ?? "").trim().toLowerCase();
            const rows = search
              ? account.calendars.filter((c) => c.calendarName.toLowerCase().includes(search))
              : account.calendars;
            const accent = account.calendars.find((c) => c.isPrimary)?.colorHex ?? "#f97316";
            const hiddenCount = account.calendars.length - visibleCount;

            return (
              <article
                key={account.id}
                className="overflow-hidden rounded-xl border border-[#e0e0e0] bg-[#fafafa] dark:border-[#3a3a3a] dark:bg-[#252525]"
              >
                <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => account.isActive && toggleExpanded(account.id)}
                    aria-expanded={expanded}
                    disabled={!account.isActive}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left disabled:cursor-default"
                  >
                    <span
                      className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase text-white"
                      style={{ backgroundColor: accent }}
                      aria-hidden
                    >
                      {account.googleAccountEmail.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#212121] dark:text-[#ffffff]">
                        {accountDisplayLabel(account)}
                      </span>
                      {account.scopeType === "company" ? (
                        <span className="block truncate text-[11px] text-[#9e9e9e]">
                          Conectada con {account.googleAccountEmail}
                        </span>
                      ) : null}
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        <span className="rounded bg-orange-500/10 px-1.5 py-0.5 font-medium text-orange-600 dark:text-orange-400">
                          {account.scopeType === "company" ? "Empresa" : "Personal"}
                        </span>
                        {account.isActive ? (
                          <>
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} />
                              Conectada
                            </span>
                            <span className="text-[#9e9e9e]">
                              {visibleCount} de {account.calendars.length} visibles
                              {!expanded && hiddenCount > 0 ? " · toca para ver todos" : ""}
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                            <HugeiconsIcon icon={Alert02Icon} size={13} />
                            Desconectada por Google
                          </span>
                        )}
                      </span>
                    </span>
                    {account.isActive ? (
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        size={20}
                        className={`shrink-0 text-[#616161] transition-transform duration-200 dark:text-[#b0b0b0] ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    ) : null}
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {!account.isActive ? (
                      <button
                        type="button"
                        onClick={() => handleConnect(account.scopeType)}
                        disabled={gettingUrl}
                        className={BUTTON_SMALL_PRIMARY}
                      >
                        Reconectar
                      </button>
                    ) : null}
                    {account.isActive ? (
                      <button
                        type="button"
                        onClick={() => handleRefresh(account)}
                        disabled={busy}
                        className={BUTTON_SMALL}
                        title="Trae de Google los calendarios nuevos"
                      >
                        {busy ? "Actualizando…" : "Actualizar"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setAccountToDisconnect(account)}
                      className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                    >
                      Desconectar
                    </button>
                  </div>
                </div>

                {account.lastSyncError && account.isActive ? (
                  <p className="border-t border-[#e0e0e0] px-4 py-2 text-xs text-red-600 dark:border-[#3a3a3a] dark:text-red-400">
                    {account.lastSyncError}
                  </p>
                ) : null}

                {!account.isActive ? (
                  <p className="border-t border-[#e0e0e0] px-4 py-3 text-sm text-[#616161] dark:border-[#3a3a3a] dark:text-[#b0b0b0]">
                    Google revocó el acceso. Vuelve a conectar la cuenta para seguir sincronizando.
                  </p>
                ) : expanded ? (
                  <div className="border-t border-[#e0e0e0] p-3 dark:border-[#3a3a3a] sm:p-4">
                    {account.calendars.length > 8 ? (
                      <input
                        type="search"
                        value={searchByAccount[account.id] ?? ""}
                        onChange={(e) =>
                          setSearchByAccount((prev) => ({ ...prev, [account.id]: e.target.value }))
                        }
                        placeholder={`Buscar entre ${account.calendars.length} calendarios…`}
                        className="mb-3 w-full rounded-lg border border-[#e0e0e0] bg-white px-3 py-2 text-sm text-[#212121] outline-none focus:border-orange-500 dark:border-[#3a3a3a] dark:bg-[#1e1e1e] dark:text-[#ffffff]"
                      />
                    ) : null}

                    {rows.length === 0 ? (
                      <p className="text-sm text-[#616161] dark:text-[#b0b0b0]">
                        {search
                          ? "Ningún calendario coincide."
                          : "Esta cuenta no tiene calendarios disponibles."}
                      </p>
                    ) : (
                      <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                        {rows.map((calendar) => renderCalendarRow(account, calendar))}
                      </ul>
                    )}

                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>

      <ConfirmModal
        isOpen={accountToDisconnect !== null}
        onClose={() => setAccountToDisconnect(null)}
        onConfirm={handleDisconnect}
        isLoading={disconnecting}
        title="Desconectar cuenta de Google"
        message={`Kadesh dejará de enviar y leer eventos de ${accountToDisconnect?.googleAccountEmail ?? "esta cuenta"}. Los eventos que ya están en Google no se borran.`}
        confirmText="Desconectar"
      />
    </section>
  );
}
