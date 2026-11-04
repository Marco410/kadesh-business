# Operaciones (admin de plataforma)

Pantalla interna en `/panel/clientes/admin`. No es el panel de un cliente: es desde donde el equipo de Kadesh opera el SaaS.

## Promesa

Ver y controlar a cada **cliente** en 360° (empresa, plan y pagos, equipo, CRM, consumo, integraciones y lo que hace cada persona), seguir la **actividad** de toda la plataforma, y ajustar el **catálogo de planes**, el **contenido** (blog y correos) y **Kadesh Pet** (resumen con cifras y gráficas, animales, fichas de veterinarias, servicios, avisos enviados y alertas de zona). El default es Inicio. Las secciones viven en `?tab=clientes`, `?tab=actividad`, `?tab=analitica`, `?tab=planes`, `?tab=contenido` y `?tab=veterinarias` (Kadesh Pet; la llave se conserva para no romper enlaces).

Los enlaces viejos (`?tab=usuarios`, `suscripciones`, `empresas`, `blog`, `correos`) se redirigen solos a la sección nueva (`normalizeLegacyAdminParams` en `constants.ts`).

## Acceso

Solo el rol `admin` de plataforma. Un admin de empresa no entra. Si no hay sesión, redirige a login. Si hay sesión sin ese rol, muestra “sin permiso”, no un paywall de plan.

El enlace **Operaciones** aparece en el menú del avatar y, de forma discreta, al final del dashboard de inicio.

## Navegación

Operaciones vive en su propio shell (`kadesh/components/app-shell`). No lleva la barra ni el footer del sitio, ni el botón de WhatsApp de soporte (es para clientes), y el tour de bienvenida no arranca aquí.

1. **Menú lateral** (`ADMIN_NAV_GROUPS` en `constants.ts`). Grupos con título:
   - **General:** Inicio, Actividad, Errores, Seguridad, Analítica.
   - **Clientes:** Empresas, Personas, Planes.
   - **Contenido:** Blog, Correos, Novedades.
   - **Kadesh Pet:** Resumen, Animales, Veterinarias, Servicios, Avisos, Alertas de zona.

   Cada item es una sección (`tab`) o una vista (`vista`). Por eso Empresas/Personas, Blog/Correos y las de Pet ya no tienen segmentado propio. La opción activa es una píldora blanca que se desliza, con el icono naranja. Veterinarias y Servicios llevan un globo con lo que espera revisión, y Errores con los abiertos en 24 h (`ADMIN_NAV_COUNTS_QUERY`, cada minuto y al verificar o aprobar). En móvil el menú es un cajón.
2. **Vista dentro de una sección** (Artículos / Categorías / Etiquetas, las 7 de Analítica, Catálogo / Módulos, las subvistas del 360): `AdminSegmented`. Pista cálida con la opción activa en píldora que se desliza.
3. **Filtros de una lista** (estado, rol, tipo): `AdminFilterChips`. Píldoras con borde y la activa en **tinta** (negro en claro, blanco en oscuro), con etiqueta (**Estado**, **Rol**, **Tipo**). Pueden llevar `count` y `dot`.

Dentro del **detalle 360**, sus secciones (Resumen, Actividad, CRM…) usan `AdminTabBar compact`: subrayado naranja que se desliza.

El naranja sólido (degradado) queda solo para la acción principal ("+ Nuevo", Guardar, Publicar) y la barra del pico en las gráficas.

**Barra superior:**
- Migas: Operaciones › grupo › sección.
- Buscador: lleva a Clientes → Empresas con `?q=`.
- **+ Nuevo:** Nueva novedad, Nuevo artículo o Nuevo correo. Llega a la sección con `?nuevo=1` y esa sección abre su editor.
- Campana, tamaño de texto, tema y saludo.

