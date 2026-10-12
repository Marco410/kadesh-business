import { HEALTH_COMPONENTS } from "../constants";
import { surfaceClass } from "../ui";

/** Explicación de la salud y sus señales (misma regla que `utils/analytics/health.ts` del back). */
export default function HowHealthWorks() {
  return (
    <details className={`${surfaceClass} group p-4 sm:p-5`}>
      <summary className="cursor-pointer list-none text-sm font-semibold text-[#212121] dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded">
        ¿Cómo se calcula la salud?
        <span className="ml-1 font-normal text-[#9e9e9e] group-open:hidden">(ver)</span>
      </summary>
      <div className="mt-3 flex flex-col gap-3 text-sm text-[#616161] dark:text-[#b0b0b0]">
        <p>
          Suma de 5 partes con lo que hizo la empresa en las últimas 4 semanas. Las metas se
          ajustan a su antigüedad: una empresa de 5 días no puede tener 16 días activos.
        </p>
        <ul className="flex flex-col gap-1.5">
          {HEALTH_COMPONENTS.map((part) => (
            <li key={part.key} className="flex items-baseline justify-between gap-3">
              <span>
                <strong className="text-[#212121] dark:text-white">{part.label}</strong> · {part.hint}
              </span>
              <span className="shrink-0 tabular-nums">hasta {part.max}</span>
            </li>
          ))}
        </ul>
        <p>
          Si casi todo su uso fue hace más de 2 semanas, Constancia, Uso y Tiempo valen menos (hasta
          la mitad): una empresa que dejó de entrar no sale &quot;sana&quot; por lo que hizo antes.
        </p>
        <p>
          70 o más es <strong>sana</strong>, de 40 a 69 <strong>por observar</strong> y menos de 40{" "}
          <strong>en riesgo</strong>. Si más de 30% de sus extracciones fallan, resta 5.
        </p>
        <p>
          <strong className="text-red-700 dark:text-red-300">Riesgo de baja</strong>: pago vencido,
          nadie ha entrado (después de sus primeros 3 días), nadie entra hace 14 días o más, su uso
          cayó 40% o más contra las 2 semanas anteriores, o salud baja con más de 3 semanas de
          antigüedad.
        </p>
        <p>
          <strong className="text-emerald-700 dark:text-emerald-300">Oportunidad de venta</strong>:
          se quedó sin créditos antes del día 20, vio módulos de otro plan o pidió mejorar 2 veces o
          más, o está en prueba con salud de 60 o más.
        </p>
      </div>
    </details>
  );
}
