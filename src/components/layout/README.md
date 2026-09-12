# Layout (nav y footer)

## Tamaño de fuente

A la izquierda del toggle de tema (escritorio y menú móvil) hay un slider **A — A**. Escala todo el texto de la app vía `html { font-size }` y `--kadesh-font-scale` (85%–130%, default 100%). Se guarda en `localStorage` (`kadesh-font-scale`). Un script en el `<head>` lo aplica antes del primer paint para no parpadear.

No promete “accesibilidad certificada”: es un control de comodidad. El copy del control es “Tamaño de fuente” (aria), no jerga técnica.
