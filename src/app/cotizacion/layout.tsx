import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cotización",
  robots: { index: false, follow: false },
};

export default function PublicQuotationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
