// Verifica que el registro de tutoriales y el código sigan sincronizados:
//  1. Todo target de registry.ts existe en src/ (data-tour o #id).
//  2. Toda sección del sidebar (navItems) tiene un paso en el registro o está exenta a propósito.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = "src";
const REGISTRY = "src/components/onboarding/registry.ts";
const PANEL_CONTROL = "src/components/panel/PanelControlSection.tsx";

/** Secciones del sidebar sin paso de tutorial todavía. Quitar de aquí al registrar su paso. */
const EXEMPT_NAV_KEYS = new Set([
  "inicio",
  "profile",
  "vendedores",
  "archivos",
  "proyectos",
  "whatsapp",
  "referidos",
  "novedades",
]);

/** Prefijos de data-tour generados dinámicamente en el código (template strings). */
const DYNAMIC_PREFIXES = ["nav-", "main-tab-", "ai-tab-"];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sources = walk(SRC)
  .filter((f) => /\.(tsx?|css)$/.test(f) && f !== REGISTRY)
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const registry = readFileSync(REGISTRY, "utf8");
const errors = [];

const targets = [...registry.matchAll(/target:\s*(['"`])(.+?)\1/g)].map(
  (m) => m[2],
);

for (const target of new Set(targets)) {
  const dataTour = target.match(/^\[data-tour="(.+)"\]$/);
  if (dataTour) {
    const name = dataTour[1];
    const literal = sources.includes(`data-tour="${name}"`);
    const dynamic = DYNAMIC_PREFIXES.some(
      (p) => name.startsWith(p) && sources.includes(`data-tour={\`${p}$`),
    );
    if (!literal && !dynamic) errors.push(`data-tour "${name}" no existe en src/`);
    continue;
  }
  const id = target.match(/^#(.+)$/);
  if (id && !sources.includes(`id="${id[1]}"`)) {
    errors.push(`id "${id[1]}" no existe en src/`);
    continue;
  }
  const cls = target.match(/^\.(.+)$/);
  if (cls && !sources.includes(cls[1])) {
    errors.push(`clase "${cls[1]}" no existe en src/`);
  }
}

const panelControl = readFileSync(PANEL_CONTROL, "utf8");
const navBlock = panelControl.match(/const navItems = \[([\s\S]*?)\n\];/);
const navKeys = navBlock
  ? [...navBlock[1].matchAll(/\bkey:\s*"([\w-]+)"/g)].map((m) => m[1])
  : [];
if (navKeys.length === 0) {
  errors.push("No se pudieron leer las claves de navItems (¿cambió su formato?)");
}

for (const key of navKeys) {
  if (EXEMPT_NAV_KEYS.has(key)) continue;
  if (!registry.includes(`data-tour="nav-${key}"`)) {
    errors.push(
      `La sección "${key}" del sidebar no tiene paso en registry.ts (agrégalo o exímela en scripts/check-tours.mjs)`,
    );
  }
}

if (errors.length > 0) {
  console.error("check:tours falló:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log(`check:tours OK (${new Set(targets).size} targets, ${navKeys.length} secciones)`);