**Encabezado de cada vista** (`AppPageHeader`):
- Eyebrow: el grupo, o en Inicio la fecha larga.
- Título: el nombre del item.
- Descripción: la del item.
- Al cambiar de vista, la vista se vuelve a montar (repite su entrada) y el foco pasa al título.

Toda la navegación vive en query params (`hooks/useAdminNavigation.ts`):
- El menú lateral usa enlaces limpios (`?tab=…&vista=…`). Cambiar de sección no arrastra filtros y "atrás" regresa a la sección anterior.
- Los filtros usan `replace`.
- Entrar a un detalle usa `push`, para que "atrás" regrese a la lista con sus filtros.

## Diseño

Mismo lenguaje que el admin de ICARM, con **solo colores de Kadesh**. Tokens, componentes y movimiento están en `kadesh/components/app-shell/README.md`.

**Base visual:**
- Fondo cálido con brillos naranja, tarjetas blancas de 24 px con sombra suave y bordes casi invisibles.
- Inter (variable) en todo el panel, con cifras tabulares. El sitio público sigue con Poppins.
- A más tamaño, menos tracking.

**Indicadores** (`AdminStatTile`):
- `variant="dark"` (oscuro con brillo naranja) para el número más importante de la vista.
- `variant="tint"` (durazno) para el segundo.
- Blancos para el resto.
- `delta` es la pastilla ↗/↘ contra el periodo anterior.
- `sparkline` es una línea dentro del indicador.
- `tone` (alerta, peligro, éxito) pinta un punto y la cifra, no el borde.
- Si el valor es número, cuenta hacia arriba al aparecer.

**Gráficas** (sin librería, por el tope de 10 MB del worker):
- `ColumnBars`: barras tipo píldora. El pico va en naranja con su cifra y el periodo en curso, rayado.
- `HBarList`: rankings en naranja.
- `Sparkline`.

**Movimiento:**
- Una sola curva.
- Tarjetas que entran escalonadas, indicadores que se deslizan e insignias que cuentan.
- Hover con lift en lo tocable.
- Drawer desde la derecha y modal desde abajo.
- Todo se apaga con "reducir movimiento".

**Kit** (`ui.tsx`):
- `AdminButton` y `adminButtonClass`: primario, tinta, contorno, fantasma, peligro.
- `AdminModal` para modales nuevos. Los editores existentes conservan su estructura con el mismo aspecto.
- Clases de tabla (`adminTh*`) y de campos (`adminInputClass`…).
- Un componente nuevo usa los tokens `dash-*`. Nunca hex sueltos.

## Copy

Decimos **Operaciones**, **planes**, **fichas**, **servicios**, **verificar**. Nunca GraphQL, Keystone ni `planFeatures` en la UI. Los IDs de Stripe (`price_…`, `prod_…`) solo aparecen en el editor de Planes, porque operaciones los necesita para ligar el cobro; en listados se dice “Ligado a Stripe” / “Sin precio de Stripe”.

## Inicio

Orden, de arriba abajo (2026-11-03):
1. **Saludo** ("Buenas tardes, Marco.") con una oración con las cifras clave y cuántas cosas requieren atención (en rojo, o "Todo en orden."). Trae atajos (Buscar cliente, Kadesh Pet) y la franja **Esperan revisión**: fichas, servicios y pruebas por vencer.
2. Junto al saludo, **Requiere atención**: 5 filas y "Ver más".
3. KPIs: Empresas activas (oscuro), MRR (tintado), Registros y Extracciones. Debajo una fila compacta: En prueba, Pagos con problema, Con acceso, Créditos.
4. Actividad reciente y Ahorro en búsquedas.
5. Colas de Kadesh Pet.

KPIs de operación (`adminOpsSummary`): empresas activas, en prueba (cuántas vencen en ≤3 días), pagos con problema, registros y accesos de 7 días, extracciones fallidas en 24 h, créditos consumidos del mes y MRR estimado. Cada KPI lleva a la vista filtrada.

