export const SOCIAL_LINKS = [
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61576878181992', icon: '/icons/fb.svg' },
  ];

export const DEFAULT_ANIMALS_PER_PAGE = 12;
export const DEFAULT_RADIUS = 30;
export const RADIUS_OPTIONS_ANIMALS = [10, 20, 30, 50] as const;

export const DEFAULT_RADIUS_VETERINARIES = 5;
export const RADIUS_OPTIONS_VETERINARIES = [5, 10, 15, 20, 30] as const;

export const VETERINARIES_PER_PAGE = 10;
export const FETCH_LIMIT_VETERINARIES = 100;


export enum Role {
  ADMIN = "admin",
  USER = "user",
  AUTHOR = "author",
  ADMIN_COMPANY = "admin_company",
  VENDEDOR = "vendedor",
}

export const GOOGLE_PLACE_CATEGORIES = [
  // ── SALUD ──────────────────────────────────────────────
  { value: "médicos", label: "Médicos" },
  { value: "dentistas", label: "Dentistas" },
  { value: "clínicas", label: "Clínicas" },
  { value: "laboratorios", label: "Laboratorios" },
  { value: "farmacias", label: "Farmacias" },
  { value: "ópticas", label: "Ópticas" },
  { value: "veterinarias", label: "Veterinarias" },
  { value: "psicólogos", label: "Psicólogos" },
  { value: "fisioterapeutas", label: "Fisioterapeutas" },
  { value: "nutriólogos", label: "Nutriólogos" },
  { value: "quiroprácticos", label: "Quiroprácticos" },
  { value: "centros de rehabilitación", label: "Centros de rehabilitación" },
  { value: "hospitales", label: "Hospitales" },
  { value: "centros de diagnóstico", label: "Centros de diagnóstico" },
  { value: "medicina estética", label: "Medicina estética" },
  { value: "cirujanos plásticos", label: "Cirujanos plásticos" },
  { value: "pediatras", label: "Pediatras" },
  { value: "ginecólogos", label: "Ginecólogos" },
  { value: "dermatólogos", label: "Dermatólogos" },
  { value: "oftalmólogos", label: "Oftalmólogos" },

  // ── LEGAL Y FINANCIERO ─────────────────────────────────
  { value: "abogados", label: "Abogados" },
  { value: "notarías", label: "Notarías" },
  { value: "contadores", label: "Contadores" },
  { value: "bancos", label: "Bancos" },
  { value: "seguros", label: "Seguros" },
  { value: "casas de cambio", label: "Casas de cambio" },
  { value: "despachos contables", label: "Despachos contables" },
  { value: "consultoras empresariales", label: "Consultoras empresariales" },
  { value: "gestorías", label: "Gestorías" },

  // ── EDUCACIÓN ──────────────────────────────────────────
  { value: "escuelas", label: "Escuelas" },
  { value: "guarderías", label: "Guarderías" },
  { value: "autoescuelas", label: "Autoescuelas" },
  { value: "universidades", label: "Universidades" },
  { value: "academias de idiomas", label: "Academias de idiomas" },
  { value: "academias de música", label: "Academias de música" },
  { value: "academias de baile", label: "Academias de baile" },
  { value: "tutorías", label: "Tutorías" },
  { value: "centros de capacitación", label: "Centros de capacitación" },
  { value: "colegios privados", label: "Colegios privados" },

  // ── ALIMENTACIÓN ───────────────────────────────────────
  { value: "restaurantes", label: "Restaurantes" },
  { value: "cafeterías", label: "Cafeterías" },
  { value: "bares", label: "Bares" },
  { value: "panaderías", label: "Panaderías" },
  { value: "pastelerías", label: "Pastelerías" },
  { value: "taquerías", label: "Taquerías" },
  { value: "fondas", label: "Fondas" },
  { value: "pizzerías", label: "Pizzerías" },
  { value: "marisquerías", label: "Marisquerías" },
  { value: "cocinas económicas", label: "Cocinas económicas" },
  { value: "heladerías", label: "Heladerías" },
  { value: "juguerías", label: "Juguerías" },
  { value: "supermercados", label: "Supermercados" },
  { value: "carnicerías", label: "Carnicerías" },
  { value: "tortillerías", label: "Tortillerías" },

  // ── BELLEZA Y BIENESTAR ────────────────────────────────
  { value: "salones de belleza", label: "Salones de belleza" },
  { value: "peluquerías", label: "Peluquerías" },
  { value: "spa", label: "Spa" },
  { value: "gimnasios", label: "Gimnasios" },
  { value: "gimnasios de box", label: "Gimnasios de box" },
  { value: "estudios de yoga", label: "Estudios de yoga" },
  { value: "estudios de pilates", label: "Estudios de pilates" },
  { value: "centros de tatuajes", label: "Centros de tatuajes" },
  { value: "centros de depilación", label: "Centros de depilación" },
  { value: "barberías", label: "Barberías" },
  { value: "uñas y estética", label: "Uñas y estética" },

  // ── COMERCIO ───────────────────────────────────────────
  { value: "tiendas de ropa", label: "Tiendas de ropa" },
  { value: "tiendas de mascotas", label: "Tiendas de mascotas" },
  { value: "joyerías", label: "Joyerías" },
  { value: "mueblerías", label: "Mueblerías" },
  { value: "librerías", label: "Librerías" },
  { value: "florerías", label: "Florerías" },
  { value: "ferreterías", label: "Ferreterías" },
  { value: "electrónica", label: "Electrónica" },
  { value: "tiendas de deportes", label: "Tiendas de deportes" },
  { value: "tiendas de celulares", label: "Tiendas de celulares" },
  { value: "papelerías", label: "Papelerías" },
  { value: "jugueterías", label: "Jugueterías" },
  { value: "tiendas de novias", label: "Tiendas de novias" },
  { value: "tiendas de abarrotes", label: "Tiendas de abarrotes" },
  { value: "tiendas de materiales", label: "Tiendas de materiales" },
  { value: "distribuidoras", label: "Distribuidoras" },

    // ── INDUSTRIA Y PRODUCCIÓN ─────────────────────────────
    { value: "fábricas", label: "Fábricas" },
    { value: "procesadoras", label: "Procesadoras" },
    { value: "servicio de distribución", label: "Servicio de distribución" },
  

  // ── SERVICIOS AL HOGAR ─────────────────────────────────
  { value: "plomeros", label: "Plomeros" },
  { value: "electricistas", label: "Electricistas" },
  { value: "carpinterías", label: "Carpinterías" },
  { value: "lavanderías", label: "Lavanderías" },
  { value: "mudanzas", label: "Mudanzas" },
  { value: "herrería", label: "Herrería" },
  { value: "pintura y construcción", label: "Pintura y construcción" },
  { value: "impermeabilizantes", label: "Impermeabilizantes" },
  { value: "albanilería", label: "Albanilería" },
  { value: "fumigación", label: "Fumigación" },
  { value: "limpieza de hogares", label: "Limpieza de hogares" },
  { value: "instalación de alarmas", label: "Instalación de alarmas" },
  { value: "cerrajeros", label: "Cerrajeros" },

  // ── AUTOMOTRIZ ─────────────────────────────────────────
  { value: "talleres mecánicos", label: "Talleres mecánicos" },
  { value: "gasolineras", label: "Gasolineras" },
  { value: "agencias de autos", label: "Agencias de autos" },
  { value: "refaccionarias", label: "Refaccionarias" },
  { value: "llanterías", label: "Llanterías" },
  { value: "hojalatería y pintura", label: "Hojalatería y pintura" },
  { value: "verificaciones", label: "Verificaciones" },
  { value: "renta de autos", label: "Renta de autos" },
  { value: "estacionamientos", label: "Estacionamientos" },

  // ── INMOBILIARIO Y CONSTRUCCIÓN ────────────────────────
  { value: "inmobiliarias", label: "Inmobiliarias" },
  { value: "constructoras", label: "Constructoras" },
  { value: "arquitectos", label: "Arquitectos" },
  { value: "diseñadores de interiores", label: "Diseñadores de interiores" },
  { value: "valuadores", label: "Valuadores" },
  { value: "desarrolladoras", label: "Desarrolladoras" },

  // ── TURISMO Y ENTRETENIMIENTO ──────────────────────────
  { value: "hoteles", label: "Hoteles" },
  { value: "agencias de viajes", label: "Agencias de viajes" },
  { value: "salones de eventos", label: "Salones de eventos" },
  { value: "fotografía y video", label: "Fotografía y video" },
  { value: "grupos de música", label: "Grupos de música" },
  { value: "recreación infantil", label: "Recreación infantil" },
  { value: "cines", label: "Cines" },
  { value: "escape rooms", label: "Escape rooms" },
  { value: "parques de diversiones", label: "Parques de diversiones" },
  { value: "canchas deportivas", label: "Canchas deportivas" },

  // ── SERVICIOS DIGITALES Y CREATIVOS ───────────────────
  { value: "agencias de marketing", label: "Agencias de marketing" },
  { value: "agencias de diseño", label: "Agencias de diseño" },
  { value: "imprentas", label: "Imprentas" },
  { value: "fotografía", label: "Fotografía" },
  { value: "estudio de grabación", label: "Estudio de grabación" },
  { value: "agencias de publicidad", label: "Agencias de publicidad" },

  // ── RELIGIOSO Y SOCIAL ─────────────────────────────────
  { value: "iglesias", label: "Iglesias" },
  { value: "funerarias", label: "Funerarias" },
  { value: "asilos y casas de reposo", label: "Asilos y casas de reposo" },
  { value: "orfanatos", label: "Orfanatos" },
  { value: "organizaciones sin fines de lucro", label: "ONG / Sin fines de lucro" },

  // ── OTROS ──────────────────────────────────────────────
  { value: "negocios locales", label: "Negocios locales" },
  { value: "otra", label: "Otra" },
] as const;


