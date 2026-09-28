## Release: `dev` → `main`

Este PR se genera automáticamente cuando hay commits en `dev` que aún no están en `main`.

### Antes de mergear
- [ ] El CI de este PR está en verde
- [ ] Probaste lo crítico en el entorno de `dev` / preview
- [ ] El mensaje de merge describe el cambio en lenguaje de producto (alimenta SystemRelease)

### Flujo
1. Features → PR a **`dev`**
2. CI pasa en `dev`
3. Este PR promueve a **`main`** (producción)
4. Al mergear `main`, corre el aviso de novedades a kadesh-back