**Requiere atención**: empresas con pago vencido o no pagado, prueba terminada o por vencer, sin créditos, extracciones fallando, intentos de pago sin completar o plan activo sin accesos en 14 días. Desde la Fase 4 también **Riesgo de baja** (el uso cayó, salud baja o prueba en la que nadie entra) y **Oportunidad de venta** (sin créditos antes del día 20, vio módulos de otro plan o prueba con buen uso), sin repetir lo que ya sale por otro motivo. Clic → 360 de la empresa.

**Ahorro en búsquedas**: qué porcentaje de los leads del mes salió de la base de Kadesh (negocios que ya existían, por los que no se le pagó otra vez a Google Maps ni a INEGI) contra los que se tuvieron que buscar. Sale de `TechLeadSyncLog` (`alreadyInDb` contra `created`). El mismo dato por empresa está en el 360 → Consumo → Extracciones.

**Actividad reciente** y las colas de Veterinarias (reclamos y servicios por revisar) siguen aquí.

## Clientes

Junta lo que antes eran Usuarios (Cuentas / Suscripciones) y Empresas (Empresas / Sync): las cuatro eran vistas del mismo cliente. Dos vistas en `?tab=clientes`:

- **Empresas** (default, `adminCompanies`): un solo buscador que también encuentra a la empresa por el correo o nombre de cualquier integrante. Chips de **Estado** con conteo (estado vigente = la suscripción más reciente) reemplazan la lista de Suscripciones. **Orden**: alta reciente, último acceso, salud (peor primero) o nombre. Columna **Salud** con el puntaje y sus señales (vacía hasta que haya resumen diario). Toda la fila abre el 360 (ya no hay botón naranja por fila). "Último acceso" es lo más reciente entre el último login y la última vez que alguien del equipo tuvo el panel abierto (latido).
- **Personas** (`&vista=personas`): cuentas con rol, empresa, alta y último acceso. Filtros **Rol** y **Empresa** (con / sin). Clic en alguien con empresa abre el 360 de su empresa con esa persona en foco; sin empresa abre su ficha.

Filtro **Cuentas** (`&cuentas=mias`): solo las empresas cuyo dueño de cuenta en Kadesh es quien está viendo. Cada fila dice "Cuenta de …" cuando tiene dueño.

Búsqueda, filtros y página viven en la URL (`q`, `estado`, `orden`, `cuentas`, `rol`, `conEmpresa`, `pagina`): al volver del 360 la lista queda igual.

### Detalle 360 de una empresa

`&empresa=<id>&detalle=<sección>&sub=<subvista>&persona=<userId>`. Página dentro de la tab, no modal. En escritorio dos columnas:

- **Ficha** (izquierda, fija): plan y estado, cuándo vence la prueba o renueva, créditos del mes con barra, equipo, contacto, respuestas del onboarding, IDs copiables y **Ver en Stripe**. Acciones: **Ajustar plan** (módulos, fechas y créditos extra; el mismo editor de antes), **Enviar correo** (abre Contenido → Correos con el equipo como destinatarios) y, solo con plan gratuito, **Extender prueba** (+7, +14, +30 días o hasta una fecha; si ya venció, vuelve a "en prueba"). Abajo, **Dueño de cuenta en Kadesh** (quién del equipo lleva al cliente).
- **Persona en foco** (`persona`): franja con sus roles, último acceso, accesos y última acción; **Editar persona** abre el panel lateral (Perfil · Accesos · Actividad) y **Ver su actividad** filtra el feed.
- **Secciones**:
  - **Resumen**: alertas, **Salud** (puntaje, tendencia, señales y de dónde sale cada punto; no aparece sin resumen diario), uso de 30 días, **Tendencia** (minutos por semana de las últimas 12 y las últimas 4 semanas contra la mediana de las empresas de su plan; con menos de 3 empresas no se compara), **Cómo usan el panel** (tiempo activo, personas que entraron, clics en mejorar plan, exportaciones, secciones que más abren y módulos bloqueados que vieron; se oculta hasta que el back tenga la migración de la Fase 2), pipeline, créditos por semana y actividad reciente.
  - **Actividad**: línea de tiempo de la empresa, filtrable por tipo y por persona.
  - **CRM**: Leads (con etapa y oportunidad de *esta* empresa, que hay una por lead, y los vendedores asignados al lead; clic abre una vista rápida de solo lectura) · Pipeline · Cotizaciones · Seguimiento (actividades, seguimientos, tareas y propuestas) · Espacios.
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

