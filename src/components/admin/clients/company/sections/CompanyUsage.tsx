"use client";

import {
  USAGE_SUBVIEWS,
  USAGE_SUBVIEW_ITEMS,
  parseUsageSubview,
  type UsageSubview,
} from "../../../constants";
import { useAdminNavigation } from "../../../hooks/useAdminNavigation";
import { AdminSegmented } from "../../../ui";
import type { AdminCompanyInsights } from "../../clients-queries";
import AiView from "./usage/AiView";
import CreditsView from "./usage/CreditsView";
import ExtractionsView from "./usage/ExtractionsView";

/** Lo que gasta la empresa: créditos, extracciones e IA. */
export default function CompanyUsage({
  companyId,
  insights,
}: {
  companyId: string;
  insights: AdminCompanyInsights | null;
}) {
  const { searchParams, setParams } = useAdminNavigation();
  const sub = parseUsageSubview(searchParams.get("sub"));

  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented<UsageSubview>
        ariaLabel="Vista de consumo"
        items={USAGE_SUBVIEW_ITEMS}
        value={sub}
        onChange={(next) => setParams({ sub: next === USAGE_SUBVIEWS.CREDITS ? null : next })}
      />
      {sub === USAGE_SUBVIEWS.CREDITS ? <CreditsView companyId={companyId} /> : null}
      {sub === USAGE_SUBVIEWS.EXTRACTIONS ? (
        <ExtractionsView companyId={companyId} insights={insights} />
      ) : null}
      {sub === USAGE_SUBVIEWS.AI ? <AiView companyId={companyId} insights={insights} /> : null}
    </div>
  );
}
