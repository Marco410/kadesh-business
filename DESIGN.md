---
name: KADESH Negocios
description: SaaS B2B para extraer leads de Google Maps y gestionarlos en un CRM
colors:
  orange: "#f7945e"
  orange-600: "#e07c3a"
  orange-50: "#fff3eb"
  surface: "#ffffff"
  surface-muted: "#f8f8f8"
  ink: "#212121"
  ink-body: "#424242"
  ink-muted: "#616161"
  inverse: "#ffffff"
  night: "#121212"
  night-deep: "#0a0a0a"
  night-raised: "#1e1e1e"
  dark-ink: "#ffffff"
  ai-purple: "#8b5cf6"
  ai-blue: "#38bdf8"
typography:
  display:
    fontFamily: "Poppins, Inter, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.35rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Poppins, Inter, sans-serif"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Poppins, Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  section: "96px"
  cluster: "24px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.inverse}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.orange-600}"
  button-on-brand:
    backgroundColor: "{colors.inverse}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
  button-on-brand-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.inverse}"
    rounded: "{rounded.md}"
    padding: "12px 28px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  chip-ai:
    backgroundColor: "{colors.ai-purple}"
    textColor: "{colors.inverse}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
---

## Overview

KADESH Negocios es un **canvas SaaS naranja**: herramienta de extracción B2B + CRM, no el santuario azul de kadesh-landing. El naranja `#f7945e` ocupa campos enteros solo en marketing (hero, prueba social, CTA final). El panel opera sobre un lienzo gris (`#f8f8f8` / `#0a0a0a`) con tarjetas blancas; el naranja es acento, nunca el fondo de trabajo.

El hero es un **producto en escena**: copy y CTAs a la izquierda sobre el campo de marca; a la derecha, mock de la plataforma (`ProductDemoCard`), no retratos. En oscuro el campo pasa a `night` con orbes naranja tenues; el mock sigue siendo el sujeto.

La fuente de color es `src/app/globals.css` (`--color-orange-*`) y HeroUI `primary`. Kadesh AI usa un degradado violeta–azul aparte (`--ai-urim-purple` / `--ai-urim-blue`); no contamina CTAs genéricos.

## Colors

Cambia **solo** la escala `orange-*` y el `primary` de HeroUI. Superficies claras: blanco y `#f8f8f8`. Oscuro: `#121212` body, `#0a0a0a` panel, `#1e1e1e` tarjetas (carbón, no navy). Tinta `#212121` / `#424242` / `#616161`. Bordes `#e0e0e0` claro y `#3a3a3a` oscuro.

Kadesh AI: violeta `#8b5cf6` → azul `#38bdf8` (`ai-urim-fill`). El resto del producto sigue naranja. `green-*` y `brown-*` existen en el theme; no son marca. No usar el azul `#216BFA` de kadesh-landing.

## Typography

Poppins es display y UI (se cargan 400 y 700; Inter es fallback). Títulos `font-bold` con `tracking-tight`, no display ultra-negro de landing. Cuerpo 18px, `leading-relaxed`, medida ~65ch en bloques de lectura. El usuario puede escalar con `--kadesh-font-scale`. Labels y CTAs a 14px / `font-semibold`.

## Layout

Dos densidades. **Marketing:** `max-w-7xl` (hero, precios) o `max-w-6xl` (definición, FAQ); ritmo `py-16 sm:py-24`; más aire arriba del H2 que debajo. Home: hero campo de marca → diferenciadores → qué es → marquee de categorías → por qué → costo por lead → demo interactiva → datos reales → leads únicos → vitrina → Kadesh AI → personas → demo agendada → valor → prueba social → aliados → testimonios → precios → referidos → CTA final → FAQ.

**Panel:** canvas `#f8f8f8` / `#0a0a0a`, navegación persistente, contenido por `?tab=` dentro del shell (no una ruta nueva por vista). Extracción a pantalla completa (mapa); control en tarjetas `rounded-2xl` con borde. Mobile-first; padding `px-4 sm:px-6 lg:px-8`.

## Elevation & Depth

Sombras con offset y blur suave, **tintadas al naranja** (`rgba(231,124,58,…)`). CTAs de marketing: `hover:-translate-y-0.5` y sombra ~24–32px. Tarjetas de panel: borde + `shadow-sm`, sin lift agresivo. Hero: orbes `blur-3xl`, retícula 48px y glow detrás del mock. Mapa: overlay naranja muy suave; dark del mapa es navy+bronce, no OLED puro. Anillos AI (`ai-live-ring`) solo en superficies de Kadesh AI.

## Shapes

Radios 12px en botones e inputs (`rounded-xl`); 16px en tarjetas, FAQ y CTAs grandes (`rounded-2xl`); pills `full` para chips, créditos y FABs de mapa. Iconos solo Hugeicons. Focus visible: anillo 2px `orange-600`, offset 3px.

## Components

- CTA primario (sobre blanco): `bg-orange-500`, texto blanco, hover `bg-orange-600`, `rounded-xl`.
- CTA sobre marca (hero / CTA final): blanco, texto `ink`, hover `gray-50`.
- Secundario sobre marca: borde blanco ~60%, fondo blanco/15.
- Input: borde `#e0e0e0`, focus ring naranja, `rounded-xl`.
- Card de panel: blanco / `#1e1e1e`, borde, `rounded-2xl`, `p-4`–`p-8`.
- FAQ de marketing: acordeón de dos columnas (primera abierta); no es el FAQ siempre-visible de landing.
- Chip Kadesh AI: `ai-urim-fill`, `rounded-full`. No naranja.
- Pipeline: colores por estado en `PIPELINE_STATUS_COLORS`; naranja solo en negociación.

## Do's and Don'ts

- Do: naranja desde `orange-*` / HeroUI `primary`, no hex sueltos en componentes nuevos.
- Do: campo de marca solo en marketing; en panel, naranja como acento.
- Do: en landing, responder la H2 en las primeras 40–60 palabras.
- Do: Hugeicons; degradado violeta–azul solo para Kadesh AI.
- Don't: azul `#216BFA` ni el night azulado de kadesh-landing.
- Don't: poner `ai-urim-fill` en CTAs de registro, precios o extracción.
- Don't: kickers, emojis de sistema, testimonios inventados, ni nombrar proveedores/modelos de IA al usuario.
- Don't: lucide, heroicons u otra librería de iconos.