Pestañas **Perfil** · **Accesos** · **Actividad** · **Dispositivos** · **Control** (ver como, suspender, cerrar sesiones, exportar y anonimizar; no aplica al equipo de Kadesh). En Perfil se editan nombre, apellidos, teléfono, correo, cuenta verificada y **roles** (**Guardar usuario**). Debajo va la **suscripción al blog**, con una tarjeta por blog (Pet y SaaS) que se guarda por separado, para no mezclar errores de un bloque con el otro:

- Sin suscripción: **Suscribir** la crea con el correo del usuario (editable).
- Con suscripción: se cambia el correo o se pausa/reactiva. Pausada = no recibe avisos de nuevos artículos. No se borra desde aquí.
- Si alguien se suscribió con ese correo antes de tener cuenta, aparece igual y al guardar se liga a la cuenta.
- Un mismo correo no puede repetirse en el mismo blog; el aviso de error viene del backend.

Accesos es el historial de `UserAuthLog` (logins, altas e intentos fallidos), escrito por el backend, con la IP y el sistema y navegador de cada uno.

**Dispositivos** (`PersonDevices`, `adminPersonDevices`): cada IP + navegador que usó en 90 días (veces, primera y última vez) y **Cuentas con la misma IP**. Una IP con muchas cuentas (red móvil, oficina, VPN) se marca y no lista personas. Cada IP lleva a Actividad filtrada y tiene **Bloquear IP**.

### Persona sin empresa

`&usuario=<id>`: ficha con roles, alta, último acceso y el mismo panel (Perfil · Accesos · Actividad).

## Actividad

`?tab=actividad` reemplaza el concentrado de Sync: una línea de tiempo de **todas** las empresas (`adminActivityFeed`), agrupada por día. Chips **Tipo** (Accesos, Extracción, CRM, Equipo, IA, Créditos, Pagos, WhatsApp, Calendario, Kadesh, Navegación, Errores, Kadesh Pet, Seguridad) en `&tipo=`, **App** (Kadesh Pet, Negocios, App móvil) en `&app=` y **Estado** (Todas / Con error) en `&error=1`, más un buscador (también busca IP, pantalla y mensaje de error). Cada evento se expande para ver el detalle (los cambios salen como "antes → después"); la empresa y la persona abren su 360. Pagina con **Cargar más** (cursor por fecha).

Cada fila trae una línea de **contexto** (`ActivityContext.tsx`): sistema y navegador (`describeUserAgent`, `src/utils/user-agent.ts`), IP, pantalla (`pageLabel`: "Perfil · Mascotas", "Publicar reporte"…) y la app. Al expandirla, el bloque **Contexto** trae todo, el user agent completo, **Ver todo de esta IP** (`&ip=`, chip removible) y **Bloquear IP**. En los errores también salen la operación, si era consulta o cambio, el código y los nombres de las variables (nunca sus valores).

- **Equipo**: roles, permisos, altas de personas, espacios de trabajo y datos de la empresa.
- **Kadesh**: lo que hace el admin, incluido qué 360, fichas y conversaciones de IA abrió.
- **Navegación**: secciones del panel que abren, módulos bloqueados que ven, tours. Es mucho volumen, por eso **Todo** no la incluye: solo sale al elegirla.

Nunca muestra prompts de IA, cuerpos de WhatsApp ni contraseñas.

