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
