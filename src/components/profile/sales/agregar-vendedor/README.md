# Agregar / editar vendedor

Pantalla dedicada (`/panel/clientes/agregar-vendedor`) para altas y edición de cuentas con rol vendedor. Se entra desde **Vendedores → Gestionar vendedores**.

## Cómo se presenta

- **Cabecera:** título “Gestionar vendedores”, promesa corta (alta/edición + correo = acceso) y conteo del equipo.
- **Formulario (prioridad en móvil):** modo “Nueva alta” o “Editando”. Campos en tres bloques — Identidad, Acceso al panel, Comercial — no un listado plano. Acciones abajo con área táctil ≥ 44px.
- **Equipo actual:** lista con búsqueda, iniciales, comisión y **Editar** con etiqueta. Al editar, el formulario hace scroll hacia arriba y muestra banner de cancelar.
- Contraseña obligatoria solo en alta; en edición, en blanco = no cambiar.

## Acceso

`vendedores.crear` y/o `vendedores.editar` (legado: admin empresa o Gerencia). El rol vendedor adicional no bloquea. Ver `vendedores/README.md`.
