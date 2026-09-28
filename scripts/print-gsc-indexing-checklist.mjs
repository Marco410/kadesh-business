#!/usr/bin/env node
/**
 * Imprime el checklist de Search Console para Negocios y Pet.
 * Uso: node scripts/print-gsc-indexing-checklist.mjs
 */

const SITES = [
  {
    name: "Negocios (apex)",
    origin: "https://kadesh.com.mx",
    note: "Primero: Vercel primary = apex y pnpm check:canonical-host en verde.",
  },
  {
    name: "Pet",
    origin: "https://pet.kadesh.com.mx",
    note: "Tras deploy del llms.txt corregido.",
  },
];

async function blogUrls(origin) {
  const res = await fetch(`${origin}/sitemap.xml`, { redirect: "follow" });
  if (!res.ok) {
    return { error: `${res.status} ${res.statusText}`, urls: [] };
  }
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return {
    error: null,
    urls: locs.filter((u) => u.includes("/blog")),
  };
}

async function main() {
  for (const site of SITES) {
    console.log(`\n=== ${site.name} ===`);
    console.log(site.note);
    console.log(`1. Search Console → propiedad ${site.origin.replace("https://", "")}`);
    console.log(`2. Sitemaps → añadir ${site.origin}/sitemap.xml`);
    console.log("3. Inspección de URL → solicitar indexación para:");
    const { error, urls } = await blogUrls(site.origin);
    if (error) {
      console.log(`   (no se pudo leer sitemap: ${error})`);
      continue;
    }
    for (const url of urls.slice(0, 8)) {
      console.log(`   - ${url}`);
    }
    if (urls.length > 8) {
      console.log(`   … y ${urls.length - 8} URL(s) más del blog en el sitemap`);
    }
  }
  console.log("\nAI Overviews / GEO solo después de que esas URLs figuren como indexadas.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