/**
 * Mapa de relaciones para SEO Programático.
 * La llave (key) es el slug de la URL (ej: 'agencias-de-marketing').
 * El valor contiene el título amigable y un array con los 'values' de GOOGLE_PLACE_CATEGORIES 
 * que representan a los clientes ideales para ese nicho.
 */
export const NICHE_TARGET_MAPPING: Record<string, { title: string; idealClients: string[] }> = {

  // ── SERVICIOS PROFESIONALES ────────────────────────────
  "agencias-de-marketing": {
    title: "Agencias de Marketing Digital",
    idealClients: ["médicos", "clínicas", "dentistas", "restaurantes", "gimnasios", "abogados", "inmobiliarias", "hoteles", "spa", "medicina estética"],
  },
  "agencias-de-diseno": {
    title: "Agencias de Diseño y Freelancers",
    idealClients: ["dentistas", "psicólogos", "cafeterías", "spa", "hoteles", "gimnasios", "salones de belleza", "barberías", "nutriólogos", "medicina estética"],
  },
  "agencias-de-publicidad": {
    title: "Agencias de Publicidad",
    idealClients: ["restaurantes", "hoteles", "agencias de autos", "constructoras", "tiendas de ropa", "gimnasios", "salones de eventos", "inmobiliarias"],
  },
  "fotografia-y-video": {
    title: "Fotógrafos y Videógrafos",
    idealClients: ["salones de eventos", "restaurantes", "hoteles", "tiendas de novias", "inmobiliarias", "agencias de marketing", "medicina estética", "cirujanos plásticos"],
  },
  "imprentas": {
    title: "Imprentas y Diseño Gráfico",
    idealClients: ["restaurantes", "escuelas", "agencias de marketing", "inmobiliarias", "abogados", "contadores", "hoteles", "gimnasios", "tiendas de ropa"],
  },
  "estudio-de-grabacion": {
    title: "Estudios de Grabación y Producción",
    idealClients: ["grupos de música", "agencias de publicidad", "escuelas", "iglesias", "salones de eventos", "agencias de marketing"],
  },

  // ── LEGAL Y FINANCIERO ─────────────────────────────────
  "abogados": {
    title: "Abogados y Despachos Legales",
    idealClients: ["constructoras", "inmobiliarias", "fábricas", "hospitales", "servicio de distribución", "agencias de autos", "desarrolladoras", "notarías"],
  },
  "contadores": {
    title: "Contadores y Despachos Contables",
    idealClients: ["restaurantes", "tiendas de ropa", "farmacias", "ferreterías", "agencias de marketing", "constructoras", "distribuidoras", "gimnasios", "clínicas"],
  },
  "notarias": {
    title: "Notarías",
    idealClients: ["inmobiliarias", "constructoras", "desarrolladoras", "abogados", "agencias de autos", "valuadores"],
  },
  "seguros": {
    title: "Agentes y Agencias de Seguros",
    idealClients: ["médicos", "constructoras", "agencias de autos", "escuelas", "talleres mecánicos", "restaurantes", "gimnasios", "hospitales", "colegios privados"],
  },
  "gestoria": {
    title: "Gestorías y Trámites Empresariales",
    idealClients: ["constructoras", "fábricas", "distribuidoras", "agencias de autos", "restaurantes", "inmobiliarias", "transportistas"],
  },
  "consultoras-empresariales": {
    title: "Consultoras Empresariales",
    idealClients: ["restaurantes", "gimnasios", "clínicas", "hoteles", "constructoras", "agencias de marketing", "distribuidoras", "fábricas"],
  },

  // ── SALUD ──────────────────────────────────────────────
  "medicos": {
    title: "Médicos Generales y Especialistas",
    idealClients: ["laboratorios", "farmacias", "hospitales", "centros de diagnóstico", "ópticas", "centros de rehabilitación"],
  },
  "dentistas": {
    title: "Dentistas y Clínicas Dentales",
    idealClients: ["laboratorios", "farmacias", "escuelas", "guarderías", "colegios privados", "empresas corporativas"],
  },
  "veterinarias": {
    title: "Veterinarias y Clínicas de Mascotas",
    idealClients: ["tiendas de mascotas", "guarderías de mascotas", "parques de diversiones", "hoteles"],
  },
  "nutriologos": {
    title: "Nutriólogos y Coaches de Salud",
    idealClients: ["gimnasios", "estudios de yoga", "estudios de pilates", "spa", "escuelas", "hospitales"],
  },
  "fisioterapeutas": {
    title: "Fisioterapeutas y Rehabilitación",
    idealClients: ["gimnasios", "canchas deportivas", "hospitales", "clínicas", "agencias de autos", "constructoras"],
  },
  "medicina-estetica": {
    title: "Medicina Estética y Cirugía Plástica",
    idealClients: ["salones de belleza", "spa", "gimnasios", "centros de depilación", "uñas y estética", "barberías"],
  },
  "laboratorios": {
    title: "Laboratorios de Análisis Clínicos",
    idealClients: ["médicos", "clínicas", "hospitales", "pediatras", "ginecólogos", "centros de diagnóstico"],
  },

  // ── EDUCACIÓN ──────────────────────────────────────────
  "academias-de-idiomas": {
    title: "Academias de Idiomas",
    idealClients: ["escuelas", "colegios privados", "universidades", "hoteles", "agencias de viajes", "empresas corporativas"],
  },
  "academias-de-musica": {
    title: "Academias de Música y Arte",
    idealClients: ["escuelas", "colegios privados", "guarderías", "iglesias", "salones de eventos"],
  },
  "academias-de-baile": {
    title: "Academias de Baile y Danza",
    idealClients: ["salones de eventos", "escuelas", "gimnasios", "hoteles", "quinceañeras y bodas"],
  },
  "centros-de-capacitacion": {
    title: "Centros de Capacitación Empresarial",
    idealClients: ["fábricas", "distribuidoras", "constructoras", "hospitales", "bancos", "hoteles", "restaurantes"],
  },

  // ── ALIMENTACIÓN ───────────────────────────────────────
  "restaurantes": {
    title: "Restaurantes y Negocios de Comida",
    idealClients: ["carnicerías", "distribuidoras", "panaderías", "pastelerías", "lavanderías", "fumigación", "limpieza de hogares"],
  },
  "hoteles": {
    title: "Hoteles y Hospedaje",
    idealClients: ["agencias de viajes", "restaurantes", "lavanderías", "limpieza de hogares", "grupos de música", "fotografía y video", "agencias de eventos"],
  },

  // ── BELLEZA Y BIENESTAR ────────────────────────────────
  "salones-de-belleza": {
    title: "Salones de Belleza y Estéticas",
    idealClients: ["tiendas de novias", "medicina estética", "spa", "gimnasios", "hoteles", "quinceañeras"],
  },
  "gimnasios": {
    title: "Gimnasios y Centros Deportivos",
    idealClients: ["nutriólogos", "fisioterapeutas", "tiendas de deportes", "medicina estética", "estudios de yoga", "centros de rehabilitación"],
  },
  "spa": {
    title: "Spa y Centros de Bienestar",
    idealClients: ["hoteles", "medicina estética", "salones de belleza", "gimnasios", "agencias de viajes"],
  },

  // ── SERVICIOS AL HOGAR ─────────────────────────────────
  "plomeros": {
    title: "Plomeros y Fontanería",
    idealClients: ["constructoras", "inmobiliarias", "hoteles", "restaurantes", "hospitales", "colegios privados"],
  },
  "electricistas": {
    title: "Electricistas e Instalaciones",
    idealClients: ["constructoras", "inmobiliarias", "hoteles", "restaurantes", "fábricas", "hospitales", "colegios privados"],
  },
  "limpieza-de-hogares": {
    title: "Servicios de Limpieza y Mantenimiento",
    idealClients: ["hoteles", "hospitales", "escuelas", "colegios privados", "gimnasios", "bancos", "restaurantes", "oficinas corporativas"],
  },
  "fumigacion": {
    title: "Fumigación y Control de Plagas",
    idealClients: ["restaurantes", "hoteles", "hospitales", "escuelas", "almacenes", "distribuidoras", "fábricas"],
  },
  "instalacion-de-alarmas": {
    title: "Instalación de Alarmas y Seguridad",
    idealClients: ["inmobiliarias", "constructoras", "restaurantes", "hoteles", "escuelas", "joyerías", "bancos", "farmacias"],
  },
  "mudanzas": {
    title: "Servicios de Mudanzas",
    idealClients: ["inmobiliarias", "constructoras", "desarrolladoras", "oficinas corporativas", "hoteles"],
  },

  // ── AUTOMOTRIZ ─────────────────────────────────────────
  "talleres-mecanicos": {
    title: "Talleres Mecánicos y Autoservicio",
    idealClients: ["agencias de autos", "distribuidoras", "constructoras", "fábricas", "transportistas", "renta de autos"],
  },
  "agencias-de-autos": {
    title: "Agencias y Distribuidoras de Autos",
    idealClients: ["seguros", "talleres mecánicos", "llanterías", "hojalatería y pintura", "gestorías", "verificaciones"],
  },
  "refaccionarias": {
    title: "Refaccionarias y Auto Partes",
    idealClients: ["talleres mecánicos", "agencias de autos", "transportistas", "constructoras", "fábricas"],
  },
  "renta-de-autos": {
    title: "Renta de Autos y Transporte",
    idealClients: ["hoteles", "agencias de viajes", "hospitales", "aeropuertos", "empresas corporativas"],
  },

  // ── INMOBILIARIO Y CONSTRUCCIÓN ────────────────────────
  "inmobiliarias": {
    title: "Inmobiliarias y Bienes Raíces",
    idealClients: ["notarías", "abogados", "constructoras", "valuadores", "arquitectos", "diseñadores de interiores", "desarrolladoras"],
  },
  "constructoras": {
    title: "Constructoras y Contratistas",
    idealClients: ["arquitectos", "ferreterías", "tiendas de materiales", "electricistas", "plomeros", "herrería", "pintura y construcción"],
  },
  "arquitectos": {
    title: "Arquitectos y Diseñadores",
    idealClients: ["constructoras", "inmobiliarias", "desarrolladoras", "diseñadores de interiores", "ferreterías", "tiendas de materiales"],
  },
  "disenadores-de-interiores": {
    title: "Diseñadores de Interiores",
    idealClients: ["mueblerías", "constructoras", "inmobiliarias", "hoteles", "restaurantes", "desarrolladoras"],
  },

  // ── TURISMO Y ENTRETENIMIENTO ──────────────────────────
  "agencias-de-viajes": {
    title: "Agencias de Viajes y Turismo",
    idealClients: ["hoteles", "restaurantes", "renta de autos", "agencias de eventos", "grupos de música", "fotografía y video"],
  },
  "salones-de-eventos": {
    title: "Salones de Eventos y Banquetes",
    idealClients: ["grupos de música", "fotografía y video", "pastelerías", "panaderías", "florerías", "agencias de marketing", "catering"],
  },
  "grupos-de-musica": {
    title: "Grupos de Música y Entretenimiento",
    idealClients: ["salones de eventos", "hoteles", "restaurantes", "iglesias", "agencias de eventos"],
  },
  "recreacion-infantil": {
    title: "Recreación Infantil y Juegos",
    idealClients: ["guarderías", "colegios privados", "salones de eventos", "escuelas", "restaurantes familiares"],
  },

  // ── DISTRIBUCIÓN E INDUSTRIA ───────────────────────────
  "servicio-de-distribucion": {
    title: "Servicios de Distribución y Paquetería",
    idealClients: ["restaurantes", "farmacias", "tiendas de ropa", "joyerías", "papelerías", "distribuidoras", "supermercados", "carnicerías"],
  },
  "distribuidoras": {
    title: "Distribuidoras y Mayoristas",
    idealClients: ["restaurantes", "hoteles", "hospitales", "supermercados", "farmacias", "tiendas de abarrotes", "carnicerías"],
  },
  "fabricas": {
    title: "Fábricas y Manufactura",
    idealClients: ["distribuidoras", "servicio de distribución", "talleres mecánicos", "constructoras", "abogados", "contadores"],
  },

  // ── RELIGIOSO Y SOCIAL ─────────────────────────────────
  "iglesias": {
    title: "Iglesias y Organizaciones Religiosas",
    idealClients: ["grupos de música", "salones de eventos", "fotografía y video", "pastelerías", "florerías", "imprentas"],
  },
  "funerarias": {
    title: "Funerarias y Servicios Funerales",
    idealClients: ["iglesias", "florerías", "imprentas", "asilos y casas de reposo"],
  },
  "asilos-y-casas-de-reposo": {
    title: "Asilos y Casas de Reposo",
    idealClients: ["médicos", "farmacias", "nutriólogos", "fisioterapeutas", "limpieza de hogares", "lavanderías"],
  },

  // ── SOFTWARE Y TECNOLOGÍA ──────────────────────────────
  "software-y-tecnologia": {
    title: "Empresas de Software (SaaS) y TI",
    idealClients: ["restaurantes", "hoteles", "notarías", "inmobiliarias", "clínicas", "hospitales", "distribuidoras", "fábricas", "constructoras"],
  },

} as const;

