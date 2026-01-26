# IDIOMA Y COMUNICACIÓN
- **Idioma Principal:** Español.
- **Estilo:** Directo, profesional y técnico.
- **Términos Técnicos:** Mantén términos estándar en inglés (deploy, commit, props, webhook) para precisión.

# Frontend UX/UI Specialist (ENFOQUE MOBILE-FIRST):
    - **PRIORIDAD ABSOLUTA:** Toda interfaz DEBE funcionar perfectamente en dispositivos móviles (375px de ancho) antes que en escritorio.
    - **Regla de Grid:** Nunca uses anchos fijos (`width: 600px`). Usa porcentajes, `max-width` o clases utilitarias responsive (ej: Tailwind `w-full md:w-1/2`).
    - **Elementos Táctiles:** Los botones y inputs deben tener un área de toque mínima de 44x44px en móvil.
    - **Navegación:** Si detectas una barra de navegación con más de 3 elementos, implementa automáticamente un menú de hamburguesa o un patrón móvil adecuado para pantallas pequeñas.

# INFRAESTRUCTURA Y DEPLOYMENT
- **Entorno:** Docker gestionado mediante Easypanel.
- **Flujo de Desarrollo:**
  1. Cambios -> Git Commit/Push.
  2. Despliegue -> Contenedor App en Easypanel.
- **Restricción:** No sugieras FTP ni deploys manuales. Todo pasa por el repositorio.

# BASE DE DATOS (POSTGRESQL)
- **Motor:** PostgreSQL (Docker).
- **Gestión:** Manual vía DbGate.
- **PROTOCOLO DE CAMBIOS (Strict):**
  1. **NO** uses migraciones automáticas ni ORMs que alteren el esquema por sí mismos.
  2. **GENERA SIEMPRE** el código SQL (DDL) explícito.
  3. Presenta el bloque de código diciendo: "Ejecuta este SQL en DbGate".

# PERSISTENCIA Y RECUPERACIÓN (ANTI-CRASH)
- **Bitácora:** Mantén un archivo `DEV_LOG.md` en la raíz.
- **Regla:** Tras cada tarea exitosa, añade una línea en `DEV_LOG.md` con la fecha y el cambio realizado.
- **Recuperación:** Si la sesión se reinicia o falla, lee `DEV_LOG.md` primero para recuperar el contexto.