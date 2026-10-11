# Operaciones (admin de plataforma)

Pantalla interna en `/panel/clientes/admin`. No es el panel de un cliente: es desde donde el equipo de Kadesh opera el SaaS.

## Promesa

Ver y controlar a cada **cliente** en 360° (empresa, plan y pagos, equipo, CRM, consumo, integraciones y lo que hace cada persona), seguir la **actividad** de toda la plataforma, y ajustar el **catálogo de planes**, el **contenido** (blog y correos) y las **fichas de veterinarias**. El default es Inicio. Las secciones viven en `?tab=clientes`, `?tab=actividad`, `?tab=planes`, `?tab=contenido` y `?tab=veterinarias`.

Los enlaces viejos (`?tab=usuarios`, `suscripciones`, `empresas`, `blog`, `correos`) se redirigen solos a la sección nueva (`normalizeLegacyAdminParams` en `constants.ts`).

## Acceso

Solo el rol `admin` de plataforma. Un admin de empresa no entra. Si no hay sesión, redirige a login. Si hay sesión sin ese rol, muestra “sin permiso”, no un paywall de plan.

El enlace **Operaciones** aparece en el menú del avatar y, de forma discreta, al final del dashboard de inicio.

## Navegación en tres niveles

Antes las tabs, la vista Fichas/Servicios y los filtros eran la misma píldora y no se distinguían. Ahora cada nivel tiene su propio componente en `ui.tsx`:

1. **Secciones** (Inicio, Clientes, Actividad, Planes, Contenido, Veterinarias) — `AdminTabBar`: texto con subrayado naranja en la activa, no píldoras.
2. **Vista dentro de una sección** (Empresas / Personas, Fichas / Servicios, Artículos / … / Correos) — `AdminSegmented`: control segmentado, opción activa como pastilla blanca. Hace scroll horizontal en móvil.
3. **Filtros de una tabla** (estado, rol, tipo) — `AdminFilterChips`: chips pequeños, activo con tinte naranja (no relleno sólido), con etiqueta (**Estado**, **Rol**, **Tipo**) para que se lea qué filtran.

Dentro del **detalle 360** de un cliente, sus secciones (Resumen, Actividad, CRM…) usan `AdminTabBar` en variante `compact` y las subvistas (Leads / Pipeline / …) usan `AdminSegmented`.

Una pantalla nueva usa el componente de su nivel. No vuelvas a poner píldoras sólidas en las tabs: compiten con el filtro y con los botones de acción, que son los únicos naranja sólido.

Toda la navegación vive en query params (`hooks/useAdminNavigation.ts`): cambiar filtros o sección usa `replace`; entrar a un detalle usa `push`, para que "atrás" regrese a la lista con sus filtros.

## Copy

Decimos **Operaciones**, **planes**, **fichas**, **servicios**, **verificar**. Nunca GraphQL, Keystone ni `planFeatures` en la UI. Los IDs de Stripe (`price_…`, `prod_…`) solo aparecen en el editor de Planes, porque operaciones los necesita para ligar el cobro; en listados se dice “Ligado a Stripe” / “Sin precio de Stripe”.

## Inicio

KPIs de operación (`adminOpsSummary`): empresas activas, en prueba (cuántas vencen en ≤3 días), pagos con problema, registros y accesos de 7 días, extracciones fallidas en 24 h, créditos consumidos del mes y MRR estimado. Cada KPI lleva a la vista filtrada.

**Requiere atención**: empresas con pago vencido o no pagado, prueba terminada o por vencer, sin créditos, extracciones fallando, intentos de pago sin completar o plan activo sin accesos en 14 días. Clic → 360 de la empresa.

**Ahorro en búsquedas**: qué porcentaje de los leads del mes salió de la base de Kadesh (negocios que ya existían, por los que no se le pagó otra vez a Google Maps ni a INEGI) contra los que se tuvieron que buscar. Sale de `TechLeadSyncLog` (`alreadyInDb` contra `created`). El mismo dato por empresa está en el 360 → Consumo → Extracciones.

**Actividad reciente** y las colas de Veterinarias (reclamos y servicios por revisar) siguen aquí.

## Clientes

Junta lo que antes eran Usuarios (Cuentas / Suscripciones) y Empresas (Empresas / Sync): las cuatro eran vistas del mismo cliente. Dos vistas en `?tab=clientes`:

