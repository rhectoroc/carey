# IDIOMA Y COMUNICACIÓN
- SIEMPRE responde en español, independientemente del idioma en el que esté el código o la consulta original, a menos que se te pida explícitamente lo contrario.
- Mantén los términos técnicos en inglés si es lo estándar en la industria (ej: "deployment", "workflow", "commit"), pero explica el resto en español.
# INFRAESTRUCTURA Y DEPLOYMENT
- **Entorno:** Docker gestionado mediante Easypanel.
- **Flujo de Desarrollo:**
  1. Los cambios de código se commitean y empujan al repositorio de Git.
  2. El despliegue (Deploy) se realiza en el contenedor tipo "App" dentro de Easypanel.
- **Restricción:** No sugieras comandos de deploy manuales (tipo `npm start` en producción) ni subidas por FTP. Asume siempre que el ciclo es Git -> Easypanel.
# BASE DE DATOS (POSTGRESQL)
- **Motor:** PostgreSQL (Docker).
- **Herramienta de Gestión:** DbGate.
- **PROTOCOLO DE CAMBIOS (Strict):**
  1. Si una nueva funcionalidad requiere cambios en la estructura de la base de datos (nuevas tablas, columnas, tipos de datos o índices), **NO** asumas que usaré migraciones de ORM.
  2. **GENERA SIEMPRE** el bloque de código SQL (DDL) necesario en sintaxis PostgreSQL.
  3. Preséntalo explícitamente diciendo: "Ejecuta este SQL en DbGate para actualizar tu esquema".
  4. Asegúrate de incluir las restricciones necesarias (Foreign Keys, NOT NULL, DEFAULT) en ese SQL.
  # CONTEXTO DEL ECOSISTEMA
- Este proyecto puede interactuar con mis flujos de automatización en n8n.
- Ten en cuenta que la infraestructura es propia (Self-hosted).
# ESTÁNDARES DE DESARROLLO Y UI/UX
- **PRINCIPIO DRY (Don't Repeat Yourself) EN FRONTEND:**
  1. **Consistencia Visual:** Si generas un elemento de UI (como un modal, una barra de búsqueda o una tabla de datos), asume que ese estilo es el ESTÁNDAR para toda la aplicación.
  2. **Reutilización:** Antes de escribir código nuevo para un componente de interfaz, verifica si ya existe uno similar en el proyecto. Si existe, adáptalo o reutilízalo en lugar de crear una variación nueva.
  3. **Patrones de Diseño:**
     - Si las barras de búsqueda están arriba a la derecha en una pantalla, ubícalas allí en todas.
     - Si los formularios usan validación en tiempo real en un módulo, úsala en todos.
     - Mantén la misma paleta de colores, bordes y sombras definidos en el CSS/Theme global.
- **Componentes Críticos:** Trata los Modals, Tablas y Sidebars como componentes globales. No hardcodees estilos únicos para una sola vista a menos que sea estrictamente necesario.
# PERSISTENCIA DE CONTEXTO Y RECUPERACIÓN DE ERRORES
- **MEMORIA A LARGO PLAZO:**
  1. Mantén actualizado un archivo en la raíz llamado `DEV_LOG.md`.
  2. **Regla de Oro:** Cada vez que completes una tarea exitosamente (ej: crear un componente, ajustar una query SQL), agrega una línea en `DEV_LOG.md` con la fecha, la tarea realizada y el estado actual.
  3. Si el agente se reinicia o falla, tu PRIMERA acción debe ser leer `DEV_LOG.md` para saber en qué punto nos quedamos.
- **MANEJO DE CRASHES:**
  - Si la sesión se termina inesperadamente, no intentes adivinar. Lee el último commit de Git y el `DEV_LOG.md` para reconstruir el contexto antes de proponer código nuevo.