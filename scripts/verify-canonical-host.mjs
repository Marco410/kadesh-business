#!/usr/bin/env node
/**
 * Verifica que el host canónico de Negocios sea apex sin bucle www↔apex.
 * Éxito = www redirige a kadesh.com.mx y el apex responde 200 (sin volver a www).
 *
 * Uso: node scripts/verify-canonical-host.mjs
 * Exit 0 = OK; exit 1 = conflicto (hay que fijar primary en Vercel).
 */

const APEX = "https://kadesh.com.mx";
const WWW = "https://www.kadesh.com.mx";

async function follow(url, max = 8) {
  const chain = [];
  let current = url;
  for (let i = 0; i < max; i++) {
    const res = await fetch(current, { redirect: "manual" });
    const location = res.headers.get("location");
    chain.push({ url: current, status: res.status, location });
    if (res.status < 300 || res.status >= 400 || !location) {
      return chain;
    }
    current = new URL(location, current).href;
  }
  return chain;
}

function finalUrl(chain) {
  const last = chain[chain.length - 1];
  return last?.location && last.status >= 300 && last.status < 400
    ? new URL(last.location, last.url).href
    : last.url;
}

async function main() {
  const [apexHome, wwwHome, apexBlog, wwwBlog, sitemap] = await Promise.all([
    follow(`${APEX}/`),
    follow(`${WWW}/`),
    follow(`${APEX}/blog`),
    follow(`${WWW}/blog`),
    follow(`${APEX}/sitemap.xml`),
  ]);

  const report = {
    apexHome: apexHome.map((s) => `${s.status} ${s.url}`),
    wwwHome: wwwHome.map((s) => `${s.status} ${s.url}${s.location ? ` → ${s.location}` : ""}`),
    apexBlogFinal: finalUrl(apexBlog),
    wwwBlogFinal: finalUrl(wwwBlog),
    sitemapFinal: finalUrl(sitemap),
  };

  const wwwEndsOnApex =
    finalUrl(wwwHome).startsWith(APEX) && finalUrl(wwwBlog).startsWith(APEX);
  const apexStaysOnApex =
    finalUrl(apexHome).startsWith(APEX) &&
    !finalUrl(apexHome).includes("://www.") &&
    finalUrl(apexBlog).startsWith(APEX) &&
    !finalUrl(apexBlog).includes("://www.");
  const sitemapOnApex =
    finalUrl(sitemap).startsWith(APEX) && !finalUrl(sitemap).includes("://www.");

  console.log(JSON.stringify(report, null, 2));

  if (wwwEndsOnApex && apexStaysOnApex && sitemapOnApex) {
    console.log("\nOK: canónica apex sin bucle www↔apex.");
    process.exit(0);
  }

  console.error("\nFAIL: conflicto de host. En Vercel → Domains:");
  console.error("  1. Primario = kadesh.com.mx");
  console.error("  2. www.kadesh.com.mx → Redirect to kadesh.com.mx (301)");
  console.error("Hoy apex no debe redirigir a www.");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