export const PIPELINE_STATUS = {
  DETECTADO: "01 - Detectado",
  SELECCIONADO: "02 - Seleccionado",
  CONTACTADO: "03 - Contactado",
  SIN_RESPUESTA: "04 - Sin Respuesta",
  INTERESADO: "05 - Interesado",
  CREANDO_PROYECTO_PROPUESTA: "06 - Creando proyecto propuesta",
  PROPUESTA_ENVIADA: "07 - Propuesta Enviada",
  SEGUIMIENTO: "08 - Seguimiento",
  EN_NEGOCIACION: "09 - En Negociación",
  PROPUESTA_ACEPTADA: "10 - Propuesta Aceptada",
  PROPUESTA_RECHAZADA: "11 - Propuesta Rechazada",
  CERRADO_GANADO: "12 - Cerrado Ganado",
  CERRADO_PERDIDO: "13 - Cerrado Perdido",
  DESCARTADO: "14 - Descartado",
} as const;

/** Tailwind classes for pipeline status badge (text + bg). Unknown status falls back to neutral. */
export const PIPELINE_STATUS_COLORS: Record<string, string> = {
  [PIPELINE_STATUS.DETECTADO]:
    "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  [PIPELINE_STATUS.SELECCIONADO]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  [PIPELINE_STATUS.CONTACTADO]:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200",
  [PIPELINE_STATUS.SIN_RESPUESTA]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  [PIPELINE_STATUS.INTERESADO]:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  [PIPELINE_STATUS.CREANDO_PROYECTO_PROPUESTA]:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  [PIPELINE_STATUS.PROPUESTA_ENVIADA]:
    "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200",
  [PIPELINE_STATUS.SEGUIMIENTO]:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
  [PIPELINE_STATUS.EN_NEGOCIACION]:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
  [PIPELINE_STATUS.PROPUESTA_ACEPTADA]:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  [PIPELINE_STATUS.PROPUESTA_RECHAZADA]:
    "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
  [PIPELINE_STATUS.CERRADO_GANADO]:
    "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100 font-semibold",
  [PIPELINE_STATUS.CERRADO_PERDIDO]:
    "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100 font-semibold",
  [PIPELINE_STATUS.DESCARTADO]:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",
};

