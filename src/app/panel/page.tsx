import { PanelPageSection } from "kadesh/components/panel";

type PanelPageProps = {
  searchParams: Promise<{ tab?: string | string[] }>;
};

export default async function PanelPage({ searchParams }: PanelPageProps) {
  const params = await searchParams;
  const tab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  return <PanelPageSection initialTab={tab ?? null} />;
}