- **Empresas** (default, `adminCompanies`): un solo buscador que también encuentra a la empresa por el correo o nombre de cualquier integrante. Chips de **Estado** con conteo (estado vigente = la suscripción más reciente) reemplazan la lista de Suscripciones. **Orden**: alta reciente, último acceso o nombre. Toda la fila abre el 360 (ya no hay botón naranja por fila). "Último acceso" es lo más reciente entre el último login y la última vez que alguien del equipo tuvo el panel abierto (latido).
- **Personas** (`&vista=personas`): cuentas con rol, empresa, alta y último acceso. Filtros **Rol** y **Empresa** (con / sin). Clic en alguien con empresa abre el 360 de su empresa con esa persona en foco; sin empresa abre su ficha.

Filtro **Cuentas** (`&cuentas=mias`): solo las empresas cuyo dueño de cuenta en Kadesh es quien está viendo. Cada fila dice "Cuenta de …" cuando tiene dueño.

Búsqueda, filtros y página viven en la URL (`q`, `estado`, `orden`, `cuentas`, `rol`, `conEmpresa`, `pagina`): al volver del 360 la lista queda igual.

### Detalle 360 de una empresa

`&empresa=<id>&detalle=<sección>&sub=<subvista>&persona=<userId>`. Página dentro de la tab, no modal. En escritorio dos columnas:

- **Ficha** (izquierda, fija): plan y estado, cuándo vence la prueba o renueva, créditos del mes con barra, equipo, contacto, respuestas del onboarding, IDs copiables y **Ver en Stripe**. Acciones: **Ajustar plan** (módulos, fechas y créditos extra; el mismo editor de antes), **Enviar correo** (abre Contenido → Correos con el equipo como destinatarios) y, solo con plan gratuito, **Extender prueba** (+7, +14, +30 días o hasta una fecha; si ya venció, vuelve a "en prueba"). Abajo, **Dueño de cuenta en Kadesh** (quién del equipo lleva al cliente).
- **Persona en foco** (`persona`): franja con sus roles, último acceso, accesos y última acción; **Editar persona** abre el panel lateral (Perfil · Accesos · Actividad) y **Ver su actividad** filtra el feed.
- **Secciones**:
  - **Resumen**: alertas, uso de 30 días, **Tendencia** (minutos por semana de las últimas 12 y las últimas 4 semanas contra la mediana de las empresas de su plan; con menos de 3 empresas no se compara), **Cómo usan el panel** (tiempo activo, personas que entraron, clics en mejorar plan, exportaciones, secciones que más abren y módulos bloqueados que vieron; se oculta hasta que el back tenga la migración de la Fase 2), pipeline, créditos por semana y actividad reciente.
  - **Actividad**: línea de tiempo de la empresa, filtrable por tipo y por persona.
  - **CRM**: Leads (con etapa, oportunidad y vendedor de *esta* empresa; clic abre una vista rápida de solo lectura) · Pipeline · Cotizaciones · Seguimiento (actividades, seguimientos, tareas y propuestas) · Espacios.
  - **Consumo**: Créditos (periodos por mes + movimientos) · Extracciones · IA (las conversaciones se abren una por una con **Ver conversación**).
  - **Plan y pagos**: suscripción vigente y módulos, historial de contratos, intentos de pago (con el paso donde fallaron), cobros, tarjetas y comisiones de referido.
  - **Equipo**: cada persona con roles, accesos ("visto" = último login o latido), **tiempo activo** (minutos con el panel abierto y en cuántos días), última acción y cambios registrados, leads asignados, actividades, cotizaciones, extracciones, IA, WhatsApp y tours; abajo el historial de accesos de la empresa.
  - **Integraciones**: WhatsApp, IA (BYOK / administrada) y Google Calendar con sus últimos errores.
  - **Notas**: notas internas del equipo de Kadesh (el cliente nunca las ve). Se pueden fijar arriba; quedan con autor y fecha.

El CRM de una empresa se acota igual que en el back: cuenta lo de sus espacios de trabajo o, sin espacio, lo que creó o tiene asignado alguien de la empresa. Los leads se comparten entre empresas, así que el lead solo no basta.

### Ajustar plan

Ajusta las fechas del periodo y los módulos del plan **de esa empresa** (no el catálogo). El modal de módulos sigue los nombres de `PLAN_FEATURES_MAP`.

También se pueden **agregar créditos extra**: se suman ahora y se mantienen cada mes, igual que una recarga. No decimos “bonus”, “ledger” ni “periodo Keystone”. Los montos rápidos (250 / 1 000 / 3 000) coinciden con los paquetes de recarga del panel del cliente.

