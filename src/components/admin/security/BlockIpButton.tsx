"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import { SecurityBlockIcon } from "@hugeicons/core-free-icons";
import { adminErrorText } from "../errors";
import {
  AdminButton,
  AdminModal,
  adminLabelClass,
  adminSelectClass,
  adminTextareaClass,
  type AdminButtonSize,
  type AdminButtonVariant,
} from "../ui";
import {
  ADMIN_BLOCK_IP_MUTATION,
  ADMIN_SECURITY_QUERY,
  ADMIN_UNBLOCK_IP_MUTATION,
  BLOCK_DURATIONS,
  type AdminBlockIpResult,
  type AdminUnblockIpResult,
} from "./security-queries";

/**
 * Bloquear una IP desde Actividad, Dispositivos o Seguridad. Pide motivo y duración; si un admin
 * de Kadesh usó esa IP hace poco, pide confirmar antes de bloquearla.
 */
export function BlockIpButton({
  ip,
  variant = "danger-ghost",
  size = "sm",
  label = "Bloquear IP",
  onDone,
}: {
  ip: string;
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  label?: string;
  onDone?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [days, setDays] = useState<string>("7");
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [block, { loading }] = useMutation<AdminBlockIpResult>(ADMIN_BLOCK_IP_MUTATION, {
    refetchQueries: [ADMIN_SECURITY_QUERY],
  });

  const close = () => {
    setOpen(false);
    setConfirmMessage(null);
  };

  const submit = async (force: boolean) => {
    try {
      const { data } = await block({
        variables: {
          ip,
          reason: reason.trim() || null,
          days: days ? Number(days) : null,
          force,
        },
      });
      const outcome = data?.adminBlockIp;
      if (outcome?.needsConfirmation) {
        setConfirmMessage(outcome.message);
        return;
      }
      if (!outcome?.success) {
        sileo.error({ title: outcome?.message ?? "No se pudo bloquear la IP" });
        return;
      }
      sileo.success({ title: outcome.message });
      setReason("");
      close();
      onDone?.();
    } catch (err) {
      sileo.error({ title: adminErrorText(err, "No se pudo bloquear la IP") });
    }
  };

  return (
    <>
      <AdminButton variant={variant} size={size} icon={SecurityBlockIcon} onClick={() => setOpen(true)}>
        {label}
      </AdminButton>
      <AdminModal
        open={open}
        onClose={close}
        ariaLabel={`Bloquear la IP ${ip}`}
        title="Bloquear IP"
        subtitle={
          <>
            Nada desde <span className="font-semibold tabular-nums text-dash-ink">{ip}</span> podrá usar
            Kadesh: ni ver, ni entrar, ni publicar. Puede afectar a otras personas de la misma red.
          </>
        }
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <AdminButton variant="ghost" onClick={close} disabled={loading}>
              Cancelar
            </AdminButton>
            {confirmMessage ? (
              <AdminButton variant="danger" onClick={() => submit(true)} disabled={loading}>
                Bloquear de todos modos
              </AdminButton>
            ) : (
              <AdminButton variant="danger" onClick={() => submit(false)} disabled={loading}>
                {loading ? "Bloqueando..." : "Bloquear"}
              </AdminButton>
            )}
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor={`block-days-${ip}`} className={adminLabelClass}>
              Duración
            </label>
            <select
              id={`block-days-${ip}`}
              value={days}
              onChange={(event) => setDays(event.target.value)}
              className={adminSelectClass}
            >
              {BLOCK_DURATIONS.map((duration) => (
                <option key={duration.label} value={duration.value}>
                  {duration.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`block-reason-${ip}`} className={adminLabelClass}>
              Motivo (solo lo ve Kadesh)
            </label>
            <textarea
              id={`block-reason-${ip}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Spam de reportes, fuerza bruta en login…"
              className={adminTextareaClass}
              maxLength={500}
            />
          </div>
          {confirmMessage ? (
            <p className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
              {confirmMessage}
            </p>
          ) : null}
        </div>
      </AdminModal>
    </>
  );
}

/** Quitar el bloqueo de una IP. */
export function UnblockIpButton({ ip, onDone }: { ip: string; onDone?: () => void }) {
  const [unblock, { loading }] = useMutation<AdminUnblockIpResult>(ADMIN_UNBLOCK_IP_MUTATION, {
    refetchQueries: [ADMIN_SECURITY_QUERY],
  });
  const run = async () => {
    try {
      const { data } = await unblock({ variables: { ip } });
      const outcome = data?.adminUnblockIp;
      if (!outcome?.success) {
        sileo.error({ title: outcome?.message ?? "No se pudo desbloquear la IP" });
        return;
      }
      sileo.success({ title: outcome.message });
      onDone?.();
    } catch (err) {
      sileo.error({ title: adminErrorText(err, "No se pudo desbloquear la IP") });
    }
  };
  return (
    <AdminButton variant="outline" size="sm" onClick={run} disabled={loading}>
      {loading ? "Desbloqueando..." : "Desbloquear"}
    </AdminButton>
  );
}
