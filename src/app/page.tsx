import {
  HeroSection,
  HeroDifferentiatorsBadges,
  CategoriesMarqueeSection,
  WhyKadeshSection,
  LeadCostComparisonSection,
  InteractiveDemoSection,
  RealDataSection,
  UniqueLeadsSection,
  PlatformShowcaseSection,
  PersonaBenefitsSection,
  ScheduleDemoSection,
  GrowthValueSection,
  SocialProofBanner,
  AgencyTestimonialsSection,
  LandingPricingSection,
  ReferralSection,
  FinalCTASection,
  FAQSection,
} from "kadesh/components/home";
import { AlliesSection } from "kadesh/components/allies";
import { Footer, Navigation } from "kadesh/components/layout";
import { FloatingWhatsAppButton } from "kadesh/components/shared";

export default function HomePage() {
  return (
    <>
      <FloatingWhatsAppButton />
      <main className="min-h-screen">
        <Navigation />
        <HeroSection />
        <HeroDifferentiatorsBadges />
        <CategoriesMarqueeSection />
        <WhyKadeshSection />
        <LeadCostComparisonSection />
        <InteractiveDemoSection />
        <RealDataSection />
        <UniqueLeadsSection />
        <PlatformShowcaseSection />
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
