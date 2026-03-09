"use client";

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery } from "@apollo/client";
import {
  SUBSCRIPTION_STATUS_QUERY,
  type SubscriptionStatusResponse,
  type SubscriptionStatusVariables,
  type SubscriptionData,
} from "./queries";

interface SubscriptionContextType {
  /** Subscription from custom subscriptionStatus(companyId) resolver. */
  subscription: SubscriptionData | null | undefined;
  /** Whether the subscription query is in flight. */
  loading: boolean;
  /** Refetch subscription status (e.g. after plan change). */
  refreshSubscription: () => Promise<unknown>;
  /** Company id passed to the provider (may be null before user/company is loaded). */
  companyId: string | null;
  /** Raw result: success, message, daysUntilNextBilling, subscriptionActive. */
  result: SubscriptionStatusResponse["subscriptionStatus"] | null;
  /** Message from the subscription status query. */
  message: string | null;
  /** Days until next billing. */
  daysUntilNextBilling: number | null;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: undefined,
  loading: true,
  refreshSubscription: async () => {},
  companyId: null,
  result: null,
  message: null,
  daysUntilNextBilling: null,
});

interface SubscriptionProviderProps {
  companyId: string | null;
  children: ReactNode;
}

export function SubscriptionProvider({ companyId, children }: SubscriptionProviderProps) {
  const { data, loading, refetch } = useQuery<
    SubscriptionStatusResponse,
    SubscriptionStatusVariables
  >(SUBSCRIPTION_STATUS_QUERY, {
    variables: { companyId },
    skip: companyId == null || companyId === "",
  });

  const refreshSubscription = useCallback(async () => {
    return refetch();
  }, [refetch]);

  const result = data?.subscriptionStatus ?? null;
  const subscription = result?.subscription ?? undefined;

  const value: SubscriptionContextType = {
    subscription: subscription ?? null,
    loading,
    refreshSubscription,
    companyId,
    result,
    daysUntilNextBilling: result?.daysUntilNextBilling ?? null,
    message: result?.message ?? null,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
