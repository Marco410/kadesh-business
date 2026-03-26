"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { sileo } from "sileo";
import { PLAN_FEATURE_KEYS } from "kadesh/constants/constans";
import type {
  SubscriptionData,
  SubscriptionStatusResponse,
} from "kadesh/components/profile/sales/queries";
import type { SubscriptionStatusVariables } from "kadesh/components/profile/sales/queries";
import { REFRESH_SUBSCRIPTION_STATUS_QUERY } from "../queries";
import type { PlanFeatureItem } from "kadesh/components/profile/sales/queries";

export type AdminCompanySubscriptionsDraftState = {
  subscriptionByCompanyId: Record<string, SubscriptionData | null>;
  draftBySubscriptionId: Record<string, Record<string, boolean>>;
  loadingSubscriptions: boolean;
  refreshCompanySubscription: (companyId: string, overwriteDraft: boolean) => Promise<void>;
  setDraftIncluded: (subscriptionId: string, featureKey: string, included: boolean) => void;
};

export function useAdminCompanySubscriptions(
  companyIds: string[],
): AdminCompanySubscriptionsDraftState {
  const featureKeys = useMemo(() => Object.values(PLAN_FEATURE_KEYS) as string[], []);

  const [subscriptionByCompanyId, setSubscriptionByCompanyId] = useState<
    Record<string, SubscriptionData | null>
  >({});
  const [draftBySubscriptionId, setDraftBySubscriptionId] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

  const [refreshSubscriptionQuery] = useLazyQuery<
    SubscriptionStatusResponse,
    SubscriptionStatusVariables
  >(REFRESH_SUBSCRIPTION_STATUS_QUERY, {
    fetchPolicy: "network-only",
  });

  const deriveDraftFromSubscription = useCallback(
    (subscription: SubscriptionData) => {
      const planFeatures = subscription.planFeatures ?? null;
      const next: Record<string, boolean> = {};

      for (const key of featureKeys) {
        const found = planFeatures?.find((f: PlanFeatureItem) => f.key === key);
        next[key] = found?.included ?? false;
      }

      return next;
    },
    [featureKeys],
  );

  const refreshCompanySubscription = useCallback(
    async (companyId: string, overwriteDraft: boolean) => {
      try {
        const { data } = await refreshSubscriptionQuery({
          variables: { companyId },
        });

        const subscription = data?.subscriptionStatus?.subscription ?? null;

        setSubscriptionByCompanyId((prev) => ({ ...prev, [companyId]: subscription }));

        const subscriptionId = subscription?.id;
        if (!subscriptionId) return;

        setDraftBySubscriptionId((prev) => {
          const existing = prev[subscriptionId];
          if (existing && !overwriteDraft) return prev;

          return {
            ...prev,
            [subscriptionId]: deriveDraftFromSubscription(subscription),
          };
        });
      } catch (err) {
        sileo.error({
          title: "Error al refrescar suscripción",
          description: err instanceof Error ? err.message : "Intenta de nuevo.",
        });
      }
    },
    [deriveDraftFromSubscription, refreshSubscriptionQuery],
  );

  const setDraftIncluded = useCallback(
    (subscriptionId: string, featureKey: string, included: boolean) => {
      setDraftBySubscriptionId((prev) => ({
        ...prev,
        [subscriptionId]: {
          ...(prev[subscriptionId] ?? {}),
          [featureKey]: included,
        },
      }));
    },
    [],
  );

  useEffect(() => {
    const uniqueCompanyIds = Array.from(new Set(companyIds)).filter(Boolean);
    if (uniqueCompanyIds.length === 0) {
      setSubscriptionByCompanyId({});
      setDraftBySubscriptionId({});
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoadingSubscriptions(true);
      try {
        await Promise.all(
          uniqueCompanyIds.map(async (companyId) => {
            if (cancelled) return;
            await refreshCompanySubscription(companyId, false);
          }),
        );
      } finally {
        if (!cancelled) setLoadingSubscriptions(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [companyIds, refreshCompanySubscription]);

  return {
    subscriptionByCompanyId,
    draftBySubscriptionId,
    loadingSubscriptions,
    refreshCompanySubscription,
    setDraftIncluded,
  };
}

