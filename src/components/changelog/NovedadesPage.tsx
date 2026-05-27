"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { Footer, Navigation } from "kadesh/components/layout";
import { Routes } from "kadesh/core/routes";
import ChangelogTimeline from "./ChangelogTimeline";
import ChangelogEmptyState from "./ChangelogEmptyState";
import ChangelogLoadingSkeleton from "./ChangelogLoadingSkeleton";
import { CHANGELOG_PAGE_SIZE } from "./constants";
import { SAAS_CHANGELOG_LIST_QUERY } from "./queries";
import type {
  SaasChangelogListResponse,
  SaasChangelogListVariables,
} from "./types";
import { NOVEDADES_FAQ } from "./novedades-seo";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function NovedadesPage() {
  const [loadedCount, setLoadedCount] = useState(CHANGELOG_PAGE_SIZE);

  const { data, loading, error, fetchMore } = useQuery<
    SaasChangelogListResponse,
    SaasChangelogListVariables
  >(SAAS_CHANGELOG_LIST_QUERY, {
    variables: { take: loadedCount, skip: 0 },
  });

  const releases = data?.systemReleases ?? [];
  const totalCount = data?.systemReleasesCount ?? 0;
  const hasMore = releases.length < totalCount;
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    const nextTake = loadedCount + CHANGELOG_PAGE_SIZE;
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { take: nextTake, skip: 0 },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return fetchMoreResult;
        },
      });
      setLoadedCount(nextTake);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchMore, loadedCount]);

  const isInitialLoading = loading && !data;
  const showEmpty = !isInitialLoading && !error && releases.length === 0;

  return (
    <>
      <main className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <Navigation />

        <header className="relative w-full overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-orange-600 dark:from-[#121212] dark:via-[#1a1a1a] dark:to-[#121212]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-orange-600/15 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <motion.div {...fadeInUp}>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-100 dark:text-orange-300/90">
                Actualizaciones del producto
              </p>
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                Novedades de KADESH Negocios
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-orange-50">
                Consulta las versiones publicadas, mejoras en prospección B2B,
                CRM, cotizaciones y el resto de la plataforma SaaS.
              </p>
            </motion.div>
          </div>
        </header>

        <section
          aria-labelledby="changelog-heading"
          className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
        >
          <h2 id="changelog-heading" className="sr-only">
            Historial de versiones
          </h2>

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
            >
              No pudimos cargar las novedades. Intenta de nuevo en unos
              momentos.
            </div>
          )}

          {isInitialLoading && <ChangelogLoadingSkeleton />}

          {showEmpty && <ChangelogEmptyState />}

          {!isInitialLoading && releases.length > 0 && (
            <>
              <p className="mb-8 text-sm text-[#616161] dark:text-[#b0b0b0]">
                {totalCount === 1
                  ? "1 versión publicada"
                  : `${totalCount} versiones publicadas`}
              </p>
              <ChangelogTimeline releases={releases} />

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void handleLoadMore()}
                    disabled={loadingMore}
                    className="inline-flex min-w-[200px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loadingMore ? (
                      <>
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          size={18}
                          className="animate-spin"
                        />
                        Cargando…
                      </>
                    ) : (
                      `Cargar más versiones (${releases.length} de ${totalCount})`
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section
          aria-labelledby="novedades-faq-heading"
          className="border-t border-[#e0e0e0] bg-white py-12 dark:border-[#2a2a2a] dark:bg-[#121212]"
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2
              id="novedades-faq-heading"
              className="text-xl font-bold text-[#212121] dark:text-white sm:text-2xl"
            >
              Preguntas frecuentes sobre las actualizaciones
            </h2>
            <p className="mt-2 text-sm text-[#616161] dark:text-[#b0b0b0]">
              Respuestas sobre el changelog de KADESH Negocios para equipos de
              venta B2B en México.
            </p>
            <dl className="mt-8 space-y-6">
              {NOVEDADES_FAQ.map((item) => (
                <div key={item.question}>
                  <dt className="font-semibold text-[#212121] dark:text-white">
                    {item.question}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-[#616161] dark:text-[#b0b0b0]">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="border-t border-[#e0e0e0] bg-[#fafafa] py-12 dark:border-[#2a2a2a] dark:bg-[#0f0f0f]">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-[#616161] dark:text-[#b0b0b0]">
              ¿Quieres probar las últimas funciones en tu cuenta?
            </p>
            <Link
              href={Routes.panel}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#212121] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#333] dark:bg-orange-500 dark:hover:bg-orange-600"
            >
              Ir al panel de control
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