/**
 * Cabecera tipo tarjeta (degradado + anillo) alineada al tono de {@link PIPELINE_STATUS_COLORS}.
 * Para SectionCard / bloques donde el pipeline tiñe el encabezado.
 */
export const PIPELINE_STATUS_SECTION_HEADER: Record<string, string> = {
  [PIPELINE_STATUS.DETECTADO]:
    "border-slate-200 dark:border-slate-500/50 bg-gradient-to-br from-slate-500/26 to-slate-200/50 dark:from-slate-500/32 dark:to-slate-800/40 ring-1 ring-inset ring-slate-400/25 dark:ring-slate-500/35 text-slate-700 dark:text-slate-200",
  [PIPELINE_STATUS.SELECCIONADO]:
    "border-blue-200/90 dark:border-blue-500/25 bg-gradient-to-br from-blue-500/12 to-transparent dark:from-blue-500/15 dark:to-transparent ring-1 ring-inset ring-blue-500/10 dark:ring-blue-400/10 text-blue-800 dark:text-blue-200",
  [PIPELINE_STATUS.CONTACTADO]:
    "border-indigo-200/90 dark:border-indigo-500/25 bg-gradient-to-br from-indigo-500/12 to-transparent dark:from-indigo-500/15 dark:to-transparent ring-1 ring-inset ring-indigo-500/10 dark:ring-indigo-400/10 text-indigo-800 dark:text-indigo-200",
  [PIPELINE_STATUS.SIN_RESPUESTA]:
    "border-amber-200/90 dark:border-amber-500/25 bg-gradient-to-br from-amber-500/12 to-transparent dark:from-amber-500/15 dark:to-transparent ring-1 ring-inset ring-amber-500/10 dark:ring-amber-400/10 text-amber-800 dark:text-amber-200",
  [PIPELINE_STATUS.INTERESADO]:
    "border-emerald-200/90 dark:border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 to-transparent dark:from-emerald-500/15 dark:to-transparent ring-1 ring-inset ring-emerald-500/10 dark:ring-emerald-400/10 text-emerald-800 dark:text-emerald-200",
  [PIPELINE_STATUS.CREANDO_PROYECTO_PROPUESTA]:
    "border-sky-200/90 dark:border-sky-500/25 bg-gradient-to-br from-sky-500/12 to-transparent dark:from-sky-500/15 dark:to-transparent ring-1 ring-inset ring-sky-500/10 dark:ring-sky-400/10 text-sky-800 dark:text-sky-200",
  [PIPELINE_STATUS.PROPUESTA_ENVIADA]:
    "border-cyan-200/90 dark:border-cyan-500/25 bg-gradient-to-br from-cyan-500/12 to-transparent dark:from-cyan-500/15 dark:to-transparent ring-1 ring-inset ring-cyan-500/10 dark:ring-cyan-400/10 text-cyan-800 dark:text-cyan-200",
  [PIPELINE_STATUS.SEGUIMIENTO]:
    "border-violet-200/90 dark:border-violet-500/25 bg-gradient-to-br from-violet-500/12 to-transparent dark:from-violet-500/15 dark:to-transparent ring-1 ring-inset ring-violet-500/10 dark:ring-violet-400/10 text-violet-800 dark:text-violet-200",
  [PIPELINE_STATUS.EN_NEGOCIACION]:
    "border-orange-200/90 dark:border-orange-500/25 bg-gradient-to-br from-orange-500/12 to-transparent dark:from-orange-500/15 dark:to-transparent ring-1 ring-inset ring-orange-500/10 dark:ring-orange-400/10 text-orange-800 dark:text-orange-200",
  [PIPELINE_STATUS.PROPUESTA_ACEPTADA]:
    "border-green-200/90 dark:border-green-500/25 bg-gradient-to-br from-green-500/12 to-transparent dark:from-green-500/15 dark:to-transparent ring-1 ring-inset ring-green-500/10 dark:ring-green-400/10 text-green-800 dark:text-green-200",
  [PIPELINE_STATUS.PROPUESTA_RECHAZADA]:
    "border-red-200/90 dark:border-red-500/25 bg-gradient-to-br from-red-500/12 to-transparent dark:from-red-500/15 dark:to-transparent ring-1 ring-inset ring-red-500/10 dark:ring-red-400/10 text-red-800 dark:text-red-200",
  [PIPELINE_STATUS.CERRADO_GANADO]:
    "border-green-300/80 dark:border-green-500/30 bg-gradient-to-br from-green-600/15 to-transparent dark:from-green-600/22 dark:to-transparent ring-1 ring-inset ring-green-500/15 dark:ring-green-400/15 text-green-900 dark:text-green-100 font-semibold",
  [PIPELINE_STATUS.CERRADO_PERDIDO]:
    "border-red-300/80 dark:border-red-500/30 bg-gradient-to-br from-red-600/15 to-transparent dark:from-red-600/22 dark:to-transparent ring-1 ring-inset ring-red-500/15 dark:ring-red-400/15 text-red-900 dark:text-red-100 font-semibold",
  [PIPELINE_STATUS.DESCARTADO]:
    "border-neutral-200/90 dark:border-neutral-500/25 bg-gradient-to-br from-neutral-500/10 to-transparent dark:from-neutral-500/18 dark:to-transparent ring-1 ring-inset ring-neutral-400/12 dark:ring-neutral-500/20 text-neutral-600 dark:text-neutral-300",
};

