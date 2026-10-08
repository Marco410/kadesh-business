/**
 * Catálogo de permisos por módulo del panel.
 * Llaves alineadas con lo que el backend debe validar en mutaciones.
 */

export const PERMISSION_KEYS = {
  INICIO_VER: "inicio.ver",
  PERFIL_VER: "perfil.ver",
  PERFIL_EDITAR: "perfil.editar",
  AI_VER: "ai.ver",
  AI_CONFIGURAR: "ai.configurar",
  CLIENTES_VER: "clientes.ver",
  CLIENTES_VER_EMPRESA: "clientes.ver_empresa",
  CLIENTES_CREAR: "clientes.crear",
  CLIENTES_EDITAR: "clientes.editar",
  CLIENTES_ASIGNAR: "clientes.asignar",
  CLIENTES_EXPORTAR: "clientes.exportar",
  VENDEDORES_VER: "vendedores.ver",
  VENDEDORES_CREAR: "vendedores.crear",
  VENDEDORES_EDITAR: "vendedores.editar",
  ARCHIVOS_VER: "archivos.ver",
  ARCHIVOS_SUBIR: "archivos.subir",
  ARCHIVOS_ELIMINAR: "archivos.eliminar",
  PROYECTOS_VER: "proyectos.ver",
  PROYECTOS_CREAR: "proyectos.crear",
  PROYECTOS_EDITAR: "proyectos.editar",
  COTIZACIONES_VER: "cotizaciones.ver",
  COTIZACIONES_CREAR: "cotizaciones.crear",
  COTIZACIONES_EDITAR: "cotizaciones.editar",
  CALENDARIO_VER: "calendario.ver",
  CALENDARIO_GESTIONAR: "calendario.gestionar",
  ESPACIOS_VER: "espacios.ver",
  ESPACIOS_CREAR: "espacios.crear",
  ESPACIOS_MIEMBROS: "espacios.miembros",
  WHATSAPP_VER: "whatsapp.ver",
  WHATSAPP_CONFIGURAR: "whatsapp.configurar",
} as const;

export type PermissionKey =
  (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];

export type PermissionDefinition = {
  key: PermissionKey;
  label: string;
  description?: string;
};

export type PermissionModuleId =
  | "inicio"
  | "perfil"
  | "ai"
  | "clientes"
  | "vendedores"
  | "archivos"
  | "proyectos"
  | "cotizaciones"
  | "calendario"
  | "espacios"
  | "whatsapp";

export type PermissionModule = {
  id: PermissionModuleId;
  label: string;
  /** Si es true, usuarios con lista de permisos usan el catálogo; si no, rige el rol actual. */
  enforced: boolean;
  permissions: PermissionDefinition[];
};

/**
 * `enforced: true` = usuarios con lista de permisos usan el catálogo.
 * Todos los módulos están activos; el fallback de rol aplica solo sin lista.
 */
