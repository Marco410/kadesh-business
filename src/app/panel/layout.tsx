import { FloatingWhatsAppButton } from "kadesh/components/shared";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FloatingWhatsAppButton showPrompts />
    </>
  );
}
