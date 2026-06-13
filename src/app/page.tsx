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
