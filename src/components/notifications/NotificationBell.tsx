"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import { formatDateShort } from "kadesh/utils/format-date";
import {
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  MARK_NOTIFICATION_READ_MUTATION,
  MY_NOTIFICATIONS_QUERY,
  MY_UNREAD_NOTIFICATIONS_COUNT_QUERY,
  type MyNotificationsResponse,
  type MyUnreadNotificationsCountResponse,
  type NotificationItem,
} from "./queries";
import {
  NOTIFICATIONS_PAGE_SIZE,
  NOTIFICATIONS_POLL_MS,
  notificationHref,
  notificationIcon,
} from "./constants";

/**
 * Campana de notificaciones. El contador se revisa cada minuto; la lista se pide al abrir.
 * Clic en un aviso: lo marca como leído y lleva a la sección que lo resuelve.
 */
export default function NotificationBell({ light = false }: { light?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: countData, refetch: refetchCount } = useQuery<MyUnreadNotificationsCountResponse>(
    MY_UNREAD_NOTIFICATIONS_COUNT_QUERY,
    { pollInterval: NOTIFICATIONS_POLL_MS, fetchPolicy: "cache-and-network" },
  );
  const [loadList, { data: listData, loading, refetch: refetchList }] =
    useLazyQuery<MyNotificationsResponse>(MY_NOTIFICATIONS_QUERY, {
      variables: { take: NOTIFICATIONS_PAGE_SIZE },
      fetchPolicy: "network-only",
    });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION);
  const [markAll, { loading: markingAll }] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION);

  const unread = countData?.notificationsCount ?? 0;
  const items = listData?.notifications ?? [];

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void loadList();
  };

  const refresh = async () => {
    await Promise.all([refetchCount(), refetchList?.()]);
  };

  const openItem = async (item: NotificationItem) => {
    setOpen(false);
    if (!item.readAt) {
      await markRead({ variables: { id: item.id, readAt: new Date().toISOString() } }).catch(() => null);
      void refetchCount();
    }
    const href = notificationHref(item);
    if (!href) return;
    if (/^https?:\/\//.test(href)) window.open(href, "_blank", "noopener,noreferrer");
    else router.push(href);
  };

  const markAllRead = async () => {
    await markAll().catch(() => null);
    await refresh();
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Notificaciones: ${unread} sin leer` : "Notificaciones"}
        aria-expanded={open}
        className={`relative flex size-10 items-center justify-center rounded-full transition-colors ${
          light ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        <HugeiconsIcon icon={Notification01Icon} size={20} />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-5 text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed inset-x-4 top-20 z-50 overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 dark:border-[#2a2a2a] dark:bg-[#1e1e1e]">
          <div className="flex items-center justify-between gap-2 border-b border-[#eee] px-4 py-3 dark:border-[#2a2a2a]">
            <p className="text-sm font-semibold text-[#212121] dark:text-white">Notificaciones</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                disabled={markingAll}
                className="text-xs font-medium text-orange-800 hover:underline disabled:opacity-50 dark:text-orange-400"
              >
                Marcar todas como leídas
              </button>
            ) : null}
          </div>

          <ul className="max-h-[60vh] overflow-y-auto">
            {loading && items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-[#757575]">Cargando…</li>
            ) : items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-[#757575] dark:text-[#9e9e9e]">
                No tienes notificaciones.
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void openItem(item)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#262626] ${
                      item.readAt ? "" : "bg-orange-50/60 dark:bg-orange-500/[0.06]"
                    }`}
                  >
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300">
                      <HugeiconsIcon icon={notificationIcon(item.type)} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-[#212121] dark:text-white">
                        {item.title}
                      </span>
                      {item.body ? (
                        <span className="mt-0.5 block truncate text-xs text-[#616161] dark:text-[#b0b0b0]">
                          {item.body}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[11px] text-[#9e9e9e]">
                        {formatDateShort(item.createdAt)}
                      </span>
                    </span>
                    {!item.readAt ? (
                      <span className="mt-2 size-2 shrink-0 rounded-full bg-orange-500" aria-label="Sin leer" />
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