export const DEFAULT_PIPELINE_SECTION_HEADER =
  "border-[#e0e0e0] dark:border-[#3a3a3a] bg-gradient-to-br from-neutral-500/10 to-transparent dark:from-neutral-500/15 dark:to-transparent ring-1 ring-inset ring-neutral-400/10 dark:ring-neutral-500/18 text-[#616161] dark:text-[#b0b0b0]";

/** Base classes for pipeline filter ring (apply when selected). */
export const PIPELINE_RING_BASE =
  "ring-2 ring-offset-2 dark:ring-offset-[#1e1e1e]";

/** Solo el color (ej. slate-500). Usar con PIPELINE_RING_BASE como ring-${color}. */
export const PIPELINE_STATUS_RING: Record<string, string> = {
  [PIPELINE_STATUS.DETECTADO]: "slate-500",
  [PIPELINE_STATUS.SELECCIONADO]: "blue-500",
  [PIPELINE_STATUS.CONTACTADO]: "indigo-500",
  [PIPELINE_STATUS.SIN_RESPUESTA]: "amber-500",
  [PIPELINE_STATUS.INTERESADO]: "emerald-500",
  [PIPELINE_STATUS.CREANDO_PROYECTO_PROPUESTA]: "sky-500",
  [PIPELINE_STATUS.PROPUESTA_ENVIADA]: "cyan-500",
  [PIPELINE_STATUS.SEGUIMIENTO]: "violet-500",
  [PIPELINE_STATUS.EN_NEGOCIACION]: "orange-500",
  [PIPELINE_STATUS.PROPUESTA_ACEPTADA]: "green-500",
  [PIPELINE_STATUS.PROPUESTA_RECHAZADA]: "red-500",
  [PIPELINE_STATUS.CERRADO_GANADO]: "green-600",
  [PIPELINE_STATUS.CERRADO_PERDIDO]: "red-600",
  [PIPELINE_STATUS.DESCARTADO]: "neutral-500",
};

