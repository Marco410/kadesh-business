"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { sileo } from "sileo";
import {
  GRANT_ADMIN_CREDITS_MUTATION,
  UPDATE_ADMIN_SUBSCRIPTION_MUTATION,
  type GrantAdminCreditsResponse,
} from "../queries";
import type { AdminSubscriptionRow } from "../types";
import { formatCredits } from "../ui";
import type { AdminCompanyProfile } from "./clients-queries";

/** Queries del 360 que cambian al ajustar el plan o agregar créditos. */
const REFETCH_AFTER_ADJUST = [
  "AdminCompanyProfile",
  "AdminCompanyBilling",
  "AdminCompanyInsights",
  "AdminCompanyCreditPeriods",
  "AdminCompanyLedger",
  "AdminCompaniesList",
  "AdminActivityFeed",
];

export type AdjustSubscriptionArgs = {
  subscriptionId: string;
  planFeaturesPayload: Array<{ key: string; included: boolean }>;
  activatedAt?: string | null;
  currentPeriodEnd?: string | null;
  creditsToAdd?: number;
};

/** Arma la fila que espera `AdminSubscriptionEditor` a partir de la ficha del 360. */
export function subscriptionRowFromProfile(
  company: AdminCompanyProfile | null | undefined,
): AdminSubscriptionRow | null {
  const sub = company?.subscriptions[0];
  if (!company || !sub) return null;
  return {
    ...sub,
    company: {
      id: company.id,
      name: company.name,
      purchasedBonusCredits: company.purchasedBonusCredits,
      creditPeriods: company.creditPeriods,
      users: company.users.slice(0, 4).map((u) => ({
        id: u.id,
        name: u.name,
        lastName: u.lastName,
        email: u.email,
      })),
    },
  };
}

/**
 * "Ajustar plan": agrega créditos extra (si se pidieron) y guarda módulos y fechas.
 * Misma lógica que tenía la lista de Suscripciones.
 */
export function useAdjustSubscription(companyId: string | null | undefined) {
  const [saving, setSaving] = useState(false);
  const [grantCredits] = useMutation<GrantAdminCreditsResponse>(
    GRANT_ADMIN_CREDITS_MUTATION,
  );
  const [updateSubscription] = useMutation(UPDATE_ADMIN_SUBSCRIPTION_MUTATION, {
    refetchQueries: REFETCH_AFTER_ADJUST,
  });

  async function save(args: AdjustSubscriptionArgs): Promise<boolean> {
    const creditsToAdd = Math.floor(args.creditsToAdd ?? 0);
    const willGrantCredits = creditsToAdd >= 1;

    if (willGrantCredits && !companyId) {
      sileo.error({
        title: "No se pudieron agregar créditos",
        description: "Esta suscripción no tiene empresa vinculada.",
      });
      return false;
    }

    setSaving(true);
    try {
      if (willGrantCredits && companyId) {
        const grantResult = await grantCredits({
          variables: {
            input: {
              companyId,
              subscriptionId: args.subscriptionId,
              amount: creditsToAdd,
            },
          },
        });
        const grant = grantResult.data?.grantAdminCredits;
        if (!grant?.success) {
          sileo.error({
            title: "No se pudieron agregar créditos",
            description: grant?.message ?? "Intenta de nuevo.",
          });
          return false;
        }
      }

      await updateSubscription({
        variables: {
          where: { id: args.subscriptionId },
          data: {
            planFeatures: args.planFeaturesPayload,
            ...(args.activatedAt ? { activatedAt: args.activatedAt } : {}),
            ...(args.currentPeriodEnd ? { currentPeriodEnd: args.currentPeriodEnd } : {}),
          },
        },
      });
      sileo.success({
        title: willGrantCredits
          ? `Plan actualizado · +${formatCredits(creditsToAdd)} créditos`
          : "Plan actualizado",
      });
      return true;
    } catch (err) {
      sileo.error({
        title: willGrantCredits
          ? "No se pudieron guardar los cambios"
          : "No se pudo guardar el plan",
        description: err instanceof Error ? err.message : "Intenta de nuevo.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }

  return { save, saving };
}
