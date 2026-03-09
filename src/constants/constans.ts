export const SOCIAL_LINKS = [
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61576878181992', icon: '/icons/fb.svg' },
  ];

export const DEFAULT_ANIMALS_PER_PAGE = 12;
export const DEFAULT_RADIUS = 30;
export const RADIUS_OPTIONS_ANIMALS = [10, 20, 30, 50] as const;

export const DEFAULT_RADIUS_VETERINARIES = 5;
export const RADIUS_OPTIONS_VETERINARIES = [5, 10, 15, 20, 30] as const;

export const VETERINARIES_PER_PAGE = 10;
export const FETCH_LIMIT_VETERINARIES = 100;


export enum Role {
  ADMIN = "admin",
  USER = "user",
  AUTHOR = "author",
  ADMIN_COMPANY = "admin_company",
  VENDEDOR = "vendedor",
}
