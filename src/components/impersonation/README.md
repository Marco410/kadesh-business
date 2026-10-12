# Entrar como (impersonation)

Permite que un admin de Kadesh vea el panel exactamente como lo ve un cliente, para darle soporte. Se inicia desde Operaciones → 360 → persona → pestaña **Control** → "Ver como".

## Cómo funciona

1. El back (`adminStartImpersonation`) devuelve un token de la persona que dura **una hora** y solo permite **ver**: cualquier intento de guardar responde "modo solo lectura".
2. `beginImpersonation` guarda el token del admin (`kadesh-admin-session-token`), pone el de la persona y recarga en `/panel`.
3. `ImpersonationBanner` (montado en `ClientProviders`) muestra una barra fija abajo: a quién se ve, que es solo lectura y hasta qué hora. Al vencer la hora sale sola.
4. `finishImpersonation` avisa al back (`endImpersonation`, queda en Actividad), restaura el token del admin y vuelve a la página de Operaciones donde empezó.

## Reglas

- Mientras se ve como alguien, el registro de uso (`kadesh/utils/activity`) no manda nada y el tour de bienvenida no arranca: lo que hace el admin no es uso del cliente.
- No se puede ver como uno mismo, como alguien del equipo de Kadesh ni como una cuenta suspendida o anonimizada (lo valida el back).
- Inicio y fin quedan en Operaciones → Actividad → Kadesh, con el motivo.

## Decisiones

### 2026-10-11 — Solo lectura y una hora

Para soporte basta con ver. En solo lectura no hay riesgo de cambiar datos ni gastar créditos a nombre del cliente. La hora limita el tiempo dentro sin que el admin tenga que acordarse de salir.

## Si el token deja de valer

Si el token de "entrar como" ya no vale (pasó la hora o Kadesh cerró las sesiones de esa persona), el back lo avisa en la respuesta y `SessionEndedListener` (kadesh/components/auth) llama `finishImpersonation`: el admin vuelve a Operaciones con su propia sesión en lugar de quedarse en un panel vacío.
