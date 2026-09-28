import dynamic from "next/dynamic";
import {
  HeroSection,
  HeroDifferentiatorsBadges,
  WhatIsKadeshSection,
  HomeJsonLd,
} from "kadesh/components/home";
import { Footer, Navigation } from "kadesh/components/layout";
import { FloatingWhatsAppButton } from "kadesh/components/shared";

const CategoriesMarqueeSection = dynamic(
  () => import("kadesh/components/home/CategoriesMarqueeSection"),
);
const WhyKadeshSection = dynamic(
  () => import("kadesh/components/home/WhyKadeshSection"),
);
const LeadCostComparisonSection = dynamic(
  () => import("kadesh/components/home/LeadCostComparisonSection"),
);
const InteractiveDemoSection = dynamic(
  () => import("kadesh/components/home/InteractiveDemoSection"),
);
const RealDataSection = dynamic(
  () => import("kadesh/components/home/RealDataSection"),
);
const UniqueLeadsSection = dynamic(
  () => import("kadesh/components/home/UniqueLeadsSection"),
);
const PlatformShowcaseSection = dynamic(
  () => import("kadesh/components/home/PlatformShowcaseSection"),
);
const KadeshAiSection = dynamic(
  () => import("kadesh/components/home/KadeshAiSection"),
);
const PersonaBenefitsSection = dynamic(
  () => import("kadesh/components/home/PersonaBenefitsSection"),
);
const ScheduleDemoSection = dynamic(
  () => import("kadesh/components/home/ScheduleDemoSection"),
);
const GrowthValueSection = dynamic(
  () => import("kadesh/components/home/GrowthValueSection"),
);
const SocialProofBanner = dynamic(
  () => import("kadesh/components/home/SocialProofBanner"),
);
const AlliesSection = dynamic(
  () => import("kadesh/components/allies/AlliesSection"),
);
const AgencyTestimonialsSection = dynamic(
  () => import("kadesh/components/home/AgencyTestimonialsSection"),
);
const LandingPricingSection = dynamic(
  () => import("kadesh/components/home/LandingPricingSection"),
);
const ReferralSection = dynamic(
  () => import("kadesh/components/home/ReferralSection"),
);
const FinalCTASection = dynamic(
  () => import("kadesh/components/home/FinalCTASection"),
);
const FAQSection = dynamic(() => import("kadesh/components/home/FAQSection"));

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <FloatingWhatsAppButton />
      <main className="min-h-screen">
        <Navigation />
        <HeroSection />
        <HeroDifferentiatorsBadges />
        <WhatIsKadeshSection />
        <CategoriesMarqueeSection />
        <WhyKadeshSection />
        <LeadCostComparisonSection />
        <InteractiveDemoSection />
        <RealDataSection />
        <UniqueLeadsSection />
        <PlatformShowcaseSection />
        <KadeshAiSection />
        <PersonaBenefitsSection />
        <ScheduleDemoSection />
        <GrowthValueSection />
        <SocialProofBanner />
        <AlliesSection />
        <AgencyTestimonialsSection />
        <LandingPricingSection />
        <ReferralSection />
        <FinalCTASection />
        <FAQSection />
        <Footer />
      </main>
    </>
  );
}
