import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Footer, Navigation } from 'kadesh/components/layout';
import UnsubscribeBlogClient from 'kadesh/components/blog/UnsubscribeBlogClient';

export const metadata: Metadata = {
  title: 'Cancelar suscripción | Blog Kadesh Negocios',
  robots: { index: false, follow: false },
};

export default function UnsubscribeBlogPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#121212]">
      <Navigation />
      <main>
        <Suspense fallback={null}>
          <UnsubscribeBlogClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