### Panel de una persona

Pestañas **Perfil** · **Accesos** · **Actividad** · **Control** (ver como, suspender, cerrar sesiones, exportar y anonimizar; no aplica al equipo de Kadesh). En Perfil se editan nombre, apellidos, teléfono, correo, cuenta verificada y **roles** (**Guardar usuario**). Debajo va la **suscripción al blog**, con una tarjeta por blog (Pet y SaaS) que se guarda por separado, para no mezclar errores de un bloque con el otro:

- Sin suscripción: **Suscribir** la crea con el correo del usuario (editable).
- Con suscripción: se cambia el correo o se pausa/reactiva. Pausada = no recibe avisos de nuevos artículos. No se borra desde aquí.
- Si alguien se suscribió con ese correo antes de tener cuenta, aparece igual y al guardar se liga a la cuenta.
- Un mismo correo no puede repetirse en el mismo blog; el aviso de error viene del backend.

Accesos es el historial de `UserAuthLog` (logins, altas e intentos fallidos), escrito por el backend.

### Persona sin empresa

`&usuario=<id>`: ficha con roles, alta, último acceso y el mismo panel (Perfil · Accesos · Actividad).

## Actividad

`?tab=actividad` reemplaza el concentrado de Sync: una línea de tiempo de **todas** las empresas (`adminActivityFeed`), agrupada por día. Chips **Tipo** (Accesos, Extracción, CRM, Equipo, IA, Créditos, Pagos, WhatsApp, Calendario, Kadesh, Navegación) en `&tipo=` y **Estado** (Todas / Con error) en `&error=1`, más un buscador. Cada evento se expande para ver el detalle (los cambios salen como "antes → después"); la empresa y la persona abren su 360. Pagina con **Cargar más** (cursor por fecha).

- **Equipo**: roles, permisos, altas de personas, espacios de trabajo y datos de la empresa.
- **Kadesh**: lo que hace el admin, incluido qué 360, fichas y conversaciones de IA abrió.
- **Navegación**: secciones del panel que abren, módulos bloqueados que ven, tours. Es mucho volumen, por eso **Todo** no la incluye: solo sale al elegirla.

Nunca muestra prompts de IA, cuerpos de WhatsApp ni contraseñas.

## Planes (catálogo)

`?tab=planes` tiene dos vistas:

- **Catálogo** (default): edita cada `SaasPlan` (precio, créditos, visibilidad, Stripe, **qué módulos incluye**). En cada módulo hay **En fase beta**. Hay que **guardar el plan**: la marca no se aplica al marcar la casilla. Después, quien tenga ese plan ve la etiqueta **Beta** en el menú del panel (WhatsApp, Calendario, etc.), en precios y al pagar. Se lee del plan guardado, no de la copia que quedó al contratar. La marca es de ese plan, no del catálogo de Módulos. Quitar el módulo del plan no borra la marca.
- **Módulos** (`&vista=modulos`): lista + editor (no una tarjeta por módulo). Buscas, eliges uno, editas nombre/descripción y guardas cuando hay cambios. Punto naranja = sin guardar. Mutación `updatePlanFeatureCatalog`.

- Cambiar el catálogo **no** reescribe el `included` de empresas ya contratadas. El copy (nombre/descripción) sí se propaga a suscripciones al guardar Módulos.
- Si cambias monto, moneda, frecuencia o el ID del precio, el botón pasa a **Verificar y guardar**: se abre un diálogo que compara el borrador con Stripe (`stripePlanCheck`). Kadesh **nunca escribe** en Stripe; si no coincide, el admin crea un Price nuevo allá, pega el ID y confirma.
- Se puede **Verificar con Stripe** sin guardar, solo para consultar.

## Contenido

`?tab=contenido` junta Blog y Correos en cuatro vistas: **Artículos** (default), **Categorías** (`&vista=categorias`), **Etiquetas** (`&vista=etiquetas`) y **Correos** (`&vista=correos`). `&para=correo1,correo2` abre Correos en "Específicos" con esos destinatarios (lo usa **Enviar correo** del 360).

## Blog

### Artículos

Se publican en Pet, en SaaS o en ambos. La categoría tiene que ser del mismo blog (o de ambos). La portada es la imagen del artículo. El cuerpo usa la misma barra que el editor del blog: títulos, negrita, cursiva, listas, separador, enlace, cita y bloque de código. También valen los atajos al inicio de una línea (`# `, `- `, `1. `, `> `, `---`).