## Errores

`?tab=errores` (`app-errors/`, `adminErrorIssues`): lo que le falla a la gente en Kadesh Pet, Negocios y la app, **agrupado por error**. Incluye errores del servidor (GraphQL) y del navegador (sin conexión, 5xx, pantalla caída, código que no cargó). Tabla con error, dónde (app y pantalla), veces, personas (y sin sesión), última vez y estado. Filtros **Estado** (Abiertos, Resueltos, Ignorados, Todos) en `&estado=`, **App** y **Periodo** (`&rango=`). La fila abre un cajón (`&huella=`) con el detalle, sistemas y navegadores, nota y **Marcar resuelto / Ignorar / Reabrir**, y las últimas ocurrencias. Si un error resuelto vuelve a pasar, regresa a Abiertos como **Reabierto**.

## Seguridad

`?tab=seguridad` (`security/`, `adminSecuritySummary`, `adminBlockedIps`): **Límites rebasados** (logins, registros, reportes, comentarios, reseñas, contacto y veterinarias) por IP, regla y persona; **IPs con varias cuentas nuevas**; **IPs bloqueadas** (con desbloquear) y un campo para bloquear una IP a mano. `BlockIpButton` pide duración y motivo; si un admin usó la IP hace poco, pide confirmar. Cuando alguien se pasa de un límite varias veces llega **Alerta de seguridad** a la campana.

## Analítica

`?tab=analitica`: cómo va el negocio, no una empresa. Seis vistas (`AdminSegmented`, `&vista=`); cambiar de vista limpia sus filtros.

- **Salud** (default, `adminHealth`): puntaje de 0 a 100 de cada cuenta viva con las últimas 4 semanas. Tarjetas con conteo de **Sana / Por observar / En riesgo** y de las señales **Riesgo de baja / Oportunidad de venta** (clic = filtro). Buscador, filtros **Nivel**, **Señal**, **Orden** (peor salud, mayor caída, mejor salud, nombre) y **Cuentas** (mis cuentas). Cada fila muestra puntaje, tendencia, señales con su motivo, las 5 partes en barras y cuántos del equipo entraron. Abajo, **¿Cómo se calcula la salud?** con la regla en palabras.
- **Ventas** (`adminSalesVelocity`, fase 5): velocidad comercial. Tasa de cierre, ciclo de venta, valor ganado, estancados, tiempo al primer contacto, contactados en 48 h y WhatsApp (tiempo de respuesta, contestados en 1 h, si los leads contestan); tabla por etapa del pipeline y por empresa (más estancados primero; clic → 360). Si todavía no hay historial de etapas, lo dice y explica cómo recuperarlo. El 360 tiene la misma información en la tarjeta **Velocidad comercial**.
- **Activación** (`adminActivationFunnel`): de las registradas en el periodo (`&dias=`), qué parte llegó a cada paso y la mediana de días; tabla por mes de registro. Cada paso se cuenta por separado (hay quien paga sin cotizar).
- **Retención** (`adminCohorts`): tabla por mes de registro con el % que usó Kadesh cada mes después (más uso, más intenso el naranja). `&meses=6|12`.
- **Uso** (`adminEngagement`): activas al día (promedio), en la semana, en el mes, qué tanto vuelven (DAU ÷ MAU), empresas activas, barras por día, módulos que usa cada plan y secciones más abiertas. Hasta ayer: hoy va a medias.
- **Demanda** (`adminDemandGaps`): extracciones con pocos resultados (`&umbral=0|5|10`) por giro + zona, por giro y por zona, con enlace a Google Maps.
- **Adquisición** (`adminAcquisition`): empresas por canal, página de entrada y campaña, con cuántas extrajeron y pagaron. El origen lo guarda el front al registrarse (`kadesh/utils/attribution`); las anteriores salen como "Sin dato".

Todo sin cuentas de prueba interna ni las empresas del equipo de Kadesh: no son clientes.

