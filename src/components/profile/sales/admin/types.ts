export type CompanySubscriptionRow = {
    id: string | null;
    activatedAt: string | null;
    planCost: number | null;
    planCurrency: string | null;
    planFrequency: string | null;
    planLeadLimit: number | null;
    planName: string | null;
    planFeatures: unknown;
    status: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodEnd: string | null;
  };
  
  export type AdminCompanyUserRow = {
    id: string;
    name: string | null;
    lastName: string | null;
    secondLastName: string | null;
    email: string | null;
    roles: Array<{ name: string }>;
    company: { id: string; name: string; subscriptions: CompanySubscriptionRow[] } | null;
  };