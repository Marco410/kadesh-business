import { Suspense } from "react";
import { Footer, Navigation } from "kadesh/components/layout";
import GoogleCalendarCallbackSection from "kadesh/components/profile/sales/google-calendar/GoogleCalendarCallbackSection";

export default function GoogleCalendarCallbackPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212]">
      <Navigation />
      <main className="mx-auto max-w-lg px-4 py-16 pt-28 sm:px-6">
        {/* useSearchParams exige Suspense en App Router */}
        <Suspense fallback={null}>
          <GoogleCalendarCallbackSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