## Novedades

`?tab=novedades`: lo nuevo de la plataforma (`SystemRelease`). Lista con filtros **Estado** (publicadas, borradores) y **Producto** (Negocios, Pet, Ambas). **Nueva novedad** abre el editor: versión, fecha, para quién es, título y notas con **Vista previa** (igual que en Novedades del panel: párrafos, listas con "- " y **negritas**).

- **Guardar borrador**: solo lo ve Kadesh.
- **Publicar y avisar**: pide confirmar y dice a quién le llega el correo antes de mandarlo. Quitando "Avisar por correo al publicar" se publica sin correo.
- El correo sale una sola vez, al pasar a publicada; editar una publicada no lo vuelve a mandar (ver `kadesh-back/models/SystemRelease/README.md`).

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

Grupo **Kadesh Pet** del menú (`?tab=veterinarias`), cuatro vistas: **Resumen** (default, sin `vista`), **Animales** (`&vista=animales`), **Veterinarias** (`&vista=fichas`) y **Servicios** (`&vista=servicios`). Cada una es un item del menú. `pet/AdminPetSection.tsx` monta solo la vista abierta, así cada una pide solo sus datos.

**Resumen** (`pet/overview/`, 2026-11-03): cómo va Kadesh Pet. Sale de `adminPetSummary` y `adminPetSeries` (kadesh-back, `queries/admin/adminPet.ts`).

- **Controles globales** en la URL: **Periodo** (`&rango=30d|90d|6m|12m|todo`, default 90 días) y **Agrupar** (`&agrupar=dia|semana|mes`, default semana). "Día" solo aparece con 30 o 90 días; si cambias a un rango más largo, regresa a semana. El periodo también define "nuevos en el periodo" (con % contra el periodo anterior del mismo largo) y la interacción.
- **Pendientes por revisar**: fichas en revisión, servicios por aprobar, animales sin publicar en Facebook y reclamos de animales (este último solo se cuenta: se resuelve en Kadesh Pet).
- **Animales**: registrados, perdidos, encontrados, en adopción, de vuelta en casa (en familia + adoptados) y en Facebook. Gráfica **Animales registrados** con **Desglose** (`&desglose=estatus|origen`): barras apiladas por estatus actual o por quién lo publicó. Estatus actual (todos los de la bitácora + "Sin estatus"), tipo, quién lo publicó / quién lo reporta, dónde se reportan (estados o ciudades) e interacción con los más vistos.
- **Veterinarias**: fichas, veterinarias, verificadas, en revisión, desde Google y reseñas. Gráfica con **Métrica** (`&metrica=altas|reclamadas|verificadas`) y **tipo de lugar** (`&tipo_lugar=`), estado del reclamo y tipos / estados.
- **Usuarios de Kadesh Pet**: cuentas (sin cuentas de Negocios ni de prueba) y cuentas nuevas en el tiempo.
- Las tarjetas y filas tocables abren la lista ya filtrada con `push` (atrás regresa al Resumen): un estatus → Animales `&estado={valor}`, Facebook → `&facebook=pendiente|publicado`, un estado de reclamo → Veterinarias `&estado={valor}`. Esos params solo fijan el filtro inicial de la lista.
- Gráfica: `StackedSeriesBars`, barras con divs como el resto de Operaciones. Con 14 barras o menos cada una lleva fecha; con más, solo los extremos. La barra del periodo en curso va más clara. Colores de estatus en `ANIMAL_STATUS_BAR_CLASS` (`animals/constants.ts`). Ayudas ⓘ en `pet/overview/help.ts`.

