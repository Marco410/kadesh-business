"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { type ReactNode, useEffect } from "react";

function ThemeMonitor() {
  const { resolvedTheme } = useNextTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      if (resolvedTheme === 'light') {
        html.classList.remove('dark', 'light');
      } else if (resolvedTheme === 'dark') {
        html.classList.remove('light');
        html.classList.add('dark');
      }
    }
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="kadesh-theme"
      disableTransitionOnChange={false}
    >
      <ThemeMonitor />
      {children}
    </NextThemesProvider>
  );
}

