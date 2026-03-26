import {
  HeroSection,
  ScheduleDemoSection,
  HeroDifferentiatorsBadges,
  CategoriesMarqueeSection,
  InteractiveDemoSection,
  ContactProspectsSection,
  PowerOfDataSection,
  GoogleMapsDataSection,
  UniqueLeadsSection,
  CRMWorkflowSection,
  OrganizeProspectsSection,
  NewProspectsMonthlySection,
  ConvertProspectsSection,
  SocialProofBanner,
  AgencyTestimonialsSection,
  LandingPricingSection,
  ReferralSection,
  FinalCTASection,
  FAQSection,
} from "kadesh/components/home";
import { Footer, Navigation } from "kadesh/components/layout";

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen">
        <Navigation />
        <HeroSection />
        <HeroDifferentiatorsBadges />
        <CategoriesMarqueeSection />
        <InteractiveDemoSection />
        <ContactProspectsSection />
        <PowerOfDataSection />
        <GoogleMapsDataSection />
        <UniqueLeadsSection />
        <CRMWorkflowSection />
        <OrganizeProspectsSection />
        <ScheduleDemoSection />
        <NewProspectsMonthlySection />
        <ConvertProspectsSection />
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