**Animales** (`animals/`, 2026-10-14): todos los animales de Kadesh Pet, de usuarios y del admin, con búsqueda (nombre, ciudad, quién lo publicó), filtros (publicado por usuario o admin, en Facebook o no, estatus, tipo) y vistas / favoritos / comentarios por fila. Acciones: **Publicar en Facebook** (`adminPublishAnimalToFacebook`; si ya salió pide confirmar y vuelve a publicar), **Editar en Kadesh Pet** (abre el mismo formulario de kadesh-landing en otra pestaña: no se duplicó el formulario con mapa y fotos; requiere sesión de admin en Kadesh Pet) y **Ver ficha pública**. El detalle (`&animal={id}`, al que lleva la campana) muestra fotos, datos, etapas, vistas por día (30 días, con quién lo vio), comentarios y favoritos; el admin borra comentarios, quita favoritos y borra vistas (todas o solo sin sesión).

Filtro por **estatus** (2026-11-03): un select con los estatus de la bitácora (Registrado, Perdido, Encontrado, En adopción…). Filtra por el estatus *actual*, que es el registro más reciente de la bitácora del animal (por fecha del estatus y luego fecha de alta, igual que la ficha pública). Se resuelve en el back (`adminAnimals(status)`) porque la lista se pagina en el servidor: filtrar en el cliente solo vería la página cargada. El badge de cada fila usa ese mismo orden, así que siempre coincide con el filtro.

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

### 2026-11-04 — Contexto en Actividad, bandeja de Errores y Seguridad (Fase 6)

Qué: Actividad muestra desde dónde pasó cada evento (sistema, navegador, IP, pantalla, app) y filtra por app e IP. Secciones nuevas **Errores** (agrupados, con estado) y **Seguridad** (límites, multicuentas, bloqueo de IP). La ficha de una persona suma **Dispositivos**.

Por qué: el back ya guardaba IP y navegador pero no se veían, y no había forma de saber en qué pantalla le falló algo a alguien ni de frenar el abuso.

Qué no hacer: no agregar una librería para leer el user agent (el worker tiene límite de 10 MB); ampliar `describeUserAgent`. No mostrar valores de variables.

### 2026-11-03 — Operaciones con shell propio, estilo ICARM y colores de Kadesh

Qué:
- Menú lateral agrupado, barra superior flotante, encabezados grandes y tarjetas KPI oscura y tintada.
- Inicio con saludo y "Requiere atención", y animaciones de entrada.
- Tokens `dash-*` con claro y oscuro e Inter variable.
- Los colores fijos de los 77 archivos pasaron a tokens con un codemod.
- **Reemplaza** la regla anterior de "no píldoras sólidas en las tabs": las secciones ahora están en el menú y los chips activos van en tinta.

Por qué:
- El diseño anterior era difícil de leer. Pesaban los grises, la Poppins con pesos 500/600 simulados y las pestañas que competían con los filtros.
- El admin de ICARM ya resolvía la jerarquía: menú por grupos, una cifra protagonista por vista y el acento solo en la acción.
- Se usan solo colores de Kadesh: el morado es de Kadesh AI.

Qué no hacer:
- No volver a hex sueltos (`#212121`, `#e0e0e0`…). Usar `text-dash-*`, `bg-dash-*`, `border-dash-line`.
- No usar naranja sólido para estados.
- No agregar librería de gráficas ni de animación.

### 2026-11-03 — Operaciones usa todo el ancho de la pantalla

Qué: el contenedor de Operaciones dejó el `max-w-7xl` y ocupa todo el ancho, con el mismo margen lateral que la barra de navegación (`px-4`, `sm:px-10`).

Por qué: es una herramienta interna de tablas y gráficas; en pantallas anchas quedaba mucho espacio vacío a los lados y las gráficas se apretaban. Formularios y modales conservan su propio ancho máximo.

### 2026-11-03 — Kadesh Pet abre en un Resumen con cifras y gráficas

Qué: vista **Resumen** como entrada de Kadesh Pet (antes abría en Animales) con pendientes, cifras de animales, veterinarias y cuentas de Pet, y gráficas por día, semana o mes. La lista de Veterinarias salió del shell a su propio componente, y su query ya no corre cuando está abierta otra vista.

