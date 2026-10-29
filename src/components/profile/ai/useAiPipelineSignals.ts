"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client";
import {
  FOLLOW_UP_TASK_STATUS,
  PIPELINE_STATUS,
  QUOTATION_STATUS,
} from "kadesh/constants/constans";
import { useUser } from "kadesh/utils/UserContext";
import {
  AI_COLD_LEAD_DAYS,
  AI_PIPELINE_SIGNALS,
  type AiPipelineSignalKey,
} from "./constants";
import {
  AI_PIPELINE_SIGNALS_QUERY,
  type AiPipelineSignalsResponse,
  type AiPipelineSignalsVariables,
} from "./queries";

const MEXICO_TZ = "America/Mexico_City";

function mexicoDayKey(daysAgo = 0): string {
  const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MEXICO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export type AiPipelineSignal = {
  key: AiPipelineSignalKey;
  label: string;
  hint: string;
  count: number;
  /** 1 = lo primero que mira el resumen del día. */
  priority: number;
};

/**
 * Cuántos pendientes hay en cada cosa que revisa el resumen del día.
 * No usa la IA: son conteos del CRM, así que se ven aunque la IA esté apagada.
 */
export function useAiPipelineSignals(
  companyId: string | null,
  isCompanyWide: boolean,
) {
  const { user } = useUser();
  const userId = user?.id ?? "";

  const variables = useMemo<AiPipelineSignalsVariables | null>(() => {
    if (!companyId || (!isCompanyWide && !userId)) return null;
    const today = mexicoDayKey();
    const coldSince = mexicoDayKey(AI_COLD_LEAD_DAYS);
    const sellerLeads = isCompanyWide
      ? {}
      : {
          businessLead: {
            salesPerson: { some: { id: { equals: userId } } },
          },
        };
    const sellerTasks = isCompanyWide
      ? {}
      : { assignedSeller: { id: { equals: userId } } };

    return {
      companyId,
      quotesWhere: {
        status: { equals: QUOTATION_STATUS.SENT },
        ...sellerTasks,
      },
      uncontactedWhere: {
        pipelineStatus: {
          in: [PIPELINE_STATUS.DETECTADO, PIPELINE_STATUS.SELECCIONADO],
        },
        ...sellerLeads,
      },
      coldWhere: {
        AND: [
          sellerLeads,
          {
            OR: [
              { pipelineStatus: { equals: PIPELINE_STATUS.SIN_RESPUESTA } },
              {
                AND: [
                  { firstContactDate: { lte: coldSince } },
                  {
                    pipelineStatus: {
                      notIn: [
                        PIPELINE_STATUS.DETECTADO,
                        PIPELINE_STATUS.SELECCIONADO,
                        PIPELINE_STATUS.CERRADO_GANADO,
                        PIPELINE_STATUS.CERRADO_PERDIDO,
                        PIPELINE_STATUS.DESCARTADO,
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      overdueWhere: {
        status: {
          in: [FOLLOW_UP_TASK_STATUS.PENDIENTE, FOLLOW_UP_TASK_STATUS.POSPUESTO],
        },
        scheduledDate: { lt: today },
        businessLead: {
          saasCompany: { some: { id: { equals: companyId } } },
        },
        ...sellerTasks,
      },
    };
  }, [companyId, isCompanyWide, userId]);

  const { data, loading, error } = useQuery<
    AiPipelineSignalsResponse,
    AiPipelineSignalsVariables
  >(AI_PIPELINE_SIGNALS_QUERY, {
    variables: variables ?? undefined,
    skip: !variables,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const signals = useMemo<AiPipelineSignal[]>(() => {
    if (!data) return [];
    const counts: Record<AiPipelineSignalKey, number> = {
      overdueFollowUps: data.overdueFollowUps ?? 0,
      quotesWithoutReply: data.saasCompany?.quotesWithoutReply ?? 0,
      uncontactedLeads: data.saasCompany?.uncontactedLeads ?? 0,
      coldLeads: data.saasCompany?.coldLeads ?? 0,
    };
    return AI_PIPELINE_SIGNALS.map((signal, index) => ({
      key: signal.key,
      label: signal.label,
      hint:
        signal.key === "coldLeads"
          ? `${signal.hint} en ${AI_COLD_LEAD_DAYS} días`
          : signal.hint,
      count: counts[signal.key],
      priority: index + 1,
    }));
  }, [data]);

  const total = signals.reduce((sum, signal) => sum + signal.count, 0);

  return {
    signals,
    total,
    loading: loading && !data,
    error: error && !data ? error : null,
  };
}
