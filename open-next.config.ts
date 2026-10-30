import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// R2 guarda el caché de ISR y la cola en Durable Object regenera en segundo plano:
// el blog y la home usan `revalidate`.
const config = defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
});

// Build con webpack, no con Turbopack: con Turbopack cada página lleva un
// client-reference-manifest de ~2.7 MB y el worker queda en ~11.7 MB comprimido,
// arriba del límite de 10 MB de Cloudflare. Con webpack queda en ~4.9 MB.
// Sin la memoria extra, webpack truena con "heap out of memory".
config.buildCommand =
  "NODE_OPTIONS=--max-old-space-size=6144 pnpm next build --webpack";

export default config;
