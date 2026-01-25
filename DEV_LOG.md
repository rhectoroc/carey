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