Publicar ahora avisa a quienes siguen ese blog y lo comparte en Facebook. Una fecha futura lo deja oculto hasta ese día. Volver a guardar un artículo que ya estaba publicado no repite el aviso. Un borrador no se ve en el sitio.

### Categorías

Nombre libre, blog (Pet, SaaS o ambos) e imagen. El nombre es el que ve la gente y arma la dirección. Si la categoría ya tiene artículos, el nombre no se edita para no cambiar esa dirección. No se borra desde aquí.

### Etiquetas

Un nombre, compartido por los dos blogs. No se renombran ni se borran desde aquí. Un mismo nombre no se puede repetir.

## Veterinarias

Dos vistas dentro de `?tab=veterinarias`: **Fichas** (default) y **Servicios** (`&vista=servicios`).

En fichas:

- **Verificar** aprueba el reclamo: el dueño ya puede editar la ficha pública.
- **Rechazar** suelta al solicitante y la ficha vuelve a poder reclamarse.
- **Quitar verificación** deja al dueño vinculado pero sin poder editar hasta una nueva aprobación.
- **Pipeline** (`pipelineStatus`): estatus comercial interno, el mismo de los leads del CRM (`PIPELINE_STATUS`). Se cambia con el selector de cada fila y guarda al instante. Es independiente del estado de reclamo y el dueño no lo ve. Default: `01 - Detectado`.
- **Copiar enlace**: pone en el portapapeles la ficha pública `https://pet.kadesh.com.mx/veterinarias/{slug}` (si no hay slug, usa el id).
- **Teléfono**: muestra y copia el teléfono público de la clínica. Si no hay, el botón queda deshabilitado.
- **Editar**: abre el editor de la ficha (nombre, descripción, contacto, ubicación, características, pipeline, **horario semanal**, tipos y servicios). Guarda con **Guardar ficha**. Las redes siguen en Pet. Un día sin fila queda cerrado; la hora de cierre tiene que ser posterior a la de apertura (horas en punto, de 0 a 23).
- **Servicios en el editor**: quitar o agregar del catálogo aprobado, o **Crear y agregar** (crea el servicio en el catálogo ya aprobado y lo marca en esa clínica). Distinto de la vista Servicios, donde se revisan pedidos de dueños.
- **Filtros**: nombre/municipio (buscador), ciudad, pipeline y estado de reclamo (chips). Se combinan entre sí.

En servicios: un dueño pidió algo que no estaba en el catálogo. Default **Pendientes**. Al **Aprobar y asignar**, el servicio entra al catálogo **y** se marca en la clínica elegida (prellenada con la que lo pidió; se puede cambiar). **Rechazar** no lo publica.

## Correos

`?tab=contenido&vista=correos` envía un correo con el layout de marca (Pet azul / Negocios naranja), el mismo que usan bienvenida, blog y releases.

### Audiencia

- **Negocios (SaaS)**: usuarios con empresa (excluye cuentas de prueba).
- **Pet**: usuarios sin empresa.
- **Todos**: ambas.
- **Específicos**: lista de correos (máx. 200). Si el correo coincide con una cuenta, se usa el nombre en el saludo.

La **marca** del correo (colores y nombre del remitente) es independiente de la audiencia: puedes avisar a Pet con look Negocios o al revés. Al cambiar audiencia se sugiere la marca habitual.

### Contenido

Asunto, título de cabecera, etiqueta superior, vista previa de bandeja, cuerpo, recuadro destacado, botón (texto + URL) y nota del pie. El cuerpo acepta párrafos (línea en blanco), `**negrita**` y `[texto](https://…)`. No se pega HTML libre.

La columna derecha es vista previa en vivo. **Revisar y enviar** primero cuenta destinatarios (`dryRun`) y pide confirmación antes del envío real. Mutación `sendAdminBroadcastEmail` (solo admin de plataforma).

## Decisiones

### 2026-10-11 — Notas, dueño de cuenta, extender prueba y tendencia (Fase 3)

Lo que el equipo de Kadesh sabe de un cliente vivía fuera de la plataforma. Ahora queda en **Notas** del 360, con un **dueño de cuenta** por empresa y el filtro **Mis cuentas** para trabajar la cartera propia. **Extender prueba** existe porque "Ajustar plan" movía la fecha pero la prueba se seguía calculando desde el alta (arreglado en el back). La **Tendencia** sale del resumen diario de uso (cron nocturno), no de los logs crudos.

