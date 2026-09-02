export type Ally = {
  name: string;
  description: string;
  logoSrc: string;
  logoAlt: string;
  href: string;
  /** Logo claro/oscuro: negro en light, blanco en dark (sin caja de fondo). */
  themeAdaptiveLogo?: boolean;
};

export const ALLIES: Ally[] = [
  {
    name: "Bosco Agency",
    description: "CMO fraccional y growth marketing B2B en México.",
    logoSrc: "/images/aliados/bosco.png",
    logoAlt: "Logotipo de Bosco Agency — Growth Marketing",
    href: "https://www.boscoagency.com/",
    themeAdaptiveLogo: true,
  },
];