export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "inicio",
    label: "Inicio",
    enforced: true,
    permissions: [
      {
        key: PERMISSION_KEYS.INICIO_VER,
        label: "Ver inicio",
        description: "Dashboard y resumen del panel.",
      },
    ],
  },
  {
    id: "perfil",
    label: "Datos del perfil",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.PERFIL_VER, label: "Ver perfil" },
      {
        key: PERMISSION_KEYS.PERFIL_EDITAR,
        label: "Editar perfil",
        description: "Cambiar nombre, foto, teléfono y datos personales.",
      },
    ],
  },
  {
    id: "ai",
    label: "Kadesh IA",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.AI_VER, label: "Ver Kadesh IA" },
      {
        key: PERMISSION_KEYS.AI_CONFIGURAR,
        label: "Configurar Kadesh IA",
        description: "Proveedor, API key y modalidad de la empresa.",
      },
    ],
  },
  {
    id: "clientes",
    label: "Clientes",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.CLIENTES_VER, label: "Ver clientes" },
      {
        key: PERMISSION_KEYS.CLIENTES_VER_EMPRESA,
        label: "Ver todos los clientes de la empresa",
        description: "Sin este permiso solo ve los que tiene asignados.",
      },
      { key: PERMISSION_KEYS.CLIENTES_CREAR, label: "Agregar clientes" },
      { key: PERMISSION_KEYS.CLIENTES_EDITAR, label: "Editar clientes" },
      { key: PERMISSION_KEYS.CLIENTES_ASIGNAR, label: "Asignar vendedor" },
      { key: PERMISSION_KEYS.CLIENTES_EXPORTAR, label: "Exportar a Excel" },
    ],
  },
  {
    id: "vendedores",
    label: "Vendedores",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.VENDEDORES_VER, label: "Ver vendedores" },
      {
        key: PERMISSION_KEYS.VENDEDORES_CREAR,
        label: "Gestionar altas de vendedores",
        description: "Abrir la pantalla de agregar vendedor (admin).",
      },
      { key: PERMISSION_KEYS.VENDEDORES_EDITAR, label: "Editar vendedores" },
    ],
  },
  {
    id: "archivos",
    label: "Archivos",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.ARCHIVOS_VER, label: "Ver archivos" },
      { key: PERMISSION_KEYS.ARCHIVOS_SUBIR, label: "Subir archivos" },
      { key: PERMISSION_KEYS.ARCHIVOS_ELIMINAR, label: "Eliminar archivos" },
    ],
  },
  {
    id: "proyectos",
    label: "Proyectos",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.PROYECTOS_VER, label: "Ver proyectos" },
      { key: PERMISSION_KEYS.PROYECTOS_CREAR, label: "Crear proyectos" },
      { key: PERMISSION_KEYS.PROYECTOS_EDITAR, label: "Editar proyectos" },
    ],
  },
  {
    id: "cotizaciones",
    label: "Cotizaciones",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.COTIZACIONES_VER, label: "Ver cotizaciones" },
      { key: PERMISSION_KEYS.COTIZACIONES_CREAR, label: "Crear cotizaciones" },
      { key: PERMISSION_KEYS.COTIZACIONES_EDITAR, label: "Editar cotizaciones" },
    ],
  },
  {
    id: "calendario",
    label: "Mi Calendario",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.CALENDARIO_VER, label: "Ver calendario" },
      {
        key: PERMISSION_KEYS.CALENDARIO_GESTIONAR,
        label: "Gestionar calendario",
        description: "Crear y editar eventos propios.",
      },
    ],
  },
  {
    id: "espacios",
    label: "Espacios de trabajo",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.ESPACIOS_VER, label: "Ver espacios" },
      { key: PERMISSION_KEYS.ESPACIOS_CREAR, label: "Crear espacios" },
      {
        key: PERMISSION_KEYS.ESPACIOS_MIEMBROS,
        label: "Gestionar miembros",
        description: "Agregar o quitar personas del espacio.",
      },
    ],
  },
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    enforced: true,
    permissions: [
      { key: PERMISSION_KEYS.WHATSAPP_VER, label: "Ver WhatsApp Business" },
      {
        key: PERMISSION_KEYS.WHATSAPP_CONFIGURAR,
        label: "Configurar WhatsApp Business",
      },
    ],
  },
];

const MODULE_BY_PERMISSION = new Map<PermissionKey, PermissionModule>();
for (const mod of PERMISSION_MODULES) {
  for (const perm of mod.permissions) {
    MODULE_BY_PERMISSION.set(perm.key, mod);
  }
}

export function getModuleForPermission(
  key: PermissionKey,
): PermissionModule | undefined {
  return MODULE_BY_PERMISSION.get(key);
}

export function isPermissionKey(value: string): value is PermissionKey {
  return MODULE_BY_PERMISSION.has(value as PermissionKey);
}

export function normalizePermissions(
  value: unknown,
): PermissionKey[] | null {
  if (value == null) return null;
  if (!Array.isArray(value)) return null;
  return value.filter(
    (item): item is PermissionKey =>
      typeof item === "string" && isPermissionKey(item),
  );
}

/** Roles que un admin o Gerencia puede asignar desde Usuarios. */
export const ASSIGNABLE_COMPANY_ROLES = [
  "gerencia",
  "vendedor",
  "user_company",
] as const;

export type AssignableCompanyRole = (typeof ASSIGNABLE_COMPANY_ROLES)[number];

export const ASSIGNABLE_ROLE_LABELS: Record<AssignableCompanyRole, string> = {
  gerencia: "Gerencia",
  vendedor: "Vendedor",
  user_company: "Usuario de empresa",
};
