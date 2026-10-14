export type AllyCategory = "family" | "partner";

/** Se listan en el footer como «Familia Kadesh y aliados». */
export type Ally = {
  name: string;
  description: string;
  href: string;
  category: AllyCategory;
};

export const ALLIES: Ally[] = [
  {
    name: "Kadesh Pet",
    description:
      "Bienestar animal en México: reportes, adopciones y veterinarias cerca de ti.",
    href: "https://pet.kadesh.com.mx/",
    category: "family",
  },
  {
    name: "Kadesh FOOD",
    description:
      "Software para restaurantes: POS, cocina, inventario y menú QR.",
    href: "https://food.kadesh.com.mx/",
    category: "family",
  },
  {
    name: "Bosco Agency",
    description: "CMO fraccional y growth marketing B2B en México.",
    href: "https://www.boscoagency.com/",
    category: "partner",
  },
];