Por qué: desde Operaciones no se veía cuántos animales hay ni en qué estatus, ni cómo crecen los registros y las veterinarias. El estatus de un animal es el registro más reciente de su bitácora, así que se cuenta en el back (`adminPetSummary`): en el front habría que bajar todas las bitácoras. Los reportes repetidos que se unieron a otro no cuentan.

Qué no hacer: no agregar una librería de gráficas (el worker de Cloudflare tiene tope de 10 MB y el resto de Operaciones ya usa barras con divs); no ofrecer barras por día en rangos de más de 90 días (no se leen); no contar el estatus con "alguna vez tuvo" en vez del registro más reciente.

### 2026-10-12 — Ayudas ⓘ e instrucciones en cada vista (Fase 5)

Pedido explícito: que cualquiera del equipo sepa qué es cada número. Cada vista de Analítica empieza con **Cómo leer esta vista** (`analytics/ViewGuide.tsx`) y cada número, tarjeta y columna tiene un ícono ⓘ (`InfoTip` en `ui.tsx`; `help` en `AdminStatTile` y `AdminSectionCard`). Inicio también. Los textos viven todos en `analytics/help.ts`, en español sencillo (se explica "mediana" en vez de nombrarla). La burbuja se abre al tocar (sirve en teléfono, un `title` no), se cierra al tocar fuera, con Escape o al hacer scroll, y va en un portal con posición fija para que no la corte una tabla con scroll. En tarjetas que son botón, el ⓘ va fuera del botón para no anidar botones.

Actividad tiene el tipo **Errores** (lo que le falló a alguien en el panel) y "Requiere atención" el motivo **Errores en el panel**.

### 2026-10-11 — Analítica (Fase 4)

El equipo necesitaba decidir a quién llamar (riesgo de baja), a quién venderle más y qué canales traen clientes que sí usan y pagan. Se agregó la sección **Analítica** y la salud aparece donde ya se trabaja: lista de Empresas, Resumen del 360 y "Requiere atención" de Inicio.

- La salud es una regla simple que se puede explicar (por eso está **¿Cómo se calcula?** en la misma pantalla), no un modelo: con pocas empresas un modelo no sería confiable.
- Sin resumen diario la salud no se muestra en ningún lado: saldría en ceros y engañaría.
- Las señales traen el motivo en palabras ("Nadie entra hace 18 días"), no solo la etiqueta, para saber qué decir al llamar.
- En Uso, las barras por día no llevan fecha en cada una (con 30–90 días no caben en un teléfono): solo los extremos y la fecha al pasar el cursor.

Detalle del back en `kadesh-back/docs/operaciones/decisiones.md`.

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

## Kadesh Pet → Avisos y Alertas de zona

Código en `pet-notifications/`. Datos de kadesh-back: `adminNotificationLog`, `adminZoneAlerts`, `adminZoneAlertPreview` y la mutación `adminUpdateZoneAlerts`.

- **Avisos** (`?vista=avisos`): cada aviso de Kadesh Pet, una fila por persona, con a dónde se fue: campana (leída o no), push (cuántos dispositivos) y WhatsApp (no se mandó y por qué, aceptado, entregado, leído o falló con el error de Meta). Filtros: canal, resultado, tipo, periodo y búsqueda por quien lo recibió. `?persona=` llega con la búsqueda puesta. El ícono de enlace abre lo que lo originó (el animal en Operaciones o el enlace del aviso).
- **Alertas de zona** (`?vista=alertas-zona`): quién tiene alertas, su zona (enlace a Google Maps), radio, canales y cuántas recibió. «Administrar» abre un panel para mover la zona o el radio, apagar o encender sus alertas y apagar su WhatsApp. Encenderle el WhatsApp no se puede: Meta exige que la persona acepte. Arriba, «¿Quién recibiría una alerta aquí?» acepta «latitud, longitud» o un enlace de Google Maps.

