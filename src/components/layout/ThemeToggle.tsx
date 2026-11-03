"use client";

import { useTheme } from "next-themes";
import { cn } from "kadesh/utils/cn";
import { useIsClient } from "kadesh/utils/useIsClient";

/**
 * Botón de tema claro / oscuro. Lo usan la barra del sitio (`Navigation`) y la de los paneles
 * (`app-shell`). No se pinta hasta montar: el tema real solo se conoce en el cliente.
 */
export default function ThemeToggle({
  className,
  iconClassName = "w-5 h-5",
}: {
  className?: string;
  iconClassName?: string;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();
  if (!mounted) return null;

  const isDark = (resolvedTheme || theme) === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      type="button"
      className={cn("transition-colors duration-200", className)}
      aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {isDark ? (
        <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className={iconClassName} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
