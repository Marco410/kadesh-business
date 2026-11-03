import { FloatingWhatsAppButton } from "kadesh/components/shared";
import { Routes } from "kadesh/core/routes";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* Soporte para clientes: no en Operaciones (equipo de Kadesh). */}
      <FloatingWhatsAppButton showPrompts hiddenOn={[Routes.panelAdmin]} />
    </>
  );
}
