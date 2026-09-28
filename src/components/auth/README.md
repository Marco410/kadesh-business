# Auth

## Registro

Tras un alta correcta, Kadesh inicia sesión con las mismas credenciales y lleva al usuario al panel (o a `?redirect=` si venía de otra pantalla). No pedimos que vuelva a escribir correo y contraseña.

Si el auto-login falla, el tab de iniciar sesión muestra: “Registro exitoso, ya puedes iniciar sesión con tus credenciales”.

## Continuar con Google

Botón GSI en los dos tabs (login y registro): el mismo botón sirve para entrar y para darse de alta, porque el backend crea la cuenta si el correo no existe.

Un alta nueva por Google queda con los mismos roles que el registro normal (`vendedor` + `admin_company`) y con su empresa ya creada, **usando el nombre de la cuenta de Google como nombre de negocio**. El usuario lo renombra después en su perfil; no le pedimos el dato en el alta.

## Sesión

`persistSessionToken` (`hooks/session.ts`) es el único lugar que guarda el token. Los tres flujos —contraseña, registro y Google— reciben de Keystone el mismo token sellado y lo guardan igual.

Lo que autentica de verdad es `localStorage`: el apollo-client lo manda como `Authorization: Bearer` y la cookie `httpOnly` que emite el backend no viaja cross-site hacia el API.

El backend registra cada intento en `UserAuthLog` (`source: GOOGLE_AUTH`), así que el flujo de Google no llama `useLogUserAuth` desde el navegador: se duplicarían los registros.
