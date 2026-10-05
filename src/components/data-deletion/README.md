# Eliminación de datos

Página pública de estado que Meta abre después de que alguien pide borrar los datos de la app de Facebook "Kadesh". No pide login y no muestra datos personales: solo el código de confirmación, el estado y las fechas.

## Cómo se pide

Sin `?code=` la página explica las dos vías:

1. Facebook: Configuración > Apps y sitios web > Kadesh > Eliminar.
2. Correo a contacto@kadesh.com.mx con el asunto "Eliminación de datos".

Siempre enlaza al aviso de privacidad (`/privacidad`). El mismo enlace vive en el footer, junto a Privacidad y Términos, y la URL sin código entra al sitemap.

## Consulta

`?code=` se lee en el servidor y se consulta `GET {origen}/webhooks/meta/data-deletion/status?code=`. El origen sale de `NEXT_PUBLIC_API_URL` (no se escribe a mano el host del backend). Así el navegador no llama al backend y no hace falta CORS.

- `pending` → "En proceso"
- `completed` → "Completada"
- `failed` → "Fallida", y se pide escribir al correo mencionando el código
- 404 → no hay solicitud con ese código, más las instrucciones de arriba
- red o 5xx → mensaje genérico y el correo de contacto

Las fechas se muestran en es-MX, zona America/Mexico_City. Si `requestedAt` o `completedAt` vienen vacíos, esa fecha no se muestra.

Con `?code=` la página lleva `noindex`. Sin código se puede indexar.
