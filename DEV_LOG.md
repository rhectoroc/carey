# DEV_LOG - Carey Tour

### 2026-01-24
- **Seguridad de Sesión:** Implementación de tabla `admin_sessions`, lógica de inactividad de 15 min y prevención de sesión concurrente. (Estado: Completado)
- **Corrección de Guardado de Datos:** Campos `type` y `duration_days` añadidos a APIs y formularios de hoteles/tours. (Estado: Completado)
- **Limpieza SQL:** Consolidación de esquema en `database/schema.sql` y eliminación de archivos migratorios redundantes. (Estado: Completado)
- **Buscador y Corrección de Imágenes:** Simplificación del buscador, eliminación de fallbacks de imágenes en todos los componentes de catálogo (`ServiceCard`, `DynamicSection`, `ResultCard`, `PromotionsSection`). Mejora en la lógica de filtrado por destino y nombre. (Estado: Completado)