export const SALES_ACTIVITY_TYPE = {
  LLAMADA: "Llamada",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  REUNION: "Reunión",
} as const;

export const PROPOSAL_STATUS = {
  ENVIADA: "Enviada",
  PENDIENTE: "Pendiente",
  ACEPTADA: "Aceptada",
  RECHAZADA: "Rechazada",
  COMPRADA: "Comprada",
} as const;

export const PROJECT_STATUS = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  EN_REVISION: "En revisión",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
} as const;

export const PROJECT_STATUS_OPTIONS = Object.values(PROJECT_STATUS);

/** Clases para badge de estado del proyecto. */
export const PROJECT_STATUS_CLASSES: Record<string, string> = {
  [PROJECT_STATUS.PENDIENTE]:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  [PROJECT_STATUS.EN_PROCESO]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200",
  [PROJECT_STATUS.EN_REVISION]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200",
  [PROJECT_STATUS.FINALIZADO]:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200",
  [PROJECT_STATUS.CANCELADO]:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",
};

export const FOLLOW_UP_TASK_STATUS = {
  PENDIENTE: "Pendiente",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
  POSPUESTO: "Pospuesto",
} as const;

export const TASK_PRIORITY = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
} as const;

export const EVENT_COLORS = {
  activity: "bg-orange-500",
  proposal: "bg-blue-500",
  followup: "bg-emerald-500",
} as const;

