"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ApolloProviderWrapper from '../providers/ApolloProviderWrapper';
import { ThemeProvider } from '../providers/ThemeProvider';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import { UserProvider } from "kadesh/utils/UserContext";
import { HeroUIProvider } from "@heroui/system";
import { Toaster } from "sileo";
import { useTheme } from "next-themes";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toaster = (
    <Toaster
      position="top-right"
      theme={(resolvedTheme === "dark" ? "dark" : "light") as "dark" | "light"}
    />
  );

  if (!mounted) return null;
  return createPortal(toaster, document.body);
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <HeroUIProvider locale="es-MX">
        <ApolloProviderWrapper>
          <UserProvider>
            {children}
            <ThemedToaster />
            <SpeedInsights />
            <Analytics />
          </UserProvider>
        </ApolloProviderWrapper>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
