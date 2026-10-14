import { TESTIMONIALS } from "kadesh/components/home/testimonials";

/**
 * Testimonios reales, abiertos y uno debajo de otro (sin carrusel ni cuadrícula de uno).
 * Sin foto: círculo con iniciales en el color de Kadesh.
 */
export default function TestimonialsSection() {
  return (
    <section
      id="testimonios"
      className="py-16 sm:py-24 bg-[#f8f8f8] dark:bg-[#0d0d0d]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-[#212121] dark:text-white sm:text-4xl">
          Lo que cambia cuando dejas de armar listas a mano
        </h2>

        <div className="space-y-6">
          {TESTIMONIALS.map((item) => {
            const details = [item.role, item.city].filter(Boolean).join(" · ");
            return (
              <figure
                key={item.name}
                className="rounded-3xl border border-[#e0e0e0] bg-white p-6 shadow-sm dark:border-[#2a2a2a] dark:bg-[#121212] sm:p-10"
              >
                <blockquote className="text-lg leading-relaxed text-[#212121] dark:text-white sm:text-xl">
                  «{item.quote}»
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-800 text-base font-bold text-white"
                    aria-hidden
                  >
                    {item.initials}
                  </span>
                  <span>
                    <span className="block font-semibold text-[#212121] dark:text-white">
                      {item.name}
                    </span>
                    {details && (
                      <span className="block text-sm text-[#616161] dark:text-[#b0b0b0]">
                        {details}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
