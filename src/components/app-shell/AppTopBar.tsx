"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import FontSizeSlider from "kadesh/components/layout/FontSizeSlider";
import ThemeToggle from "kadesh/components/layout/ThemeToggle";
import { NotificationBell } from "kadesh/components/notifications";
import UserMenu from "./UserMenu";

export { greetingFor } from "./greeting";

export type AppCrumb = { label: string; href?: string };

const roundIconButton =
  "flex size-10 items-center justify-center rounded-full bg-dash-surface-2 text-dash-soft transition-colors hover:bg-dash-surface-3 hover:text-dash-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400";

/**
 * Barra superior de los paneles. En móvil es una franja de vidrio con el botón del menú; en
 * escritorio flota redondeada sobre el contenido. Migas a la izquierda; buscador y "+ Nuevo"
 * (vía `actions`), campana, tamaño de texto, tema y saludo a la derecha.
 */
export default function AppTopBar({
  crumbs,
  actions,
  menuOpen,
  onOpenMenu,
  showNotifications,
}: {
  crumbs: AppCrumb[];
  actions?: ReactNode;
  menuOpen: boolean;
  onOpenMenu: () => void;
  showNotifications: boolean;
}) {
  const current = crumbs[crumbs.length - 1]?.label ?? "";

  return (
    <header
      className={
        "sticky top-0 z-40 flex items-center gap-2 border-b border-dash-line bg-dash-glass px-4 py-2.5 backdrop-blur-xl backdrop-saturate-150 " +
        "sm:px-6 lg:top-3 lg:mb-1 lg:ml-2 lg:mr-6 lg:mt-3 lg:rounded-[22px] lg:border lg:py-2 lg:pl-5 lg:pr-2 lg:shadow-dash"
      }
    >
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
        aria-controls="app-sidebar"
        aria-expanded={menuOpen}
        className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-dash-ink transition-colors hover:bg-dash-hover lg:hidden"
      >
        <HugeiconsIcon icon={Menu01Icon} size={22} />
      </button>

      <span className="min-w-0 truncate text-[15px] font-semibold text-dash-ink md:hidden">{current}</span>

      <nav aria-label="Migas" className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? (
                <span aria-hidden className="text-dash-faint">
                  ›
                </span>
              ) : null}
              {last || !crumb.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "truncate font-semibold text-dash-ink" : "truncate text-dash-muted"}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="truncate text-dash-muted transition-colors hover:text-dash-ink">
                  {crumb.label}
                </Link>
              )}
            </Fragment>
          );
        })}
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        {actions}
        {showNotifications ? <NotificationBell variant="panel" /> : null}
        <span className="hidden sm:contents">
          <FontSizeSlider tone="panel" />
          <ThemeToggle className={roundIconButton} />
        </span>
        <UserMenu />
      </div>
    </header>
  );
}
