export type AuthenticatedItem = User;

export interface User {
  id: string;
  name: string;
  lastName: string;
  secondLastName?: string | null;
  username: string;
  email: string;
  businessEmail?: string | null;
  businessPhone?: string | null;
  verified: boolean;
  phone?: string | null;
  profileImage?: {
    url: string;
  } | null;
  roles?: {
    name: string;
  }[] | null;
  birthday?: string | null;
  age?: string | null;
  createdAt: string;
  salesComission?: number | null;
}