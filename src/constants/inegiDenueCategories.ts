/**
 * Tipos de negocio para búsqueda DENUE (INEGI).
 * Mantener alineado con kadesh-back `utils/constants/inegiDenueCategories.ts`.
 *
 * id: único en el dropdown (Autocomplete).
 * value: keyword ASCII para `syncLeadsFromInegi` (puede repetirse: varios labels
 *        apuntan a la misma clase SCIAN / texto de Clase_actividad).
 * label: texto que ve el usuario.
 * Sin acentos en value: IIS 404 con %C3%A9. No mandar el código SCIAN, solo el keyword.
 */
export const INEGI_DENUE_CATEGORIES = [
  // ── SALUD (62) ─────────────────────────────────────────
  { id: "medicos", value: "medicina", label: "Médicos" }, // 621111 medicina general, 621113 especializada
  { id: "dentistas", value: "dentales", label: "Dentistas" }, // 621211 Consultorios dentales
  { id: "clinicas", value: "clinicas", label: "Clínicas" }, // 621115 Clínicas de consultorios médicos
  { id: "laboratorios", value: "diagnostico", label: "Laboratorios" }, // 621511 Laboratorios médicos y de diagnóstico
  { id: "farmacias", value: "farmacias", label: "Farmacias" }, // 464111/464112 Farmacias
  { id: "opticas", value: "optometria", label: "Ópticas" }, // 621320 Consultorios de optometría
  { id: "veterinarias", value: "veterinarios", label: "Veterinarias" }, // 541941 Servicios veterinarios para mascotas
  { id: "psicologos", value: "psicologia", label: "Psicólogos" }, // 621331 Consultorios de psicología
  { id: "fisioterapeutas", value: "terapia", label: "Fisioterapeutas" }, // 621341 terapia ocupacional, física y del lenguaje
  { id: "nutriologos", value: "nutriologos", label: "Nutriólogos" }, // 621391 Consultorios de nutriólogos y dietistas
  { id: "quiropracticos", value: "quiropractica", label: "Quiroprácticos" }, // 621311 Consultorios de quiropráctica
  {
    id: "centros_rehabilitacion",
    value: "rehabilitacion",
    label: "Centros de rehabilitación",
  }, // 623111 residencias… rehabilitación
  { id: "hospitales", value: "hospitales", label: "Hospitales" }, // 622111
  {
    id: "centros_diagnostico",
    value: "diagnostico",
    label: "Centros de diagnóstico",
  }, // 621511
  { id: "ambulancias", value: "ambulancias", label: "Ambulancias" }, // 621910
  {
    id: "enfermeria_domicilio",
    value: "enfermeria",
    label: "Enfermería a domicilio",
  }, // 621610
  { id: "ortopedicos", value: "ortopedicos", label: "Ortopédicos" }, // 464122
  {
    id: "productos_naturistas",
    value: "naturistas",
    label: "Productos naturistas",
  }, // 464113
  { id: "medicina_estetica", value: "belleza", label: "Medicina estética" }, // 812110
  {
    id: "cirujanos_plasticos",
    value: "especializada",
    label: "Cirujanos plásticos",
  }, // 621113 medicina especializada
  { id: "pediatras", value: "especializada", label: "Pediatras" },
  { id: "ginecologos", value: "especializada", label: "Ginecólogos" },
  { id: "dermatologos", value: "especializada", label: "Dermatólogos" },
  { id: "oftalmologos", value: "especializada", label: "Oftalmólogos" },

  // ── LEGAL Y FINANCIERO ─────────────────────────────────
  { id: "abogados", value: "bufetes", label: "Abogados" }, // 541110 Bufetes jurídicos
  { id: "notarias", value: "notarias", label: "Notarías" }, // 541120 Notarías públicas
  { id: "contadores", value: "contabilidad", label: "Contadores" }, // 541211 Servicios de contabilidad y auditoría
  { id: "bancos", value: "banca", label: "Bancos" }, // 522110 Banca múltiple
  { id: "seguros", value: "seguros", label: "Seguros" }, // 524110 Compañías de seguros / 524210 agentes
  { id: "casas_cambio", value: "cambio", label: "Casas de cambio" }, // 523121 Casas de cambio
  {
    id: "despachos_contables",
    value: "contabilidad",
    label: "Despachos contables",
  }, // 541211
  {
    id: "consultoras",
    value: "consultoria",
    label: "Consultoras empresariales",
  }, // 541610
  { id: "gestorias", value: "tramites", label: "Gestorías" }, // 541190
  { id: "ingenieros", value: "ingenieria", label: "Ingenieros" }, // 541330
  { id: "software_sistemas", value: "computo", label: "Software y sistemas" }, // 541510 diseño de sistemas de cómputo
  {
    id: "relaciones_publicas",
    value: "relaciones",
    label: "Relaciones públicas",
  }, // 541820
  {
    id: "investigacion_mercados",
    value: "encuestas",
    label: "Investigación de mercados",
  }, // 541910
  { id: "traduccion", value: "traduccion", label: "Traducción" }, // 541930
  { id: "casas_empeno", value: "empeno", label: "Casas de empeño" }, // 522452

  // ── EDUCACIÓN (61) ─────────────────────────────────────
  { id: "escuelas", value: "escuelas", label: "Escuelas" }, // 6111
  { id: "preescolar", value: "preescolar", label: "Preescolar" }, // 611111 preescolar y estimulación temprana
  { id: "guarderias", value: "guarderias", label: "Guarderías" }, // 624411
  { id: "autoescuelas", value: "oficios", label: "Autoescuelas" }, // 611511
  { id: "universidades", value: "superior", label: "Universidades" }, // 611311
  { id: "academias_idiomas", value: "idiomas", label: "Academias de idiomas" }, // 611631
  { id: "academias_musica", value: "arte", label: "Academias de música" }, // 611611
  { id: "academias_baile", value: "arte", label: "Academias de baile" },
  {
    id: "escuelas_computacion",
    value: "computacion",
    label: "Escuelas de computación",
  }, // 611421
  { id: "tutorias", value: "profesores", label: "Tutorías" }, // 611691
  {
    id: "centros_capacitacion",
    value: "capacitacion",
    label: "Centros de capacitación",
  }, // 611431
  { id: "colegios_privados", value: "escuelas", label: "Colegios privados" },

  // ── ALIMENTACIÓN (72 / 46 / 31) ────────────────────────
  { id: "restaurantes", value: "restaurantes", label: "Restaurantes" }, // 722511
  { id: "cafeterias", value: "cafeterias", label: "Cafeterías" }, // 722515 Cafeterías, fuentes de sodas, neverías…
  { id: "bares", value: "bares", label: "Bares" }, // 722412 Bares, cantinas y similares
  { id: "panaderias", value: "panificacion", label: "Panaderías" }, // 311812 Panificación tradicional
  { id: "pastelerias", value: "panificacion", label: "Pastelerías" },
  { id: "taquerias", value: "tacos", label: "Taquerías" }, // 722514 tacos y tortas
  { id: "fondas", value: "antojitos", label: "Fondas" }, // 722513 antojitos
  { id: "pizzerias", value: "pizzas", label: "Pizzerías" }, // 722517 pizzas, hamburguesas…
  { id: "marisquerias", value: "mariscos", label: "Marisquerías" }, // 722512 pescados y mariscos
  { id: "cocinas_economicas", value: "corrida", label: "Cocinas económicas" }, // 722511 comida corrida
  { id: "heladerias", value: "neverias", label: "Heladerías" }, // 722515 neverías / 461170 paletas de hielo y helados
  { id: "juguerias", value: "refresquerias", label: "Juguerías" }, // 722515
  { id: "supermercados", value: "supermercados", label: "Supermercados" }, // 462111
  { id: "minisupers", value: "minisupers", label: "Minisupers" }, // 462112
  { id: "carnicerias", value: "carnes", label: "Carnicerías" }, // 461121
  { id: "fruterias", value: "frutas", label: "Fruterías y verdulerías" }, // 461130
  { id: "vinos_licores", value: "licores", label: "Vinos y licores" }, // 461211
  { id: "tortillerias", value: "tortillas", label: "Tortillerías" }, // 311830
  { id: "banquetes", value: "ocasiones", label: "Banquetes y catering" }, // 722320 alimentos para ocasiones especiales
  {
    id: "food_trucks",
    value: "moviles",
    label: "Comida para llevar / food trucks",
  }, // 722330 unidades móviles
  { id: "discotecas", value: "discotecas", label: "Discotecas" }, // 722411

  // ── BELLEZA Y BIENESTAR ────────────────────────────────
  { id: "salones_belleza", value: "belleza", label: "Salones de belleza" }, // 812110 Salones y clínicas de belleza y peluquerías
  { id: "peluquerias", value: "peluquerias", label: "Peluquerías" }, // 812110
  { id: "spa", value: "belleza", label: "Spa" },
  { id: "gimnasios", value: "acondicionamiento", label: "Gimnasios" }, // 713943 Centros de acondicionamiento físico
  {
    id: "gimnasios_box",
    value: "acondicionamiento",
    label: "Gimnasios de box",
  },
  { id: "yoga", value: "acondicionamiento", label: "Estudios de yoga" },
  { id: "pilates", value: "acondicionamiento", label: "Estudios de pilates" },
  { id: "tatuajes", value: "personales", label: "Centros de tatuajes" }, // 812990 Otros servicios personales
  { id: "depilacion", value: "belleza", label: "Centros de depilación" },
  { id: "barberias", value: "peluquerias", label: "Barberías" },
  { id: "unas", value: "belleza", label: "Uñas y estética" },

  // ── COMERCIO (46) ──────────────────────────────────────
  { id: "tiendas_ropa", value: "ropa", label: "Tiendas de ropa" }, // 463211
  { id: "zapaterias", value: "calzado", label: "Zapaterías" }, // 463310
  {
    id: "tiendas_departamentales",
    value: "departamentales",
    label: "Tiendas departamentales",
  }, // 462210
  { id: "tiendas_mascotas", value: "mascotas", label: "Tiendas de mascotas" }, // 465911 mascotas y sus accesorios
  { id: "joyerias", value: "joyeria", label: "Joyerías" }, // 465112
  { id: "mueblerias", value: "muebles", label: "Mueblerías" }, // 466111
  { id: "librerias", value: "libros", label: "Librerías" }, // 465312
  { id: "florerias", value: "flores", label: "Florerías" }, // 466312
  { id: "ferreterias", value: "ferreterias", label: "Ferreterías" }, // 467111
  { id: "electronica", value: "electrodomesticos", label: "Electrónica" }, // 466112
  { id: "tiendas_computo", value: "computo", label: "Tiendas de cómputo" }, // 466211
  { id: "opticas_lentes", value: "lentes", label: "Ópticas" }, // 464121
  { id: "tiendas_deportes", value: "deportivos", label: "Tiendas de deportes" }, // 465215
  {
    id: "tiendas_celulares",
    value: "telefonos",
    label: "Tiendas de celulares",
  }, // 466212
  { id: "papelerias", value: "papeleria", label: "Papelerías" }, // 465311
  { id: "jugueterias", value: "juguetes", label: "Jugueterías" }, // 465212
  { id: "bicicleterias", value: "bicicletas", label: "Bicicleterías" }, // 465213
  { id: "tiendas_novias", value: "novia", label: "Tiendas de novias" }, // 463214
  { id: "perfumerias", value: "cosmeticos", label: "Perfumerías" }, // 465111
  { id: "artesanias", value: "artesanias", label: "Artesanías" }, // 465915
  { id: "abarrotes", value: "abarrotes", label: "Tiendas de abarrotes" }, // 461110
  {
    id: "tiendas_materiales",
    value: "construccion",
    label: "Tiendas de materiales",
  }, // 467116
  { id: "vidrios_espejos", value: "vidrios", label: "Vidrios y espejos" }, // 467114
  { id: "agencias_motos", value: "motocicletas", label: "Agencias de motos" }, // 468311
  { id: "distribuidoras", value: "abarrotes", label: "Distribuidoras" },

  // ── INDUSTRIA ──────────────────────────────────────────
  { id: "fabricas", value: "fabricacion", label: "Fábricas" },
  { id: "procesadoras", value: "fabricacion", label: "Procesadoras" },
  {
    id: "servicio_distribucion",
    value: "transporte",
    label: "Servicio de distribución",
  }, // 48-49 transportes

  // ── SERVICIOS AL HOGAR ─────────────────────────────────
  { id: "plomeros", value: "hidrosanitarias", label: "Plomeros" }, // 238221
  { id: "electricistas", value: "electricas", label: "Electricistas" }, // 238210
  {
    id: "aire_acondicionado",
    value: "calefaccion",
    label: "Aire acondicionado",
  }, // 238222
  { id: "carpinterias", value: "carpinteria", label: "Carpinterías" }, // 238350
  { id: "lavanderias", value: "lavanderias", label: "Lavanderías" }, // 812210
  { id: "mudanzas", value: "mudanzas", label: "Mudanzas" }, // 484210
  { id: "herreria", value: "herreria", label: "Herrería" }, // 332320
  {
    id: "pintura_construccion",
    value: "pintura",
    label: "Pintura y construcción",
  }, // 238320
  { id: "impermeabilizantes", value: "pintura", label: "Impermeabilizantes" },
  { id: "albanileria", value: "albanileria", label: "Albanilería" }, // 238130
  { id: "fumigacion", value: "plagas", label: "Fumigación" }, // 561710
  { id: "limpieza", value: "limpieza", label: "Limpieza de hogares" }, // 561720
  { id: "jardineria", value: "verdes", label: "Jardinería" }, // 561730 áreas verdes
  { id: "alarmas", value: "seguridad", label: "Instalación de alarmas" }, // 561620
  { id: "cerrajeros", value: "cerrajerias", label: "Cerrajeros" }, // 811491
  { id: "mensajeria", value: "mensajeria", label: "Mensajería y paquetería" }, // 492210
  { id: "agencias_aduanales", value: "aduanales", label: "Agencias aduanales" }, // 488511
  { id: "agencias_empleo", value: "colocacion", label: "Agencias de empleo" }, // 561310
  { id: "fotocopiado", value: "fotocopiado", label: "Fotocopiado" }, // 561431
  {
    id: "despachos_cobranza",
    value: "cobranza",
    label: "Despachos de cobranza",
  }, // 561440

  // ── AUTOMOTRIZ ─────────────────────────────────────────
  { id: "talleres_mecanicos", value: "mecanica", label: "Talleres mecánicos" }, // 811111 Reparación mecánica en general
  { id: "gasolineras", value: "gasolina", label: "Gasolineras" }, // 468411 gasolina y diésel
  { id: "agencias_autos", value: "automoviles", label: "Agencias de autos" }, // 468111 automóviles y camionetas nuevos
  { id: "refaccionarias", value: "refacciones", label: "Refaccionarias" }, // 468211 partes y refacciones
  { id: "llanteras", value: "llantas", label: "Llanterías" }, // 468213 llantas y cámaras
  { id: "hojalateria", value: "hojalateria", label: "Hojalatería y pintura" }, // 811121
  { id: "verificaciones", value: "alineacion", label: "Verificaciones" }, // 811116
  { id: "renta_autos", value: "alquiler", label: "Renta de autos" }, // 532110
  {
    id: "estacionamientos",
    value: "estacionamientos",
    label: "Estacionamientos",
  }, // 812410
  { id: "autolavado", value: "lubricado", label: "Autolavado" }, // 811192 Lavado y lubricado
  { id: "gruas", value: "grua", label: "Grúas" }, // 488410

  // ── INMOBILIARIO Y CONSTRUCCIÓN ────────────────────────
  { id: "inmobiliarias", value: "inmobiliarias", label: "Inmobiliarias" }, // 531210 Inmobiliarias y corredores de bienes raíces
  { id: "constructoras", value: "edificacion", label: "Constructoras" }, // 236111 Edificación de vivienda
  { id: "arquitectos", value: "arquitectura", label: "Arquitectos" }, // 541310 Servicios de arquitectura
  {
    id: "disenadores_interiores",
    value: "interiores",
    label: "Diseñadores de interiores",
  }, // 541410 Diseño y decoración de interiores
  { id: "valuadores", value: "inmobiliarias", label: "Valuadores" }, // sin clase propia; cae en servicios inmobiliarios
  { id: "desarrolladoras", value: "edificacion", label: "Desarrolladoras" },

  // ── TURISMO Y ENTRETENIMIENTO ──────────────────────────
  { id: "hoteles", value: "hoteles", label: "Hoteles" }, // 721111/721112
  { id: "moteles", value: "moteles", label: "Moteles" }, // 721113
  { id: "agencias_viajes", value: "viajes", label: "Agencias de viajes" }, // 561510
  { id: "salones_eventos", value: "salones", label: "Salones de eventos" }, // 531113
  { id: "fotografia_video", value: "fotografia", label: "Fotografía y video" }, // 541920 fotografía y videograbación
  { id: "grupos_musica", value: "musicales", label: "Grupos de música" }, // 711131
  {
    id: "recreacion_infantil",
    value: "diversiones",
    label: "Recreación infantil",
  }, // 713111
  { id: "cines", value: "peliculas", label: "Cines" }, // 512130
  { id: "escape_rooms", value: "juegos", label: "Escape rooms" }, // 713120
  {
    id: "parques_diversiones",
    value: "diversiones",
    label: "Parques de diversiones",
  }, // 713111
  { id: "balnearios", value: "balnearios", label: "Balnearios" }, // 713113 parques acuáticos y balnearios
  { id: "boliches", value: "boliches", label: "Boliches" }, // 713950
  {
    id: "canchas_deportivas",
    value: "deportivos",
    label: "Canchas deportivas",
  }, // 713941

  // ── SERVICIOS DIGITALES Y CREATIVOS ───────────────────
  {
    id: "agencias_marketing",
    value: "publicidad",
    label: "Agencias de marketing",
  }, // 541810 Agencias de publicidad
  { id: "agencias_diseno", value: "grafico", label: "Agencias de diseño" }, // 541430 Diseño gráfico
  { id: "imprentas", value: "impresion", label: "Imprentas" }, // 323111 Impresión de libros…
  { id: "fotografia", value: "fotografia", label: "Fotografía" }, // 541920
  {
    id: "estudio_grabacion",
    value: "grabacion",
    label: "Estudio de grabación",
  }, // 512240 (si aplica) / 711510 independientes
  {
    id: "agencias_publicidad",
    value: "publicidad",
    label: "Agencias de publicidad",
  }, // 541810

  // ── RELIGIOSO Y SOCIAL ─────────────────────────────────
  { id: "iglesias", value: "religiosas", label: "Iglesias" }, // 813210 Asociaciones y organizaciones religiosas
  { id: "funerarias", value: "funerarios", label: "Funerarias" }, // 812310 Servicios funerarios
  { id: "asilos", value: "asilos", label: "Asilos y casas de reposo" }, // 623311 Asilos… cuidado de ancianos
  { id: "orfanatos", value: "orfanatos", label: "Orfanatos" }, // 623991 Orfanatos y otras residencias
  { id: "ong", value: "civiles", label: "ONG / Sin fines de lucro" }, // 813230 Asociaciones y organizaciones civiles

  // ── OTROS ──────────────────────────────────────────────
  { id: "negocios_locales", value: "todos", label: "Negocios locales" },
  { id: "otra", value: "todos", label: "Otra" },
] as const;

/** DENUE/IIS 404 si el keyword lleva acentos. */
export function toInegiDenueKeyword(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/** Resuelve el keyword DENUE a partir del id del dropdown o de un value suelto. */
export function getInegiDenueKeyword(idOrValue: string): string {
  const normalized = idOrValue.trim().toLowerCase();
  const byId = INEGI_DENUE_CATEGORIES.find((c) => c.id === normalized);
  if (byId) return byId.value;
  const byValue = INEGI_DENUE_CATEGORIES.find((c) => c.value === normalized);
  return toInegiDenueKeyword(byValue?.value ?? idOrValue);
}
