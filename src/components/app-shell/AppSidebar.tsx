"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Cancel01Icon, Globe02Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import Logo from "kadesh/components/shared/Logo";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { useLogout } from "kadesh/utils/useLogout";
import { useUser } from "kadesh/utils/UserContext";
import { indicatorTransition } from "./motion";
import { DashAvatar } from "./DashAvatar";

export type AppNavItem = {
  id: string;
  label: string;
  icon: IconSvgElement;
  href: string;
  active?: boolean;
  /** Globo con un contador (pendientes). 0 / null no se muestra. */
  badge?: number | null;
};

export type AppNavGroup = {
  id: string;
  title: string;
  items: AppNavItem[];
};

/**
 * Menú lateral de los paneles. En escritorio vive sobre el fondo (sin tarjeta propia) y solo la
 * opción activa es una píldora blanca que se desliza al cambiar. En móvil es un cajón que abre
 * la barra superior.
 */
export default function AppSidebar({
  brandTitle,
  brandSubtitle,
  groups,
  open,
  onClose,
  layoutGroupId,
}: {
  brandTitle: string;
  brandSubtitle: string;
  groups: AppNavGroup[];
  open: boolean;
  onClose: () => void;
  /** Separa la animación de la píldora si hubiera dos menús en pantalla. */
  layoutGroupId: string;
}) {
  const { user } = useUser();
  const logout = useLogout();
  const fullName = [user?.name, user?.lastName].filter(Boolean).join(" ").trim();

  return (
    <aside
      id="app-sidebar"
      aria-label="Menú del panel"
      data-open={open}
      className={cn(
        // Móvil: cajón fijo fuera de pantalla; `visibility` espera a que termine de salir.
        "fixed inset-y-0 left-0 z-50 flex w-[min(86vw,312px)] -translate-x-[105%] flex-col bg-dash-surface px-3 pb-4 pt-4 shadow-dash-lift",
        "invisible transition-[transform,visibility] duration-[350ms] ease-[cubic-bezier(0.16,0.84,0.44,1)]",
        "data-[open=true]:visible data-[open=true]:translate-x-0",
        // Escritorio: columna fija del grid, sobre el fondo.
        "lg:visible lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-auto lg:translate-x-0 lg:bg-transparent lg:pl-4 lg:pr-3.5 lg:pt-5 lg:shadow-none",
      )}
    >
      <div className="flex items-center gap-3 px-1.5">
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-dash-ink">
          <Logo size={30} className="rounded-none dark:invert" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <strong className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-dash-ink">
            {brandTitle}
          </strong>
          <span className="block truncate text-[13px] text-dash-muted">{brandSubtitle}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="flex size-11 items-center justify-center rounded-full text-dash-soft transition-colors hover:bg-dash-hover lg:hidden"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={20} />
        </button>
      </div>

      <nav aria-label="Secciones" className="-mx-1 mt-6 flex-1 overflow-y-auto px-1 [scrollbar-width:thin]">
        {groups.map((group) => (
          <div key={group.id} className="mb-4 last:mb-0">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-dash-faint">
              {group.title}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {group.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(
                      "group relative flex h-11 items-center gap-3 rounded-[14px] px-3 text-[15px] transition-colors duration-200 lg:h-10",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
                      item.active
                        ? "font-semibold text-dash-ink"
                        : "font-medium text-dash-soft hover:bg-dash-hover hover:text-dash-ink",
                    )}
                  >
                    {item.active ? (
                      <motion.span
                        layoutId={`${layoutGroupId}-active`}
                        transition={indicatorTransition}
                        className="absolute inset-0 rounded-[14px] bg-dash-surface-2 shadow-[0_1px_2px_rgba(20,20,20,0.06),0_6px_16px_-10px_rgba(20,20,20,0.25)] lg:bg-dash-surface"
                        aria-hidden
                      />
                    ) : null}
                    <HugeiconsIcon
                      icon={item.icon}
                      size={20}
                      strokeWidth={1.8}
                      className={cn(
                        "relative shrink-0 transition-colors",
                        item.active ? "text-orange-600 dark:text-orange-400" : "text-dash-muted group-hover:text-dash-soft",
                      )}
                    />
                    <span className="relative min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold tabular-nums text-white">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-3 rounded-3xl border border-dash-line bg-dash-surface p-2.5 shadow-dash">
        <div className="flex items-center gap-2.5 px-0.5">
          <DashAvatar name={fullName || user?.email || "Kadesh"} imageUrl={user?.profileImage?.url} size="md" />
          <span className="min-w-0 flex-1 leading-tight">
            <strong className="block truncate text-sm font-semibold text-dash-ink">{fullName || "Mi cuenta"}</strong>
            <span className="block truncate text-xs text-dash-muted">{user?.email}</span>
          </span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <Link
            href={Routes.home}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-dash-line-strong text-[13px] font-semibold text-dash-ink transition-colors hover:border-orange-400"
          >
            <HugeiconsIcon icon={Globe02Icon} size={16} />
            Ir al sitio
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] font-medium text-dash-soft transition-colors hover:bg-dash-hover hover:text-dash-ink"
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} />
            Salir
          </button>
        </div>
      </div>
    </aside>
  );
}