export const EVENT_LABELS = {
  activity: "Actividad",
  proposal: "Propuesta",
  followup: "Seguimiento",
} as const;

/** Subscription status (aligned with Stripe subscription status) */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELLED: "cancelled",
  UNPAID: "unpaid",
  TRIALING: "trialing",
} as const;

export const SUBSCRIPTION_STATUS_OPTIONS = [
  { label: "Activa", value: SUBSCRIPTION_STATUS.ACTIVE },
  { label: "Vencida", value: SUBSCRIPTION_STATUS.PAST_DUE },
  { label: "Cancelada", value: SUBSCRIPTION_STATUS.CANCELLED },
  { label: "No pagada", value: SUBSCRIPTION_STATUS.UNPAID },
  { label: "Prueba gratuita", value: SUBSCRIPTION_STATUS.TRIALING },
] as const;

/** Badge classes for subscription status. Unknown status uses neutral. */
export const SUBSCRIPTION_STATUS_CLASSES: Record<string, string> = {
  [SUBSCRIPTION_STATUS.ACTIVE]:
    "bg-green-500/15 text-green-700 dark:text-green-400 dark:bg-green-500/20",
  [SUBSCRIPTION_STATUS.PAST_DUE]:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:bg-amber-500/20",
  [SUBSCRIPTION_STATUS.CANCELLED]:
    "bg-[#e0e0e0] dark:bg-[#3a3a3a] text-[#616161] dark:text-[#b0b0b0]",
  [SUBSCRIPTION_STATUS.UNPAID]:
    "bg-red-500/15 text-red-700 dark:text-red-400 dark:bg-red-500/20",
  [SUBSCRIPTION_STATUS.TRIALING]:
    "bg-blue-500/15 text-blue-700 dark:text-blue-400 dark:bg-blue-500/20",
};

