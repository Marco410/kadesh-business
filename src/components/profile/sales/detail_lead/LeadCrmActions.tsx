"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Calendar02Icon,
  FileAttachmentIcon,
  MessageEditIcon,
} from "@hugeicons/core-free-icons";
import RegisterActivityModal from "./RegisterActivityModal";
import RegisterProposalModal from "./RegisterProposalModal";
import RegisterFollowUpModal from "./RegisterFollowUpModal";
import {
  TECH_SALES_ACTIVITIES_COUNT_QUERY,
  TECH_PROPOSALS_COUNT_QUERY,
  TECH_FOLLOW_UP_TASKS_COUNT_QUERY,
  type TechSalesActivitiesVariables,
  type TechSalesActivitiesCountResponse,
  type TechProposalsVariables,
  type TechProposalsCountResponse,
  type TechFollowUpTasksVariables,
  type TechFollowUpTasksCountResponse,
} from "kadesh/components/profile/sales/queries";
import { mergeWorkspaceFilter } from "kadesh/components/profile/sales/workspaces/merge-workspace-where";
import { useWorkspaceContext } from "kadesh/components/profile/sales/workspaces/WorkspaceContext";
import { PLAN_FEATURE_KEYS } from "kadesh/constants/constans";
import { hasPlanFeature } from "../helpers/plan-features";
import { useSubscription } from "../SubscriptionContext";

export interface LeadCrmActionsProps {
  leadId: string;
  userId: string;
}

const ACTION_CARDS = [
  {
    key: "activity" as const,
    label: "Actividades",
    cta: "Registrar",
    feature: PLAN_FEATURE_KEYS.SALES_ACTIVITIES,
    icon: MessageEditIcon,
    tone:
      "border-orange-200/80 dark:border-orange-500/25 from-orange-500/12 dark:from-orange-500/15 ring-orange-500/10 dark:ring-orange-400/10 text-orange-600 dark:text-orange-400",
  },
  {
    key: "proposal" as const,
    label: "Propuestas",
    cta: "Registrar",
    feature: PLAN_FEATURE_KEYS.PROPOSALS,
    icon: FileAttachmentIcon,
    tone:
      "border-blue-200/80 dark:border-blue-500/25 from-blue-500/12 dark:from-blue-500/15 ring-blue-500/10 dark:ring-blue-400/10 text-blue-600 dark:text-blue-400",
  },
  {
    key: "followup" as const,
    label: "Seguimientos",
    cta: "Programar",
    feature: PLAN_FEATURE_KEYS.FOLLOW_UP_TASKS,
    icon: Calendar02Icon,
    tone:
      "border-emerald-200/80 dark:border-emerald-500/25 from-emerald-500/12 dark:from-emerald-500/15 ring-emerald-500/10 dark:ring-emerald-400/10 text-emerald-600 dark:text-emerald-400",
  },
] as const;

export default function LeadCrmActions({
  leadId,
  userId,
}: LeadCrmActionsProps) {
  const { currentWorkspaceId } = useWorkspaceContext();
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const { subscription } = useSubscription();

  const activitiesWhere: TechSalesActivitiesVariables["where"] =
    mergeWorkspaceFilter(
      {
        AND: [
          {
            assignedSeller: { id: { equals: userId } },
            businessLead: { id: { equals: leadId } },
          },
        ],
      },
      currentWorkspaceId
    );

  const proposalsWhere: TechProposalsVariables["where"] = mergeWorkspaceFilter(
    {
      AND: [
        {
          assignedSeller: { id: { equals: userId } },
          businessLead: { id: { equals: leadId } },
        },
      ],
    },
    currentWorkspaceId
  );

  const followUpTasksWhere: TechFollowUpTasksVariables["where"] =
    mergeWorkspaceFilter(
      {
        AND: [
          {
            assignedSeller: { id: { equals: userId } },
            businessLead: { id: { equals: leadId } },
          },
        ],
      },
      currentWorkspaceId
    );

  const { data: countData } = useQuery<
    TechSalesActivitiesCountResponse,
    TechSalesActivitiesVariables
  >(TECH_SALES_ACTIVITIES_COUNT_QUERY, {
    variables: { where: activitiesWhere },
    skip: !leadId || !userId,
    fetchPolicy: "network-only",
  });

  const { data: proposalsCountData } = useQuery<
    TechProposalsCountResponse,
    TechProposalsVariables
  >(TECH_PROPOSALS_COUNT_QUERY, {
    variables: { where: proposalsWhere },
    skip: !leadId || !userId,
    fetchPolicy: "network-only",
  });

  const { data: followUpCountData } = useQuery<
    TechFollowUpTasksCountResponse,
    TechFollowUpTasksVariables
  >(TECH_FOLLOW_UP_TASKS_COUNT_QUERY, {
    variables: { where: followUpTasksWhere },
    skip: !leadId || !userId,
    fetchPolicy: "network-only",
  });

  const counts = {
    activity: countData?.techSalesActivitiesCount ?? 0,
    proposal: proposalsCountData?.techProposalsCount ?? 0,
    followup: followUpCountData?.techFollowUpTasksCount ?? 0,
  };

  const openModal = (key: (typeof ACTION_CARDS)[number]["key"]) => {
    if (key === "activity") setActivityModalOpen(true);
    if (key === "proposal") setProposalModalOpen(true);
    if (key === "followup") setFollowUpModalOpen(true);
  };

  return (
    <div className="contents">
      {ACTION_CARDS.map((card) => {
        const enabled = hasPlanFeature(
          subscription?.planFeatures,
          card.feature
        );
        const count = counts[card.key];
        const className = `flex min-w-0 items-center gap-2.5 rounded-xl border bg-gradient-to-br to-transparent px-3 py-2.5 text-left shadow-sm ring-1 ring-inset transition-[transform,border-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] ${card.tone} ${
          enabled
            ? "hover:-translate-y-px hover:border-orange-400/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            : "opacity-50 cursor-not-allowed"
        }`;

        const body = (
          <>
            <HugeiconsIcon icon={card.icon} size={18} className="shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11px] font-medium text-[#616161] dark:text-[#b0b0b0]">
                {card.label}
              </span>
              <span className="tabular-nums text-lg font-bold leading-none text-[#212121] dark:text-white">
                {count}
              </span>
            </span>
            {enabled ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-white/70 px-2 py-1 text-xs font-semibold dark:bg-black/25">
                <HugeiconsIcon icon={Add01Icon} size={14} />
                {card.cta}
              </span>
            ) : null}
          </>
        );

        if (!enabled) {
          return (
            <div key={card.key} className={className}>
              {body}
            </div>
          );
        }

        return (
          <button
            key={card.key}
            type="button"
            onClick={() => openModal(card.key)}
            className={className}
            aria-label={`${card.cta} ${card.label.toLowerCase()}`}
          >
            {body}
          </button>
        );
      })}
      <RegisterActivityModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        leadId={leadId}
        userId={userId}
      />
      <RegisterProposalModal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        leadId={leadId}
        userId={userId}
      />
      <RegisterFollowUpModal
        isOpen={followUpModalOpen}
        onClose={() => setFollowUpModalOpen(false)}
        leadId={leadId}
        userId={userId}
      />
    </div>
  );
}
