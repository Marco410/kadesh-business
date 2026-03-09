"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
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
import { EVENT_COLORS, PLAN_FEATURE_KEYS } from "../constants";
import { hasPlanFeature } from "../helpers/plan-features";
import { useSubscription } from "../SubscriptionContext";

const buttonClassName =
  "inline-flex text-center text-white items-center gap-2 px-4 py-2.5 rounded-lg border border-[#e0e0e0] dark:border-[#3a3a3a] text-sm font-medium hover:bg-[#f5f5f5] dark:hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-orange-500 w-full";

export interface LeadCrmActionsProps {
  leadId: string;
  userId: string;
}

export default function LeadCrmActions({
  leadId,
  userId,
}: LeadCrmActionsProps) {
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const { subscription } = useSubscription();


  const activitiesWhere: TechSalesActivitiesVariables["where"] = {
    AND: [
      {
        assignedSeller: { id: { equals: userId } },
        businessLead: { id: { equals: leadId } },
      },
    ],
  };

  const proposalsWhere: TechProposalsVariables["where"] = {
    AND: [
      {
        assignedSeller: { id: { equals: userId } },
        businessLead: { id: { equals: leadId } },
      },
    ],
  };

  const followUpTasksWhere: TechFollowUpTasksVariables["where"] = {
    AND: [
      {
        assignedSeller: { id: { equals: userId } },
        businessLead: { id: { equals: leadId } },
      },
    ],
  };

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

  const activitiesCount = countData?.techSalesActivitiesCount ?? 0;
  const proposalsCount = proposalsCountData?.techProposalsCount ?? 0;
  const followUpCount = followUpCountData?.techFollowUpTasksCount ?? 0;

  const handleNewProposal = () => {
    setProposalModalOpen(true);
  };
  const handleNewActivity = () => {
    setActivityModalOpen(true);
  };
  const handleNewFollowUp = () => {
    setFollowUpModalOpen(true);
  };

  console.log("subscription", subscription);

  return (
    <div className="flex flex-col gap-4 p-4">
       <p className="text-xs font-semibold uppercase tracking-wide text-[#616161] dark:text-[#b0b0b0]">
          Acciones
        </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
            <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Actividades registradas
            </p>
            <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
              {activitiesCount}
            </p>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
            <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Propuestas
            </p>
            <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
              {proposalsCount}
            </p>
        </div>
        <div className="rounded-xl border border-[#e0e0e0] dark:border-[#3a3a3a] bg-white dark:bg-[#1e1e1e] p-4 shadow-sm">
            <p className="text-sm font-medium text-[#616161] dark:text-[#b0b0b0]">
            Seguimientos programados
            </p>
            <p className="text-2xl font-bold text-[#212121] dark:text-[#ffffff] mt-1">
              {followUpCount}
            </p>
        </div>
      </div>
      <div className="">
       
        <div className="flex flex-row gap-3 ">
          {hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.SALES_ACTIVITIES) && (
          <button
            type="button"
            onClick={handleNewActivity}
            className={`${buttonClassName} ${EVENT_COLORS.activity}`}
          >
            <HugeiconsIcon icon={MessageEditIcon} size={16} className="text-white" />
            Registrar actividad
          </button>
          )}
          {hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.PROPOSALS) && (
          <button
            type="button"
            onClick={handleNewProposal}
            className={`${buttonClassName} ${EVENT_COLORS.proposal}`}
          >
            <HugeiconsIcon icon={FileAttachmentIcon} size={16} className="text-white" />
            Registrar propuesta
          </button>
          )}
          {hasPlanFeature(subscription?.planFeatures, PLAN_FEATURE_KEYS.FOLLOW_UP_TASKS) && (
          <button
            type="button"
            onClick={handleNewFollowUp}
              className={`${buttonClassName} ${EVENT_COLORS.followup}`}
          >
            <HugeiconsIcon icon={Calendar02Icon} size={16} className="text-white" />
            Programar seguimiento
          </button>
          )}
        </div>
      </div>
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
