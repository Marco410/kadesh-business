import Link from "next/link";
import { Routes } from "kadesh/core/routes";
import {
  DATA_DELETION_CONTACT_EMAIL,
  type DataDeletionLookup,
  type DataDeletionStatus,
} from "./fetch-status";
import { formatMexicoCityDate, statusLabel } from "./format-status";

const STATUS_CLASS: Record<DataDeletionStatus, string> = {
  pending:
    "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  completed:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  failed: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
};

function contactHref(code?: string): string {
  const subject = "Eliminación de datos";
  const params = new URLSearchParams({ subject });
  if (code) {
    params.set("body", `Código de confirmación: ${code}`);
  }
  return `mailto:${DATA_DELETION_CONTACT_EMAIL}?${params.toString()}`;
}

function HowToRequest() {
  return (
    <div className="flex flex-col gap-4 text-base text-[#5c4033] dark:text-[#d4c4b8]">
      <p>Puedes pedir la eliminación de tus datos de dos formas:</p>
      <ol className="list-decimal space-y-3 pl-6">
        <li>
          Desde Facebook: entra a{" "}
          <span className="font-semibold">Configuración</span>, luego a{" "}
          <span className="font-semibold">Apps y sitios web</span>, elige{" "}
          <span className="font-semibold">Kadesh</span> y pulsa{" "}
          <span className="font-semibold">Eliminar</span>.
        </li>
        <li>
          Por correo: escribe a{" "}
          <a
            href={contactHref()}
            className="text-orange-600 underline dark:text-orange-400"
          >
            {DATA_DELETION_CONTACT_EMAIL}
          </a>{" "}
          con el asunto &quot;Eliminación de datos&quot;.
        </li>
      </ol>
      <p>
        El detalle de qué datos conservamos y por cuánto tiempo está en el{" "}
        <Link
          href={Routes.privacy}
          className="text-orange-600 underline dark:text-orange-400"
        >
          aviso de privacidad
        </Link>
        .
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: DataDeletionStatus }) {
  return (
    <span
      className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${STATUS_CLASS[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function StatusDetails({
  lookup,
}: {
  lookup: Extract<DataDeletionLookup, { kind: "ok" }>;
}) {
  const { record } = lookup;
  const requestedAt = formatMexicoCityDate(record.requestedAt);
  const completedAt = formatMexicoCityDate(record.completedAt);

  return (
    <div className="flex flex-col gap-6">
      <dl className="flex flex-col gap-4 text-base text-[#5c4033] dark:text-[#d4c4b8]">
        <div className="flex flex-col gap-1">
          <dt className="text-sm font-semibold text-[#5c4033]/70 dark:text-[#d4c4b8]/70">
            Código de confirmación
          </dt>
          <dd className="break-all font-mono text-lg text-[#212121] dark:text-white">
            {record.code}
          </dd>
        </div>
        <div className="flex flex-col gap-2">
          <dt className="text-sm font-semibold text-[#5c4033]/70 dark:text-[#d4c4b8]/70">
            Estado
          </dt>
          <dd>
            <StatusBadge status={record.status} />
          </dd>
        </div>
        {requestedAt ? (
          <div className="flex flex-col gap-1">
            <dt className="text-sm font-semibold text-[#5c4033]/70 dark:text-[#d4c4b8]/70">
              Fecha de solicitud
            </dt>
            <dd>{requestedAt}</dd>
          </div>
        ) : null}
        {completedAt ? (
          <div className="flex flex-col gap-1">
            <dt className="text-sm font-semibold text-[#5c4033]/70 dark:text-[#d4c4b8]/70">
              Fecha de conclusión
            </dt>
            <dd>{completedAt}</dd>
          </div>
        ) : null}
      </dl>
      {record.status === "failed" ? (
        <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
          La eliminación no se completó. Escribe a{" "}
          <a
            href={contactHref(record.code)}
            className="text-orange-600 underline dark:text-orange-400"
          >
            {DATA_DELETION_CONTACT_EMAIL}
          </a>{" "}
          y menciona el código de confirmación.
        </p>
      ) : null}
    </div>
  );
}

type DataDeletionSectionProps = {
  lookup: DataDeletionLookup | null;
};

export default function DataDeletionSection({ lookup }: DataDeletionSectionProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <div className="rounded-3xl border border-[#e0e0e0] bg-white p-6 shadow-md dark:border-[#3a3a3a] dark:bg-[#1e1e1e] sm:p-8">
        <div className="flex flex-col gap-6">
          <h1 className="text-center text-3xl font-extrabold text-orange-500">
            Eliminación de datos
          </h1>

          {lookup === null ? <HowToRequest /> : null}

          {lookup?.kind === "ok" ? <StatusDetails lookup={lookup} /> : null}

          {lookup?.kind === "not_found" ? (
            <div className="flex flex-col gap-6">
              <p className="text-base font-semibold text-[#212121] dark:text-white">
                No encontramos una solicitud con ese código.
              </p>
              <HowToRequest />
            </div>
          ) : null}

          {lookup?.kind === "error" ? (
            <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
              No pudimos consultar el estado de la solicitud. Intenta de nuevo
              más tarde o escribe a{" "}
              <a
                href={contactHref()}
                className="text-orange-600 underline dark:text-orange-400"
              >
                {DATA_DELETION_CONTACT_EMAIL}
              </a>
              .
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
