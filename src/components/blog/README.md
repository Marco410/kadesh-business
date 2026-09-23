# Blog

Listado de artículos publicados y detalle de cada post de **Kadesh Negocios**. La promesa es la misma en el índice y en cada URL: guías y consejos de prospección B2B, leads, CRM y ventas en México, sin prometer resultados ni cifras que no podamos respaldar.

## Contenido compartido con Kadesh Pet

El backend es el mismo que usa el blog de Pet (`pet.kadesh.com.mx/blog`). `Post`, `Category` y `BlogSubscription` tienen `product` (`pet | saas | all`). Este blog **solo muestra `saas` y `all`** (`BLOG_PRODUCT_FILTER` en `constants.ts`), y el filtro va en **toda** lectura: índice, detalle, sitemap, relacionados y categorías. Una consulta nueva de posts sin ese filtro deja colar artículos de Pet. Un post de otro producto en `/blog/<url>` es 404.

El módulo se portó de Pet: los cambios de estructura conviene hacerlos en los dos repos (`kadesh-landing/src/components/blog`).

## Cómo se presenta

- **Índice (`/blog`)**: grid de artículos publicados; filtro opcional `?category=<url-de-categoría>`. Vacío: `EmptyBlogState`. Hero con el degradado naranja del home (sin foto: la imagen `public/images/sections/blog.jpg` es de Pet y no aplica).
- **Detalle (`/blog/<url>`)**: artículo completo, autor, fechas, etiquetas, likes, favoritos, comentarios y relacionados. Si el post no existe, no está publicado o es de Pet, es **404** con `noindex`.
- La paginación es de cliente (`take`/`skip`). Solo la **página 1** se hidrata con el HTML del servidor. Cambiar `?category=` vuelve a la página 1.
- Likes, favoritos, comentarios y vistas requieren sesión para escribir (misma cuenta `User` que el panel); anónimos solo leen.
- **Newsletter**: `NewsletterSubscription` guarda `product: 'saas'`. El mismo correo puede estar suscrito a Pet y al SaaS; repetir el mismo producto muestra "ya está suscrito".

## Cuerpo del artículo

El cuerpo lo pinta `src/utils/renderes.tsx` (renderer del campo de contenido del CMS) y **ahí** vive el espaciado: margen y color por bloque (párrafo, lista, título, divisor). No está instalado `@tailwindcss/typography`, así que las clases `prose` **no hacen nada**: no las reintroduzcas esperando que separen los párrafos (eso fue lo que dejó el texto "amontonado" aunque el editor sí tenía los espacios). El contenedor solo fija el tamaño de lectura (`text-lg`).

`kadesh-landing/src/utils/renderes.tsx` debe quedar igual.

La miga de pan lleva `pt-24` porque el `Navigation` es `fixed`; sin ese margen se encima con el menú.

## Categorías

Los valores (`prospecting`, `crm_sales`, `lead_gen`, `case_studies`, `product_updates`, más `news`, `tips`, `other`) salen de `POST_CATEGORIES` del backend. `POST_CATEGORIES_MAP` y `CATEGORY_COLORS` en `constants.ts` deben quedar alineados con esa lista; un valor desconocido se muestra tal cual.

## SEO y descubrimiento

- El sitemap (`src/app/sitemap.ts`) incluye `/blog` y cada post **publicado**, con `lastmod` de `updatedAt` o `publishedAt`. No se listan borradores.
- El HTML del post (título, fechas, cuerpo) sale del servidor. Likes, comentarios y vistas son islas de cliente.
- Schema: `Blog` + `ItemList` en el índice; `BlogPosting` + `BreadcrumbList` en el detalle. El publisher apunta a la Organization de `src/app/layout.tsx` (`/#organization`).
- Canonical del índice: `/blog` (también con `?category=`). Canonical del post: `/blog/<url>` en `kadesh.com.mx` (`core/site.ts`).
- Open Graph tipo `article`. La portada del CMS es una URL firmada que caduca: el share usa `/blog/<url>/og`, que entrega la portada vigente, y cae a `/og-image.png` si no hay.

## Copy

- Hablamos de **artículos**, **blog**, **prospección B2B**, **leads**, **CRM** y **ventas**. Nunca nombramos el CMS, GraphQL ni el almacenamiento de imágenes.
- No inventamos métricas ("el más leído", cifras de alcance) en metadata ni en schema.

## Archivos que deben quedar alineados

- Metadata y JSON-LD: `blog-seo.ts`.
- Fetch de publicados (sitemap, índice, detalle, og): `server.ts`.
- Layout compartido de `/blog`: keywords y OG genérico, **sin** canonical propio (si no, los posts heredarían `/blog`).
- Copy de `newsletter/NewsletterSubscription.tsx` (título/descripción por defecto), que también usa el índice.
