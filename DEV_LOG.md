# DEV_LOG - Carey Tour

### 2026-01-24
- **Seguridad de Sesión:** Implementación de tabla `admin_sessions`, lógica de inactividad de 15 min y prevención de sesión concurrente. (Estado: Completado)
- **Corrección de Guardado de Datos:** Campos `type` y `duration_days` añadidos a APIs y formularios de hoteles/tours. (Estado: Completado)
- **Limpieza SQL:** Consolidación de esquema en `database/schema.sql` y eliminación de archivos migratorios redundantes. (Estado: Completado)
- **Buscador y Corrección de Imágenes:** Simplificación del buscador, eliminación de fallbacks de imágenes en todos los componentes de catálogo (`ServiceCard`, `DynamicSection`, `ResultCard`, `PromotionsSection`). Mejora en la lógica de filtrado por destino y nombre. (Estado: Completado)
- **Modernización de UI Administrador:** Implementación de carga Drag & Drop en imágenes/videos. Reemplazo de todos los `alert()` nativos por un sistema global de Toasts (NotificationProvider) para mensajes de éxito, error e información. (Estado: Completado)
- **Refinamiento UI y Supervisión CRUD:** Tags actualizados a color rojo para mayor visibilidad. Limpieza total de iconos de estrellas sobre imágenes en modales. Añadida funcionalidad de "Previsualización Real" (Modal) en los formularios de Hoteles y Tours para supervisar la vista del cliente antes de guardar. (Estado: Completado)
- **Seguridad y Visibilidad de UI:** Chatbot oculto en rutas administrativas (`/admin/**`). Restricción del módulo de gestión de usuarios exclusivamente al rol `administrador`. Ocultamiento del menú "Users" en el sidebar para empleados y freelancers. (Estado: Completado)
- **Refinamiento de Datos y UX:** Inclusión del campo "Duración" en el modal de detalles de servicios. Automatización de la generación de Slugs en los formularios de administración, eliminando la necesidad de entrada manual y previniendo errores de formato en las URLs. (Estado: Completado)
- **Conectividad Chatbot y Reservas:** Personalización de mensajes predeterminados del botón "Reservar Ahora" según la categoría (Tour, Hotel, Traslado). Integración síncrona que abre el asistente virtual y envía el mensaje de interés automáticamente. (Estado: Completado)
- **Automatización de Marketing:** Implementación de insignias automáticas ("OFERTA 🔥" y "DESTACADO ⭐") en tarjetas y modales basadas en los estados `is_promotion` e `is_featured`. Actualización de previsualizaciones administrativas para reflejar estos cambios en tiempo real. (Estado: Completado)

### 2026-01-25
- **Sincronización de Esquema:** Resolución de error de columna inexistente mediante la adición de la columna `stars` a la tabla `tours`. Actualización de `schema.sql`, `seeds.sql` y guiones de configuración. (Estado: Completado)
- **Mejora de Búsqueda de Destinos:** El buscador de destinos ahora muestra sugerencias automáticamente al ganar el foco (on focus), permitiendo ver destinos existentes sin necesidad de escribir. (Estado: Completado)
- **Integración de Chatbot con n8n:** Conexión exitosa del chatbot frontal con el workflow de n8n. Implementación de estado de carga ("pensando...") y manejo de sesiones dinámicas. (Estado: Completado)
- **Gestión de Momentos Inolvidables:** Creación del sistema CRUD completo para la sección "Momentos Inolvidables". Incluye tabla en base de datos, APIs administrativas y públicas, y panel de gestión en el administrador.
- **Control de Videos en Catálogo:** Flexibilización de la restricción de videos; ahora se permite exactamente un (1) video por Tour u Hotel, manteniendo el control de activos pero permitiendo contenido multimedia.
- **Resiliencia y Corrección de Homepage:** Implementación de fallbacks (datos mock) en las APIs públicas para evitar que la página principal se vea vacía si la base de datos no es accesible. Corrección de bug en animaciones GSAP y soporte multi-idioma para la sección de Momentos.
- **Refactorización Responsive (Mobile-First):** Auditoría UX y refactorización completa del layout global, navegación, grillas de catálogo y barra de búsqueda. Implementación de regla de 1 columna en móvil y áreas de toque de 44px. (Estado: Completado)
- **Correcciones Mobile Post-Audit:** Refactorización profunda de Hero.tsx y CSS. Se despejó el título del Navbar aumentando padding superior, se cambió Hero a `height: auto` para evitar recortes, y se eliminó div con margen negativo en `page.tsx`. Implementación de animaciones de tarjetas individuales activadas por scroll (`gsap individually triggered`) para mejorar la experiencia en móviles. (Estado: Completado)

