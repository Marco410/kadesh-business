"use client";

import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import PlansSection from "kadesh/components/profile/sales/planes/PlansSection";

export interface LandingPricingSectionProps {
  /** `landing` = sección en home (#precios); `page` = página dedicada /precios */
  variant?: "landing" | "page";
}

export default function LandingPricingSection({
  variant = "landing",
}: LandingPricingSectionProps) {
  const isPage = variant === "page";

  return (
    <section
      id={isPage ? "comparar-planes" : "precios"}
      aria-labelledby={isPage ? "comparar-planes-heading" : undefined}
      className="py-16 sm:py-24 bg-white dark:bg-[#121212] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SubscriptionProvider companyId={null}>
          <PlansSection
            hideBackLink
            sectionHeadingLevel="h2"
            sectionTitle={isPage ? "Compara planes" : "¿Cuánto cuesta extraer leads con Kadesh?"}
            sectionSubtitle={
              isPage
                ? "Precios en pesos mexicanos (MXN). Facturación mensual o anual con descuento."
                : "Planes en MXN: Free, Starter 399, Pro 799 y Agencia 1,999. Prueba 7 días con 50 leads, sin tarjeta."
            }
            showBtnStart={false}
            sectionTitleId={isPage ? "comparar-planes-heading" : undefined}
          />
        </SubscriptionProvider>
      </div>
    </section>
  );
}
