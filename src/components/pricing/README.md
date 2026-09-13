# Precios (`/precios`)

Al entrar, lo primero es **la comparativa de planes** (`LandingPricingSection variant="page"`), no un hero. El H1 vive en esa sección. Debajo: valor, FAQ y CTA.

**Montos de lista:** Starter 399 / Pro 799 / Agencia 1,999 MXN al mes. Anual = 2 meses de descuento. El tachado en vista anual es el **precio mensual vigente**, no un `costOld` inflado (eso se leía 50% off). No cambies esos montos en el front si Stripe/el API siguen cobrando lo mismo.

**Kadesh AI** (`key: kadesh_ai`) va primero en cada tarjeta y se pinta con el degradado violeta–azul (`ai-urim-fill`). Está en todos los planes. Tooltip y FAQ: la modalidad administrada usa **los mismos créditos** que extraer leads (~4 por resumen del día); con API key no descuenta. Pro/Agencia se venden por **más créditos** (más margen para extraer y para la IA), no por una IA distinta. Copy: `KADESH_AI_CREDIT_HINT`.

Cifras Pro para comparativas: `PRO_PLAN_PUBLIC` (500 créditos, ~1.60 MXN/lead). No digas “menos de 1 MXN” ni “400 leads”.

Copy de features no-AI: nombre y descripción salen del API.
