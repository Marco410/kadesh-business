export type AuthenticatedItem = User;

export interface User {
  id: string;
  name: string;
  lastName: string;
  secondLastName?: string | null;
  username: string;
  email: string;
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
}