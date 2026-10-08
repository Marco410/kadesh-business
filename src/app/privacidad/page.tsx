import {
  KADESH_LEGAL,
  formatKadeshLegalAddress,
} from "kadesh/constants/legal";
import { Routes } from "kadesh/core/routes";
import { SITE_URL } from "kadesh/core/site";

const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

export default function PrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-[#1e1e1e] shadow-md rounded-3xl p-8 border border-[#e0e0e0] dark:border-[#3a3a3a]">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-extrabold text-orange-500 text-center">
            Aviso de Privacidad
          </h1>
          <p className="text-lg text-[#5c4033] dark:text-[#d4c4b8] text-center">
            Kadesh — Plataforma de Prospección B2B
          </p>
          <p className="text-sm text-[#5c4033]/80 dark:text-[#d4c4b8]/80 text-center">
            Última actualización: 8 de octubre de 2026
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            I. Responsable del tratamiento de datos personales
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            {KADESH_LEGAL.legalName}, en adelante &quot;el Responsable&quot;,
            con domicilio en {formatKadeshLegalAddress()}, teléfono{" "}
            <a
              href={KADESH_LEGAL.tel}
              className="text-orange-600 dark:text-orange-400 underline"
            >
              {KADESH_LEGAL.phoneDisplay}
            </a>
            , y con presencia digital en el sitio web{" "}
            <a
              href={SITE_URL}
              className="text-orange-600 dark:text-orange-400 underline"
            >
              {SITE_HOST}
            </a>
            , es el responsable del tratamiento de sus datos personales.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Para cualquier consulta relacionada con este Aviso de Privacidad,
            puede contactarnos a través del correo electrónico:{" "}
            <a
              href={`mailto:${KADESH_LEGAL.email}`}
              className="text-orange-600 dark:text-orange-400 underline"
            >
              {KADESH_LEGAL.email}
            </a>{" "}
            o al teléfono indicado arriba.
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            II. Datos personales que se recaban
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Con motivo de los servicios que presta Kadesh, el Responsable podrá
            recabar los siguientes datos personales:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <li>Nombre completo</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono o WhatsApp</li>
            <li>Información sobre actividad profesional o giro comercial</li>
            <li>Datos de facturación (en caso de suscripción de pago)</li>
            <li>
              Información de uso de la plataforma (logs, sesiones,
              interacciones)
            </li>
            <li>
              Datos de usuario de Google, cuando usted autoriza el inicio de
              sesión con Google o la integración con Google Calendar (ver
              sección IX)
            </li>
            <li>
              Datos provenientes de Meta (WhatsApp Business y Facebook), cuando
              usted o su empresa conectan esas integraciones (ver sección X)
            </li>
          </ul>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            No se recaban datos personales sensibles en los términos de la Ley
            Federal de Protección de Datos Personales en Posesión de los
            Particulares (LFPDPPP), salvo que usted los proporcione de forma
            voluntaria dentro del contenido que gestione en la plataforma (por
            ejemplo, notas o eventos de calendario).
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            III. Finalidades del tratamiento
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Sus datos personales serán utilizados para las siguientes
            finalidades primarias, las cuales son necesarias para la prestación
            del servicio:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <li>Crear y gestionar su cuenta en la plataforma Kadesh</li>
            <li>
              Proveer acceso a las funcionalidades del servicio contratado
            </li>
            <li>Procesar pagos y emitir comprobantes fiscales</li>
            <li>Brindar soporte técnico y atención al cliente</li>
            <li>
              Enviar notificaciones relacionadas con su cuenta y el servicio
            </li>
            <li>
              Autenticar su identidad mediante Google Sign-In y sincronizar
              calendarios cuando usted lo autorice
            </li>
          </ul>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            De manera secundaria, y con su consentimiento, sus datos podrán ser
            utilizados para:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <li>
              Envío de comunicaciones comerciales, promociones y novedades de
              Kadesh
            </li>
            <li>
              Realización de encuestas de satisfacción y mejora del servicio
            </li>
            <li>Elaboración de estadísticas internas de uso</li>
          </ul>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Si no desea que sus datos sean tratados para las finalidades
            secundarias, puede manifestarlo enviando un correo a{" "}
            <a
              href="mailto:contacto@kadesh.com.mx"
              className="text-orange-600 dark:text-orange-400 underline"
            >
              contacto@kadesh.com.mx
            </a>
            .
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            IV. Transferencia de datos
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            El Responsable no venderá, cederá ni transferirá sus datos
            personales a terceros sin su consentimiento, salvo en los casos
            previstos en el artículo 37 de la LFPDPPP, incluyendo:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <li>
              Proveedores de servicios tecnológicos necesarios para la operación
              de la plataforma (hosting, procesamiento de pagos, envío de
              correos electrónicos)
            </li>
            <li>Autoridades competentes cuando exista una obligación legal</li>
          </ul>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Los proveedores tecnológicos que pudieran tener acceso a sus datos
            actúan como encargados del tratamiento y están sujetos a
            obligaciones de confidencialidad. No transferimos ni divulgamos
            datos de usuario de Google a terceros para fines distintos a los
            necesarios para prestar o mejorar las funcionalidades que usted
            solicita en Kadesh.
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            V. Derechos ARCO
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al
            tratamiento de sus datos personales (derechos ARCO). Para ejercer
            estos derechos, deberá enviar una solicitud al correo:{" "}
            <a
              href="mailto:contacto@kadesh.com.mx"
              className="text-orange-600 dark:text-orange-400 underline"
            >
              contacto@kadesh.com.mx
            </a>
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Su solicitud deberá contener:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <li>
              Nombre completo y correo electrónico registrado en la plataforma
            </li>
            <li>Descripción clara del derecho que desea ejercer</li>
            <li>Cualquier documento que permita acreditar su identidad</li>
          </ul>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            El Responsable dará respuesta a su solicitud en un plazo máximo de
            20 días hábiles a partir de su recepción.
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            VI. Mecanismos de protección de datos
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Contamos con procedimientos de seguridad técnicos y organizativos
            para proteger la confidencialidad, integridad y disponibilidad de
            sus datos personales, incluidos los datos de usuario de Google.
            Entre las medidas aplicadas se encuentran:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <li>
              Cifrado en tránsito: toda la comunicación entre su navegador y
              nuestros servidores se realiza mediante HTTPS/TLS.
            </li>
            <li>
              Cifrado en reposo: la información sensible almacenada en nuestros
              sistemas —incluyendo tokens de acceso OAuth de Google,
              credenciales de sesión y datos de cuenta— se protege mediante
              cifrado en reposo.
            </li>
            <li>
              Control de acceso: el acceso a sistemas y datos se limita al
              personal autorizado bajo el principio de mínimo privilegio y se
              registra cuando corresponde.
            </li>
            <li>
              Protección de tokens OAuth: los tokens de acceso y actualización
              de Google se almacenan de forma cifrada en el servidor; no se
              exponen al navegador ni se transmiten en texto plano.
            </li>
            <li>
              Monitoreo y prevención: aplicamos medidas razonables contra acceso
              no autorizado, pérdida, alteración o divulgación indebida de la
              información.
            </li>
          </ul>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Utilizamos cifrado y procedimientos de seguridad para proteger su
            información. Ningún método de transmisión o almacenamiento es
            absolutamente seguro; no obstante, mantenemos controles actualizados
            para reducir riesgos de forma continua.
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            VII. Retención y eliminación de datos
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Conservamos su información personal durante el tiempo necesario para
            cumplir las finalidades descritas en este Aviso de Privacidad,
            mientras su cuenta permanezca activa o mientras sea necesario para
            prestar el servicio, salvo que la ley exija o permita un periodo de
            retención mayor (por ejemplo, obligaciones fiscales o de prevención
            de fraude).
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Cuando expire el periodo de retención aplicable a un tipo de dato,
            lo eliminaremos o destruiremos de forma segura, o lo anonimizaremos
            de modo que ya no permita identificarle.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Usted puede solicitar la eliminación de sus datos personales
            —incluidos los datos de usuario de Google asociados a su cuenta—
            enviando un correo a{" "}
            <a
              href="mailto:contacto@kadesh.com.mx"
              className="text-orange-600 dark:text-orange-400 underline"
            >
              contacto@kadesh.com.mx
            </a>{" "}
            con el asunto &quot;Eliminación de datos&quot; e indicando el correo
            registrado en Kadesh. Tras verificar su identidad, eliminaremos o
            anonimizaremos sus datos en un plazo máximo de 30 días, excepto la
            información que debamos conservar por obligación legal.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Para datos recibidos a través de Meta, consulte también la sección
            X y la página{" "}
            <a
              href={Routes.dataDeletion}
              className="text-orange-600 dark:text-orange-400 underline"
            >
              {`${SITE_HOST}${Routes.dataDeletion}`}
            </a>
            .
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Respecto a los datos de Google en particular:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <li>
              Puede desconectar Google Calendar desde el panel de Kadesh
              (&quot;Mi Calendario&quot;). Al desconectar una cuenta, revocamos
              el acceso y eliminamos de forma permanente los tokens OAuth
              almacenados para esa conexión.
            </li>
            <li>
              También puede revocar el acceso de Kadesh a su cuenta de Google en
              cualquier momento desde{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 underline"
              >
                myaccount.google.com/permissions
              </a>
              . Tras la revocación, los tokens dejarán de ser válidos y los
              eliminaremos de nuestros sistemas.
            </li>
            <li>
              Los eventos de calendario de Google se consultan bajo demanda para
              mostrarlos en Kadesh; no los conservamos de forma indefinida como
              copia primaria. Cualquier dato derivado que hubiera quedado
              almacenado se elimina al desconectar la cuenta o al atender una
              solicitud de eliminación.
            </li>
          </ul>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            VIII. Uso de cookies y tecnologías de rastreo
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Kadesh puede hacer uso de cookies y tecnologías similares para
            mejorar la experiencia del usuario, analizar el tráfico del sitio y
            personalizar el contenido. Estas tecnologías no recaban datos
            sensibles.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Puede configurar su navegador para rechazar el uso de cookies; sin
            embargo, esto podría afectar el funcionamiento de algunas
            funcionalidades de la plataforma.
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            IX. Datos de usuario de Google
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Kadesh utiliza las API de Google (incluido Google Sign-In y Google
            Calendar) para funcionalidades que usted solicita de forma
            explícita. El uso y la transferencia a cualquier otra aplicación de
            la información recibida de las API de Google se ajustan a la{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 dark:text-orange-400 underline"
            >
              Política de Datos de Usuario de los Servicios API de Google
            </a>
            , incluidos los requisitos de Uso Limitado.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <strong className="font-semibold">
              Qué datos de Google accedemos:
            </strong>
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <li>
              Google Sign-In: identificador de cuenta, nombre y correo
              electrónico necesarios para crear o iniciar su sesión en Kadesh.
            </li>
            <li>
              Google Calendar (cuando usted conecta la integración): dirección
              de correo de la cuenta conectada, lista de calendarios, metadatos
              de calendarios y eventos (título, fecha/hora, ubicación,
              descripción y color) de los calendarios que usted marca como
              visibles.
            </li>
          </ul>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <strong className="font-semibold">Cómo usamos esos datos:</strong>{" "}
            únicamente para autenticarle, mostrar sus calendarios y eventos
            dentro de Kadesh, y crear o sincronizar eventos que usted genera en
            la plataforma hacia los calendarios de Google que haya autorizado.
            No usamos datos de usuario de Google para publicidad dirigida, venta
            a brokers de datos, determinación de crédito, ni para entrenar
            modelos de inteligencia artificial o aprendizaje automático
            generalizados.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <strong className="font-semibold">Con quién se comparten:</strong>{" "}
            no vendemos ni compartimos datos de usuario de Google con terceros
            para fines ajenos a prestar o mejorar las funciones de autenticación
            y calendario de Kadesh. Solo pueden procesarlos proveedores de
            infraestructura necesarios para operar el servicio, bajo
            obligaciones de confidencialidad.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            La protección, retención y eliminación de estos datos se rigen por
            las secciones VI y VII de este aviso.
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            X. Datos de Meta (Facebook y WhatsApp)
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Kadesh utiliza las API de Meta Platforms, Inc. (WhatsApp Business
            Cloud API y la Graph API de Facebook) para funcionalidades que usted
            o su empresa activan de forma explícita.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <strong className="font-semibold">
              Qué datos de Meta tratamos:
            </strong>
          </p>
          <ul className="list-disc pl-6 space-y-2 text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <li>
              WhatsApp Business: cuando su empresa conecta su número de WhatsApp
              Business a Kadesh, tratamos el número telefónico y el nombre de
              perfil de los contactos que escriben o a quienes se escribe, el
              contenido de los mensajes (texto, imágenes y documentos), sus
              fechas y estados de entrega, y los identificadores técnicos de la
              cuenta (WABA, ID del número). Los tokens de acceso se almacenan
              cifrados en el servidor.
            </li>
            <li>
              Páginas de Facebook: Kadesh publica contenido en las Páginas de
              Facebook propias de Kadesh y Kadesh Pet, usando tokens de Página
              que no se exponen al navegador.
            </li>
          </ul>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <strong className="font-semibold">Cómo usamos esos datos:</strong>{" "}
            únicamente para mostrar y gestionar las conversaciones de WhatsApp
            dentro del CRM de Kadesh, enviar los mensajes y plantillas que usted
            genera, asociar las conversaciones con sus prospectos y publicar
            contenido en nuestras Páginas. No usamos datos obtenidos de Meta
            para publicidad dirigida, no los vendemos a terceros o brokers de
            datos y no los usamos para entrenar modelos de inteligencia
            artificial generalizados.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <strong className="font-semibold">Con quién se comparten:</strong>{" "}
            solo con proveedores de infraestructura necesarios para operar el
            servicio (hosting, base de datos y almacenamiento), bajo obligaciones
            de confidencialidad, y con Meta en la medida necesaria para enviar y
            recibir los mensajes.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            <strong className="font-semibold">Eliminación de datos:</strong>{" "}
            puede solicitar la eliminación de los datos que Kadesh haya recibido
            a través de Meta (a) desde Facebook, en Configuración y privacidad
            &gt; Configuración &gt; Apps y sitios web &gt; Kadesh &gt; Eliminar,
            lo cual nos envía la solicitud automáticamente y le entrega un
            código de confirmación que puede consultar en{" "}
            <a
              href={Routes.dataDeletion}
              className="text-orange-600 dark:text-orange-400 underline"
            >
              {`${SITE_HOST}${Routes.dataDeletion}`}
            </a>
            ; o (b) escribiendo a{" "}
            <a
              href="mailto:contacto@kadesh.com.mx"
              className="text-orange-600 dark:text-orange-400 underline"
            >
              contacto@kadesh.com.mx
            </a>{" "}
            con el asunto &quot;Eliminación de datos&quot;. Atendemos las
            solicitudes en un plazo máximo de 30 días, conforme a la sección
            VII.
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            XI. Cambios al Aviso de Privacidad
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            El Responsable se reserva el derecho de modificar el presente Aviso
            de Privacidad en cualquier momento. Cualquier cambio será notificado
            a través del sitio web{" "}
            <a
              href={SITE_URL}
              className="text-orange-600 dark:text-orange-400 underline"
            >
              {SITE_HOST}
            </a>{" "}
            o mediante correo electrónico a los usuarios registrados. Si el
            cambio afecta el uso de datos de usuario de Google, se le pedirá
            consentimiento antes de aplicar el nuevo uso.
          </p>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            El uso continuado de la plataforma tras la notificación de cambios
            implica la aceptación del Aviso actualizado, salvo cuando la ley o
            las políticas de Google exijan un consentimiento explícito
            adicional.
          </p>

          <h2 className="text-2xl text-orange-500 mt-4 font-semibold">
            XII. Consentimiento
          </h2>
          <p className="text-base text-[#5c4033] dark:text-[#d4c4b8]">
            Al proporcionar sus datos personales a través de los formularios de
            registro o contacto de Kadesh, o al autorizar el acceso a su cuenta
            de Google, usted manifiesta haber leído y aceptado el presente Aviso
            de Privacidad, y otorga su consentimiento para el tratamiento de sus
            datos conforme a las finalidades aquí descritas.
          </p>

          <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-8 text-center">
            {formatKadeshLegalAddress()} — Octubre 2026
          </p>
        </div>
      </div>
    </div>
  );
}
