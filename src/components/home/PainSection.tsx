import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import {
  PRIMARY_CTA_CLASS,
  TRIAL_CTA_HREF,
  TRIAL_CTA_LABEL,
} from "kadesh/components/home/landing-cta";

/**
 * Justo debajo del hero: problema → agitar → solución. Nombra lo que el vendedor ya vive
 * (listas a mano, bases compradas que no contestan) antes de enseñar el producto.
 */
export default function PainSection() {
  return (
    <section
      id="el-problema"
      className="py-16 sm:py-24 bg-white dark:bg-[#121212]"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        <div>
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-[#212121] dark:text-white sm:text-4xl">
            Tu equipo no necesita más ganas. Necesita a quién llamar.
          </h2>
          <p className="mb-5 text-lg leading-relaxed text-[#424242] dark:text-[#d6d6d6]">
            La mayoría de los vendedores pierde la mañana armando listas:
            copiando teléfonos de Google, buscando en Facebook o llamando a una
            base de Excel que alguien compró hace dos años.
          </p>
          <p className="text-lg leading-relaxed text-[#424242] dark:text-[#d6d6d6]">
            La mitad de esos números ya no existen. Los que sí contestan ya
            escucharon a otros diez vendedores ese mes. Y mientras tanto pagas
            un CRM por cada usuario que, al final del día, tiene pocas llamadas
            registradas y nada que cotizar.
          </p>
        </div>

        <div className="self-center rounded-3xl border border-orange-800/20 bg-orange-50 p-6 dark:border-orange-500/25 dark:bg-orange-500/10 sm:p-8">
          <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-orange-800 text-white">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} />
          </span>
          <p className="mb-7 text-lg leading-relaxed text-[#212121] dark:text-white">
            Con Kadesh eliges la ciudad, el giro y el radio. En menos de un
            minuto tienes negocios activos, con teléfono, en un CRM que todo tu
            equipo comparte. Y cada mañana Kadesh AI te dice a quién llamar
            primero.
          </p>
          <Link href={TRIAL_CTA_HREF} className={`${PRIMARY_CTA_CLASS} w-full sm:w-auto`}>
            {TRIAL_CTA_LABEL}
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
