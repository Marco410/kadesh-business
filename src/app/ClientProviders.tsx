"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import ApolloProviderWrapper from "../providers/ApolloProviderWrapper";
import { ThemeProvider } from "../providers/ThemeProvider";
import { UserProvider } from "kadesh/utils/UserContext";
import {
  CookieConsentProvider,
  CookieConsentBanner,
  MetaPixelLoader,
} from "kadesh/components/consent";
import { BodyScrollLock } from "kadesh/components/shared";
import { Toaster } from "sileo";
import { useTheme } from "next-themes";

const PanelAppProviders = dynamic(() => import("./PanelAppProviders"), {
  ssr: true,
});

const AuthAppProviders = dynamic(() => import("./AuthAppProviders"), {
  ssr: true,
});

const SpeedInsights = dynamic(
  () =>
    import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  { ssr: false },
);

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

function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (
    pathname?.startsWith("/panel") ||
    pathname?.startsWith("/admin")
  ) {
    return <PanelAppProviders>{children}</PanelAppProviders>;
  }

  if (pathname?.startsWith("/auth")) {
    return <AuthAppProviders>{children}</AuthAppProviders>;
  }

  return children;
}

export default function ClientProviders({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <CookieConsentProvider>
      <ThemeProvider>
        <ApolloProviderWrapper>
          <UserProvider>
            <AppShell>{children}</AppShell>
            <BodyScrollLock />
            <ThemedToaster />
            <SpeedInsights />
          </UserProvider>
        </ApolloProviderWrapper>
      </ThemeProvider>
      <CookieConsentBanner />
      <MetaPixelLoader />
    </CookieConsentProvider>
  );
}
