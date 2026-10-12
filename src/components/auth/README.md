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

### Cuando la sesión termina

Si el back ya no acepta el token (Kadesh cerró las sesiones del equipo, la cuenta se suspendió, venció), su respuesta trae `extensions.session: { status, message }`. El apollo-client y el latido del registro de uso lo detectan (`kadesh/utils/session-ended`) y `SessionEndedListener` (montado en `ClientProviders`):

- borra el token y la cookie de sesión;
- lleva al login con `?sesion=<motivo>` y `?redirect=` para volver a la misma sección. El login muestra "Tu sesión expiró. Vuelve a iniciar sesión." o el aviso de suspensión (`sessionEndedMessage`);
- si es un admin viendo el panel "como" alguien, en vez de eso termina ese modo y vuelve a Operaciones con su sesión.

Antes la persona se quedaba en un panel vacío: `UserContext` no borra al usuario cuando hay token y el back no lo reconoce (para no sacar a alguien recién entrado con Google), y nada más se daba cuenta. En `/auth` el aviso se ignora: ahí un token viejo no importa.

## Registro de accesos

El backend registra cada intento en `UserAuthLog` y marca `lastLoginAt`: con contraseña (envuelve `authenticateUserWithPassword`), con Google y en el registro. El navegador no escribe estos registros ni el último acceso: antes los mandaba el front con un `createUserAuthLog` abierto y cualquiera podía inventar accesos. Operaciones los muestra en el historial de accesos de cada persona.
