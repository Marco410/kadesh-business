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
    users: Array<{
      id: string;
      name: string | null;
      lastName: string | null;
      email: string | null;
    }>;
  } | null;
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

export type AdminOverviewData = {
  usersCount: number;
  activeSubscriptions: number;
  pendingPlaces: number;
  verifiedPlaces: number;
  pendingPetPlaces: AdminPetPlaceRow[];
};
