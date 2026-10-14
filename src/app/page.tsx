import dynamic from "next/dynamic";
import { HeroSection, HomeJsonLd } from "kadesh/components/home";
import LandingStatsBand from "kadesh/components/home/LandingStatsBand";
import PainSection from "kadesh/components/home/PainSection";
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
const TestimonialsSection = dynamic(
  () => import("kadesh/components/home/TestimonialsSection"),
);
const LandingPricingSection = dynamic(
  () => import("kadesh/components/home/LandingPricingSection"),
);
const FinalCTASection = dynamic(
  () => import("kadesh/components/home/FinalCTASection"),
);
const FAQSection = dynamic(() => import("kadesh/components/home/FAQSection"));
const ReferralTeaserBand = dynamic(
  () => import("kadesh/components/home/ReferralTeaserBand"),
);

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <FloatingWhatsAppButton />
      <main className="min-h-screen">
        <Navigation overDarkHero />
        <HeroSection />
        <LandingStatsBand />
        {/* Dolor antes que producto: nombra lo que el vendedor ya vive. */}
        <PainSection />
        <CategoriesMarqueeSection />
        <InteractiveDemoSection />
        <LeadCostComparisonSection />
        <PlatformShowcaseSection />
        <KadeshAiSection />
        <WhyKadeshSection />
        <RealDataSection />
        <UniqueLeadsSection />
        <PersonaBenefitsSection />
        <ScheduleDemoSection />
        <GrowthValueSection />
        <SocialProofBanner />
        <TestimonialsSection />
        <LandingPricingSection />
        <FinalCTASection />
        <FAQSection />
        {/* Referidos y aliados salen del flujo principal: franja aquí y aliados en el footer. */}
        <ReferralTeaserBand />
        <Footer />
      </main>
    </>
  );
}
