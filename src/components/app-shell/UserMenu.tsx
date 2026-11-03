"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  FlashIcon,
  Globe02Icon,
  Logout01Icon,
  ShieldUserIcon,
  Tick02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { Routes } from "kadesh/core/routes";
import { cn } from "kadesh/utils/cn";
import { useLogout } from "kadesh/utils/useLogout";
import { useUser } from "kadesh/utils/UserContext";
import { useIsClient } from "kadesh/utils/useIsClient";
import { isPlatformAdminUser } from "kadesh/utils/user-roles";
import { DashAvatar } from "./DashAvatar";
import { greetingFor } from "./greeting";
import { popTransition } from "./motion";

type MenuLink = { id: string; label: string; href: string; icon: IconSvgElement; current?: boolean };

const itemClass =
  "flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-dash-ink transition-colors hover:bg-dash-surface-2 focus:outline-none focus-visible:bg-dash-surface-2";

/**
 * Menú del avatar en la barra de los paneles: perfil, cambiar entre el panel de control y
 * Operaciones (solo admins de plataforma), novedades, ir al sitio y cerrar sesión. Reemplaza el
 * menú del avatar que tenía la barra del sitio.
 */
export default function UserMenu() {
  const { user } = useUser();
  const pathname = usePathname() ?? "";
  const mounted = useIsClient();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const fullName = [user?.name, user?.lastName].filter(Boolean).join(" ").trim();
  const inOperaciones = pathname.startsWith(Routes.panelAdmin);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) setOpen(false);
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

  const workspaces: MenuLink[] = [
    {
      id: "panel",
      label: "Panel de control",
      href: `${Routes.panel}?tab=inicio`,
      icon: DashboardSquare01Icon,
      current: !inOperaciones,
    },
    ...(user && isPlatformAdminUser(user)
      ? [{ id: "operaciones", label: "Operaciones", href: Routes.panelAdmin, icon: ShieldUserIcon, current: inOperaciones }]
      : []),
  ];
  const links: MenuLink[] = [
    { id: "perfil", label: "Mi perfil", href: Routes.panelProfile, icon: UserCircleIcon },
    { id: "novedades", label: "Novedades", href: Routes.novedades, icon: FlashIcon },
    { id: "sitio", label: "Ir al sitio", href: Routes.home, icon: Globe02Icon },
  ];

  return (
    <div className="relative" ref={wrapper}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menú de tu cuenta"
        className="flex cursor-pointer items-center gap-2.5 rounded-full py-0.5 pl-1 pr-0.5 transition-colors hover:bg-dash-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 xl:pl-3"
      >
        {mounted ? (
          <span className="hidden text-right leading-tight xl:block">
            <small className="block text-xs text-dash-muted">{greetingFor(new Date())}</small>
            <strong className="block max-w-[11rem] truncate text-sm font-semibold text-dash-ink">
              {user?.name || "Kadesh"}
            </strong>
          </span>
        ) : null}
        <DashAvatar name={fullName || user?.email || "Kadesh"} imageUrl={user?.profileImage?.url} size="md" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={popTransition}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 origin-top-right rounded-[18px] border border-dash-line bg-dash-surface p-1.5 font-dash shadow-dash-lift"
          >
            <div className="flex items-center gap-2.5 px-2.5 pb-2.5 pt-1.5">
              <DashAvatar name={fullName || user?.email || "Kadesh"} imageUrl={user?.profileImage?.url} size="md" />
              <span className="min-w-0 leading-tight">
                <strong className="block truncate text-sm font-semibold text-dash-ink">{fullName || "Mi cuenta"}</strong>
                <span className="block truncate text-xs text-dash-muted">{user?.email}</span>
              </span>
            </div>

            <div className="border-t border-dash-line py-1">
              {workspaces.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  aria-current={item.current ? "page" : undefined}
                  className={cn(itemClass, item.current && "bg-dash-surface-2")}
                >
                  <HugeiconsIcon icon={item.icon} size={18} className="text-orange-600 dark:text-orange-400" />
                  <span className="flex-1">{item.label}</span>
                  {item.current ? <HugeiconsIcon icon={Tick02Icon} size={16} className="text-dash-muted" /> : null}
                </Link>
              ))}
            </div>

            <div className="border-t border-dash-line py-1">
              {links.map((item) => (
                <Link key={item.id} href={item.href} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                  <HugeiconsIcon icon={item.icon} size={18} className="text-dash-muted" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-dash-line pt-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className={itemClass}
              >
                <HugeiconsIcon icon={Logout01Icon} size={18} className="text-dash-muted" />
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
