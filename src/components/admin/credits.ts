import type { AdminSubscriptionRow } from "./types";

export function getCurrentCreditPeriodParts() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export type SubscriptionCreditsSummary = {
  remaining: number;
  plan: number;
  bonus: number;
  used: number;
  extra: number;
  hasPeriod: boolean;
};

export function getSubscriptionCredits(
  subscription: AdminSubscriptionRow | null | undefined,
): SubscriptionCreditsSummary {
  const period = subscription?.company?.creditPeriods?.[0];
  const extra = subscription?.company?.purchasedBonusCredits ?? 0;
  const plan = period?.planAllowance ?? subscription?.planLeadLimit ?? 0;
  const bonus = period?.bonusAllowance ?? extra;
  const used = period?.used ?? 0;
  return {
    remaining: Math.max(0, plan + bonus - used),
    plan,
    bonus,
    used,
    extra,
    hasPeriod: Boolean(period),
  };
}