/** Plan feature keys (secciones/funcionalidades del sistema). Añadir aquí al agregar nuevas. */
export const PLAN_FEATURE_KEYS = {
  CRM: "crm",
  LEAD_SYNC: "lead_sync", //ready
  SALES_PERSON_MANAGEMENT: "sales_person_management", //ready
  EDIT_LEAD_DATA: "edit_lead_data",
  SALES_ACTIVITIES: "sales_activities", //ready
  ASSIGN_SALES_PERSON: "assign_sales_person", //ready
  FOLLOW_UP_TASKS: "follow_up_tasks", //ready
  PROPOSALS: "proposals", //ready
  CALENDAR_CRM: "calendar_crm",
  SALES_COMMISSION: "sales_commission",
  UPLOAD_FILES: "upload_files",
  PROJECTS: "projects",
  ADD_OWN_LEADS: "add_own_leads",
  EXPORT_EXCEL: "export_excel",
} as const;

export type PlanFeatureKey =
  (typeof PLAN_FEATURE_KEYS)[keyof typeof PLAN_FEATURE_KEYS];

/** Metadatos por feature (nombre y descripción para UI). Añadir entradas al agregar funcionalidades. */
export const PLAN_FEATURES_MAP: Record<
  PlanFeatureKey,
  { name: string; description: string }
> = {
  [PLAN_FEATURE_KEYS.LEAD_SYNC]: {
    name: "Búsqueda de leads en mapa",
    description: "Búsqueda de leads",
  },
  [PLAN_FEATURE_KEYS.CRM]: {
    name: "CRM",
    description: "Gestión de leads y ventas",
  },
  [PLAN_FEATURE_KEYS.EDIT_LEAD_DATA]: {
    name: "Editar datos del lead",
    description: "Editar datos del lead",
  },
  [PLAN_FEATURE_KEYS.SALES_ACTIVITIES]: {
    name: "Actividades de ventas",
    description: "Registrar actividades de ventas",
  },
  [PLAN_FEATURE_KEYS.FOLLOW_UP_TASKS]: {
    name: "Tareas de seguimiento",
    description: "Crear tareas de seguimiento",
  },
  [PLAN_FEATURE_KEYS.PROPOSALS]: {
    name: "Propuestas",
    description: "Crear y gestionar propuestas",
  },
  [PLAN_FEATURE_KEYS.CALENDAR_CRM]: {
    name: "Gestión de calendario",
    description:
      "Gestión de propuestas, actividades de ventas y tareas de seguimiento",
  },
  [PLAN_FEATURE_KEYS.SALES_PERSON_MANAGEMENT]: {
    name: "Gestión de vendedores",
    description: "Gestión de vendedores",
  },
  [PLAN_FEATURE_KEYS.SALES_COMMISSION]: {
    name: "Comisión de ventas",
    description: "Configurar comisión de ventas",
  },
  [PLAN_FEATURE_KEYS.ASSIGN_SALES_PERSON]: {
    name: "Asignar vendedor",
    description: "Asignar vendedor al lead",
  },
  [PLAN_FEATURE_KEYS.UPLOAD_FILES]: {
    name: "Subir archivos",
    description: "Subir archivos",
  },
  [PLAN_FEATURE_KEYS.PROJECTS]: {
    name: "Proyectos",
    description: "Crear y gestionar proyectos",
  },
  [PLAN_FEATURE_KEYS.ADD_OWN_LEADS]: {
    name: "Agregar leads propios",
    description: "Agregar leads propios",
  },
  [PLAN_FEATURE_KEYS.EXPORT_EXCEL]: {
    name: "Exportar a Excel",
    description: "Exportar leads a Excel",
  },
};
