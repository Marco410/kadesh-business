export type AllyCategory = "family" | "partner";

export type Ally = {
  name: string;
  description: string;
  logoSrc: string;
  logoAlt: string;
  href: string;
  category: AllyCategory;
  /** Logo claro/oscuro: negro en light, blanco en dark (sin caja de fondo). */
  themeAdaptiveLogo?: boolean;
  /** Nombre junto al isotipo Kadesh. Pet y FOOD lo necesitan: el K solo no los distingue. */
  lockupName?: string;
};

export const ALLY_CATEGORY_LABEL: Record<AllyCategory, string> = {
  family: "Familia Kadesh",
  partner: "Aliado",
};

export const ALLIES: Ally[] = [
  {
    name: "Kadesh Pet",
    description:
      "Bienestar animal en México: reportes, adopciones y veterinarias cerca de ti.",
    logoSrc: "/logo.png",
    logoAlt: "Isotipo de Kadesh Pet",
    href: "https://pet.kadesh.com.mx/",
    category: "family",
    themeAdaptiveLogo: true,
    lockupName: "Kadesh Pet",
  },
  {
    name: "Kadesh FOOD",
    description:
      "Software para restaurantes: POS, cocina, inventario y menú QR.",
    logoSrc: "/logo.png",
    logoAlt: "Isotipo de Kadesh FOOD",
    href: "https://food.kadesh.com.mx/",
    category: "family",
    themeAdaptiveLogo: true,
    lockupName: "Kadesh FOOD",
  },
  {
    name: "Bosco Agency",
    description: "CMO fraccional y growth marketing B2B en México.",
    logoSrc: "/images/aliados/bosco.png",
    logoAlt: "Logotipo de Bosco Agency — Growth Marketing",
    href: "https://www.boscoagency.com/",
    category: "partner",
    themeAdaptiveLogo: true,
  },
];
