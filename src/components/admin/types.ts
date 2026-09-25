export type AdminUserRow = {
  id: string;
  name: string | null;
  lastName: string | null;
  secondLastName: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  verified: boolean | null;
  roles: Array<{ name: string }>;
  company: { id: string; name: string | null } | null;
};

export type AdminRoleOption = {
  id: string;
  name: string;
};

export type AdminBlogSubscriptionRow = {
  id: string;
  email: string | null;
  product: string | null;
  active: boolean | null;
  createdAt: string | null;
  user: { id: string } | null;
};

export type AdminUserDetail = Omit<AdminUserRow, "roles"> & {
  roles: AdminRoleOption[];
};

export type AdminSubscriptionRow = {
  id: string;
  planName: string | null;
  planCost: number | null;
  planCurrency: string | null;
  planFrequency: string | null;
  planLeadLimit: number | null;
  planFeatures: unknown;
  status: string | null;
  activatedAt: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string | null;
  company: {
    id: string;
    name: string | null;
    purchasedBonusCredits: number | null;
    creditPeriods: Array<{
      id: string;
      planAllowance: number | null;
      bonusAllowance: number | null;
      used: number | null;
    }>;
    users: Array<{
      id: string;
      name: string | null;
      lastName: string | null;
      email: string | null;
    }>;
  } | null;
};

export type AdminPlanRow = {
  id: string;
  name: string | null;
  cost: number | null;
  costOld: number | null;
  currency: string | null;
  frequency: string | null;
  leadLimit: number | null;
  planFeatures: unknown;
  active: boolean | null;
  bestSeller: boolean | null;
  referralUpfrontCommissionPct: number | null;
  referralRecurringCommissionPct: number | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  updatedAt: string | null;
  subscriptionsCount: number | null;
};

/** Borrador editable de un plan. Montos y textos vienen de inputs. */
export type AdminPlanDraft = {
  name: string;
  cost: string;
  costOld: string;
  currency: string;
  frequency: string;
  leadLimit: string;
  active: boolean;
  bestSeller: boolean;
  referralUpfrontCommissionPct: string;
  referralRecurringCommissionPct: string;
  stripePriceId: string;
  stripeProductId: string;
  /** Módulos con nombre/descripción editables (lo que se publica en precios). */
  features: Array<{
    key: string;
    name: string;
    description: string;
    included: boolean;
  }>;
};

export type StripePlanCheckField = {
  field: string;
  label: string;
  local: string | null;
  stripe: string | null;
  match: boolean;
};

export type StripePlanCheckResult = {
  success: boolean;
  message: string;
  allMatch: boolean;
  checkedAt: string | null;
  priceId: string | null;
  priceActive: boolean | null;
  productId: string | null;
  productName: string | null;
  productActive: boolean | null;
  livemode: boolean | null;
  subscriptionsCount: number | null;
  fields: StripePlanCheckField[];
};

export type AdminPetPlaceRow = {
  id: string;
  name: string;
  slug: string | null;
  municipality: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  verified: boolean | null;
  verifiedAt: string | null;
  claimStatus: string | null;
  pipelineStatus: string | null;
  claimRole: string | null;
  claimPhone: string | null;
  claimNotes: string | null;
  claimedAt: string | null;
  createdAt: string | null;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export type AdminPetPlaceServiceRow = {
  id: string;
  name: string | null;
  description: string | null;
  status: string | null;
  active: boolean | null;
  createdAt: string | null;
  requestedBy: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
  requestedFor: {
    id: string;
    name: string | null;
    municipality: string | null;
    state: string | null;
  } | null;
};

export type AdminOverviewData = {
  usersCount: number;
  activeSubscriptions: number;
  pendingPlaces: number;
  verifiedPlaces: number;
  pendingServices: number;
  pendingPetPlaces: AdminPetPlaceRow[];
  pendingPetPlaceServices: AdminPetPlaceServiceRow[];
};
