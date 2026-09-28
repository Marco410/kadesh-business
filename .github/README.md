# GitHub: flujo y pipelines

## Flujo de ramas

```
feat/… ──PR──► dev ──PR release──► main (prod)
                 ▲                    │
                 └──── hotfix sync ───┘ (si hubo hotfix directo)
```

1. Crea la rama desde `dev`: `git checkout -b feat/mi-cambio origin/dev`
2. Abre el PR **contra `dev`** (`gh pr create --base dev`)
3. El workflow **CI** corre lint, `check:tours` y `build`
4. Al mergear a `dev`, el workflow **Promote** abre/actualiza un PR `dev` → `main`
5. Cuando esté validado, mergeas ese PR de release a `main`
6. El push a `main` avisa a kadesh-back (SystemRelease borrador)

## Workflows

| Archivo | Qué hace |
|---------|----------|
| `ci.yml` | Lint + tours + build en PRs/pushes a `dev` y `main` |
| `promote-dev-to-main.yml` | Abre/actualiza PR de release `dev` → `main` |
| `notify-system-release.yml` | Tras push a `main`, manda la novedad al backend |

## Cómo saber que “está todo ok”

- Verde en el check **CI / Lint, tours y build** del PR a `dev`
- Probaste en el preview de Vercel ligado a `dev` (o la rama del PR)
- Luego mergeas el PR **Release: promote dev → main** (también debe pasar CI)

## Branch protection (recomendado en GitHub)

En Settings → Branches, para `dev` y `main`:

- Require a pull request before merging
- Require status checks to pass → marca el job de **CI**
- (Opcional) Require approvals

Sin esto, el CI informa pero no bloquea el merge.

## Disparo manual del release PR

Actions → **Promote dev → main** → Run workflow.
