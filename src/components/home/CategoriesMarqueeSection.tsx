import { GOOGLE_PLACE_CATEGORIES } from "kadesh/constants/constans";
import { INEGI_DENUE_CATEGORIES } from "kadesh/constants/inegiDenueCategories";

const CATCH_ALL_LABELS = new Set(["otra", "negocios locales"]);

function landingCategoryChips(): { id: string; label: string }[] {
  const seen = new Set<string>();
  const chips: { id: string; label: string }[] = [];

  const add = (id: string, label: string) => {
    const key = label.trim().toLowerCase();
    if (!key || CATCH_ALL_LABELS.has(key) || seen.has(key)) return;
    seen.add(key);
    chips.push({ id, label });
  };

  for (const cat of GOOGLE_PLACE_CATEGORIES) {
    add(cat.value, cat.label);
  }
  for (const cat of INEGI_DENUE_CATEGORIES) {
    add(cat.id, cat.label);
  }
  return chips;
}

const baseCategories = landingCategoryChips();
const categoriesRowA = [...baseCategories, ...baseCategories];
const categoriesRowB = [
  ...baseCategories.slice(Math.floor(baseCategories.length / 2)),
  ...baseCategories,
];

const chipClassA =
  "inline-flex items-center px-3 py-1.5 rounded-full border border-orange-800/40 dark:border-orange-500/40 bg-orange-500/15 dark:bg-orange-500/10 text-xs sm:text-sm text-orange-900 dark:text-orange-100";
const chipClassB =
  "inline-flex items-center px-3 py-1.5 rounded-full border border-orange-800/35 dark:border-orange-500/35 bg-orange-500/10 dark:bg-orange-500/5 text-xs sm:text-sm text-orange-900 dark:text-orange-100";

export default function CategoriesMarqueeSection() {
  return (
    <section className="py-5 sm:py-10 bg-[#f5f5f5] dark:bg-[#050505] border-y border-[#e5e5e5] dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#212121] dark:text-white">
              ¿Qué giros de negocio puedo prospectar en Google Maps e INEGI?
            </h2>
            <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Kadesh busca giros en Google Maps y en INEGI: salud, legal,
              restaurantes, comercios, oficios y más. Eliges la categoría, el
              radio y la fuente; los prospectos salen con teléfono listo para
              contactar.
            </p>
          </div>

          <div className="relative w-full overflow-hidden space-y-2">
            <div className="flex w-max gap-2 sm:gap-3 whitespace-nowrap animate-marquee-slow motion-reduce:animate-none">
              {categoriesRowA.map((cat, index) => (
                <span key={`rowA-${cat.id}-${index}`} className={chipClassA}>
                  {cat.label}
                </span>
              ))}
            </div>
            <div className="flex w-max gap-3 sm:gap-4 whitespace-nowrap animate-marquee-fast motion-reduce:animate-none">
              {categoriesRowB.map((cat, index) => (
                <span key={`rowB-${cat.id}-${index}`} className={chipClassB}>
                  {cat.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
