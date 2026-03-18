"use client";

import { SubscriptionProvider } from "kadesh/components/profile/sales/SubscriptionContext";
import PlansSection from "kadesh/components/profile/sales/planes/PlansSection";

export default function LandingPricingSection() {
  return (
    <section
      id="precios"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SubscriptionProvider companyId={null}>
          <PlansSection
            hideBackLink
            sectionTitle="Planes"
            sectionSubtitle="Elige el plan que mejor se adapte a tu negocio. Free, Starter, Pro o Agencia."
            showBtnStart={false}
          />
        </SubscriptionProvider>
      </div>
    </section>
  );
}