### 2026-01-27
- **Traducción Panel Admin:** Traducción completa al español de todos los módulos administrativos (Dashboard, Hoteles, Tours, Destinos, Traslados, Usuarios). Estandarización de idioma y terminología técnica en inglés cuando amerita. (Estado: Completado)
- **Corrección de Persistencia JSON:** Solución al error crítico "invalid input syntax for type json" en la creación/edición de Hoteles y Traslados. Implementación de serialización correcta (`JSON.stringify`) para columnas JSONB (features, gallery, tags). (Estado: Completado)
- **Corrección de Vista Previa Admin:** Solución al problema de opacidad (`ServiceCard`) que ocultaba la vista previa en el panel de administración. Corrección de visibilidad de texto en input de fecha. (Estado: Completado)
- **Mejora de UX Admin:** Implementación de Tipos de Habitación Dinámicos en Hoteles y campos mejorados (Creador, Image Uploader) en Momentos Inolvidables. (Estado: Completado)
- **Sistema de Cotizaciones:** Implementación de tabla `quotes` y punto final de API (`POST /api/quotes`) con motor de cálculo de precios (Hotel + Extras) y validación de fechas. (Estado: Completado - Backend)
- **Frontend Cotizador:** Creación de página `/quote` y componente `QuoteForm` con diseño mobile-first, selectores táctiles grandes y conexión a la API de cotizaciones. (Estado: Completado)
- **Inteligencia de Destino:** Actualización de APIs (`tours`, `transfers`) para soportar filtrado por destino. Implementación en `QuoteForm` para cargar extras dinámicamente según el hotel seleccionado y calcular precio en vivo. (Estado: Completado)
- **Soporte Solo Tours:** Actualización de lógica en API de Cotizaciones para permitir `hotel_id` nulo. Validación de "al menos un servicio" (Hotel o Extra). (Estado: Completado - Backend)
- **UI Cotizador Tours:** Adaptación de `QuoteForm` para reconocer el parámetro `?tour_id=X`. En este modo, oculta selectores de hotel y fecha de salida, muestra el nombre del tour en cabecera y pre-carga el servicio. (Estado: Completado - Etapa 5)
- **Integración Clientes (CRM):** Creación de tabla `customers`. Actualización de API de Cotizaciones para buscar o crear cliente automáticamente por Cédula/Pasaporte (`document_id`). Modificación de UI con campos separados de Nombre/Apellido y Documento. (Estado: Completado - Etapa 6)
- **Panel de Cotizaciones (Admin):** Creación de `/admin/quotes` con tabla filtrable (estado, búsqueda), modal de detalle completo y enlace directo a WhatsApp. API `GET /api/quotes` con paginación y `PATCH /api/quotes` para cambio de estado. (Estado: Completado - Etapa 7)
- **UX Doble Acción:** Rediseño de tarjetas de servicios (`ServiceCard`) para incluir dos botones: "Cotizar Ahora" (Primario -> `/quote`) y "Consultar" (Secundario -> WhatsApp). Implementación responsive (Stack en móvil, Row en desktop). (Estado: Completado - Etapa 8)
- **Fix Depuración Build (Framer Motion):** Solución a error de tipado en `QuoteForm.tsx` con Framer Motion 12.x. Se importó explícitamente el tipo `Variants` y se tipó el objeto de animaciones para cumplir con la inferencia de cadenas de TypeScript. (Estado: Completado)
- **Modal Integrado de Cotización (Embedded):** Implementación de `QuoteForm` embebido en `ServiceModal`. Ajuste visual para eliminar parpadeo (removal of Framer Motion entry), redimensionamiento correcto, nuevos campos de contacto (Apellido, ID), y visualización de extras como lista limpia. Se eliminó texto redundante y se optimizó el layout del formulario. (Estado: Completado - Premium UX Polished)
- **Nueva Página de Cotización Wizard:** Creación de página dedicada `/quote` con diseño innovador de 4 pasos:
  - **Arquitectura:** Wizard paso a paso con barra de progreso visual, animaciones suaves entre pasos (Framer Motion), y precio en tiempo real siempre visible.
  - **Paso 1 - Servicio:** Selección visual entre Hotel/Tour con tarjetas interactivas que muestran imagen, ubicación y precio.
  - **Paso 2 - Fechas & Huéspedes:** Inputs de fecha optimizados y contadores elegantes para adultos, niños e infantes.
  - **Paso 3 - Extras:** Selección opcional de traslados y tours adicionales con feedback visual.
  - **Paso 4 - Contacto:** Formulario completo (nombre, apellido, documento, teléfono, email).
  - **Diseño Premium:** Glassmorphism, gradientes con paleta oficial (Azul Petróleo #1F6D8C + Dorado #C5A059), micro-animaciones, y pantalla de éxito celebratoria.
  - **Mobile-First:** Grids adaptativos, botones táctiles 44px+, footer reorganizado en columna para móviles.
  - **Integración:** Conectado a APIs existentes, soporte para parámetros URL (`?hotel_id=X`, `?tour_id=X`), cálculo dinámico de precio.
  - **Archivos:** `src/app/quote/page.tsx` (Suspense wrapper), `src/app/quote/QuotePageContent.tsx` (lógica wizard), `src/app/quote/QuotePage.module.css` (estilos premium).
  (Estado: Completado - Innovador y Profesional)

### 2026-05-13
- **Migración a Nuevo VPS:** Creación de script `database/init_full.sql` unificado (schema + índices + seed data + usuario admin) para inicialización completa desde cero. Nombre de BD corregido a `carey`. (Estado: Completado)
- **Corrección db.ts:** Eliminado override de SSL en el Pool de pg. La conexión `sslmode=disable` se respeta directamente desde la connection string `DATABASE_URL`, evitando conflictos. Archivo: `src/lib/db.ts`. (Estado: Completado)
- **Fix Cookie de Sesión (Crítico):** Corregido bug donde la cookie `admin_session` se marcaba como `Secure: true` basándose en `NODE_ENV`, ignorando que Easypanel termina SSL en el proxy reverso. Ahora se detecta HTTPS real vía header `X-Forwarded-Proto`. `sameSite` cambiado de `strict` a `lax`. Archivo: `src/app/api/auth/login/route.ts`. (Estado: Completado)
- **Volumen Docker:** Confirmado path `/files` como mount point para persistencia de imágenes. El `imageProcessor.ts` detecta automáticamente este directorio en producción. (Estado: Documentado)
- **Usuarios Admin:** Hash bcrypt corregido para `admin`/`admin1234`. Creado usuario `rhectoroc@gmail.com` con rol `administrador` via pgcrypto en DbGate. (Estado: Completado)
