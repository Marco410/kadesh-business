"use client";

import {
  CRM_SUBVIEWS,
  CRM_SUBVIEW_ITEMS,
  parseCrmSubview,
  type CrmSubview,
} from "../../../constants";
import { useAdminNavigation } from "../../../hooks/useAdminNavigation";
import { AdminSegmented } from "../../../ui";
import type { AdminCompanyInsights } from "../../clients-queries";
import FollowUpView from "./crm/FollowUpView";
import LeadsView from "./crm/LeadsView";
import PipelineView from "./crm/PipelineView";
import QuotationsView from "./crm/QuotationsView";
import WorkspacesView from "./crm/WorkspacesView";

/** CRM de la empresa en solo lectura: lo que ve su equipo, sin poder editarlo desde aquí. */
export default function CompanyCrm({
  companyId,
  insights,
}: {
  companyId: string;
  insights: AdminCompanyInsights | null;
}) {
  const { searchParams, setParams } = useAdminNavigation();
  const sub = parseCrmSubview(searchParams.get("sub"));

  return (
    <div className="flex flex-col gap-4">
      <AdminSegmented<CrmSubview>
        ariaLabel="Vista del CRM"
        items={CRM_SUBVIEW_ITEMS}
        value={sub}
        onChange={(next) => setParams({ sub: next === CRM_SUBVIEWS.LEADS ? null : next })}
      />
      {sub === CRM_SUBVIEWS.LEADS ? (
        <LeadsView companyId={companyId} pipeline={insights?.pipeline ?? []} />
      ) : null}
      {sub === CRM_SUBVIEWS.PIPELINE ? <PipelineView insights={insights} /> : null}
      {sub === CRM_SUBVIEWS.QUOTATIONS ? (
        <QuotationsView companyId={companyId} insights={insights} />
      ) : null}
      {sub === CRM_SUBVIEWS.FOLLOW_UP ? <FollowUpView companyId={companyId} /> : null}
      {sub === CRM_SUBVIEWS.WORKSPACES ? <WorkspacesView companyId={companyId} /> : null}
    </div>
  );
}
