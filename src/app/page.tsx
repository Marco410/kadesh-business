import {
  HeroSection,
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "KADESH Negocios",
    url: "https://www.negocios.kadesh.com.mx",
    description:
      "Prospección B2B inteligente: extrae leads desde Google Maps por categoría y radio. CRM integrado para ventas, propuestas y comisiones.",
    publisher: {
      "@type": "Organization",
      name: "KADESH Negocios",
      url: "https://www.negocios.kadesh.com.mx",
      logo: {
        "@type": "ImageObject",
        url: "https://www.negocios.kadesh.com.mx/logo.png",
      },
      areaServed: { "@type": "Country", name: "México" },
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "KADESH Negocios",
      applicationCategory: "BusinessApplication",
      description:
        "Sistema de prospección B2B que extrae leads desde Google Maps en tiempo real. Elige punto, categoría y radio; obtén nombres, teléfonos y ratings; gestiona ventas en un CRM integrado.",
      offers: {
        "@type": "Offer",
        category: "SaaS B2B",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

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
