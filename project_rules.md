# IDIOMA Y COMUNICACIÓN
- **Idioma Principal:** Español.
- **Estilo:** Directo, profesional y técnico.
- **Términos Técnicos:** Mantén términos estándar en inglés (deploy, commit, props, webhook) para precisión.

# FRONTEND, DISEÑO Y UX (PREMIUM & MOBILE-FIRST)
- **Filosofía de Diseño:** Estilo "Lujo Amable".
  - **Paleta Oficial:** Azul Petróleo (`#1F6D8C`) y Dorado Suave (`#C5A059`) como acentos principales. Fondos blancos puros o superposiciones de cristal.
  - **Glassmorphism:** Para modales, tarjetas y elementos flotantes, usa `backdrop-filter: blur(16px-24px)`, fondos semitransparentes (`rgba(255,255,255,0.7)`) y bordes muy redondeados (`20px` a `40px`).
- **Animaciones (Motion Design):**
  - Usa **Framer Motion** para transiciones complejas (entradas, modales, acordeones).
  - Estilo: "Amable" y elástico (Spring animations, Scale-ins suaves).
  - **Micro-interacciones:** Feedback visual sutil (ej: "Price Bounce" al actualizar costos).
- **Mobile-First (Prioridad Absoluta):**
  - Toda interfaz DEBE funcionar perfectamente en 375px antes que en escritorio.
  - **Elementos Táctiles:** Área mínima de 44x44px.
  - **Navegación:** Menú hamburguesa automático en >3 items.
  - **Layouts:** Evita anchos fijos. Usa porcentajes o Flex/Grid responsive.

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
- **Regla:** Tras cada tarea exitosa, añade una línea en `DEV_LOG.md` con la fecha, el cambio realizado y archivos afectados.
- **Recuperación:** Si la sesión se reinicia o falla, lee `DEV_LOG.md` primero para recuperar el contexto.