**Control de acceso** (aprobado el 2026-10-11): en la ficha, "Acceso de la cuenta" suspende o reactiva a toda la empresa, cierra las sesiones del equipo o transfiere la propiedad. En cada persona, la pestaña **Control** permite verla "como ella" (solo lectura, una hora), suspenderla, cerrar sus sesiones, exportar sus datos y anonimizarla (ARCO). Todo pide motivo o confirmación y queda en Actividad → Kadesh. Detalle en `kadesh-back/docs/operaciones/decisiones.md` y `src/components/impersonation/README.md`.

### 2026-10-10 — Registro de uso y de lo que abre el admin (Fase 2)

El back ahora guarda eventos propios (`ActivityEvent`) y el tiempo con el panel abierto (`UserActivityDay`). Aquí se ven en Actividad (tipos **Equipo**, **Navegación** y los cambios del CRM), en el 360 (**Cómo usan el panel**, tiempo activo por persona) y en el "último acceso".

Abrir el 360 de una empresa, la ficha de una persona o una conversación de IA queda registrado (tipo **Kadesh**). Se decidió que el admin ve todo el CRM del cliente, así que cada acceso deja rastro.

Lo del navegador lo manda `kadesh/utils/activity` (ver su README). Detalle del back en `kadesh-back/models/ActivityEvent/README.md`.

### 2026-10-10 — Clientes 360 y Actividad

Usuarios, Suscripciones, Empresas y Sync eran cuatro vistas del mismo cliente: para entender a una persona había que saltar entre tabs y la empresa solo mostraba créditos, sync y leads. Ahora **Clientes** abre un 360 por empresa (o la ficha de quien no tiene empresa) y **Actividad** concentra lo que pasa en toda la plataforma. Blog y Correos pasan a **Contenido**. Los agregados (estado vigente, conteos por persona, feed mezclado) se calculan en el back (`graphql/customs/queries/admin`, solo admin) para no bajar miles de filas al navegador.

Para que la auditoría sea confiable se cerraron huecos del back: los clientes ya no pueden editar su suscripción, créditos, pagos ni logs, y los accesos con contraseña los registra el servidor. Detalle en `kadesh-back/docs/operaciones/`.

### 2026-10-10 — Ahorro en búsquedas visible

Reutilizar negocios que ya están en la base es lo que evita pagar otra vez a Google Maps e INEGI. Ahora se ve: en Inicio (porcentaje del mes) y en el 360 de cada empresa (Consumo → Extracciones). En UI decimos "desde la base", no `alreadyInDb`.

### 2026-10-10 — Fechas del periodo sin corrimiento en Ajustar plan

El editor convertía `activatedAt` / `currentPeriodEnd` (`YYYY-MM-DD`) con `new Date()`, que los lee en UTC: en México mostraba un día antes y, al guardar, el periodo se recorría un día. Ahora los días de calendario se usan tal cual.

### 2026-10-07 — Tab Correos en Operaciones

Envíos masivos o puntuales viven en Operaciones, no en el Admin de Keystone. Reutilizan `emailLayout` del backend (Pet / Negocios). El conteo previo evita enviar a ciegas.

### 2026-09-25 — Tab Planes = catálogo; suscripciones bajo Usuarios

La tab que se llamaba Planes listaba suscripciones de empresa. Eso confundía el catálogo (precios/módulos públicos) con el ajuste por cliente. Ahora Planes edita `SaasPlan` y las suscripciones viven en Usuarios → Suscripciones. Al cambiar precio se exige verificar contra Stripe (solo lectura); no se sincroniza ni se crea Price desde Kadesh.

### 2026-09-25 — Nombre y descripción globales; included por plan

En Planes → **Módulos** se edita el copy una vez (`updatePlanFeatureCatalog` sincroniza todos los planes y suscripciones). En el editor de cada plan solo se marca qué módulos van incluidos. La página de precios muestra los features del periodo visible (mensual/anual), no siempre el anual.

### 2026-09-28 — Blog en Operaciones

Artículos, categorías y etiquetas viven en Blog, no en una ruta nueva. El nombre de la categoría es texto libre (antes era una lista cerrada en el backend): así se pueden crear las que hagan falta. Los nombres viejos (`prospecting`, `care_health`, …) siguen mostrándose con su etiqueta. Publicar avisa a los suscriptores y comparte en Facebook; un guardado posterior no repite el aviso.
