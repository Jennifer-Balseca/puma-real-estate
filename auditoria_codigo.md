# Auditoría de Código Estático: Frontend y Backend - Puma Real Estate

Este documento detalla los hallazgos del análisis estático de código realizado sobre el repositorio de **Puma Real Estate**. Los resultados están estructurados sin alterar ningún archivo de código fuente, y se organizan según la naturaleza del hallazgo en secciones para el **Frontend** y el **Backend**.

---

## 💻 FRONTEND (Client)

### 1. Variables, Imports o Funciones no Utilizadas (Código Muerto)

| Archivo | Ruta Exacta | Línea | Hallazgo | Sugerencia de Mejora |
| :--- | :--- | :--- | :--- | :--- |
| `AgentDashboard.jsx` | `client/src/pages/AgentDashboard.jsx` | 9 | La constante `statusLabels` está declarada pero nunca se utiliza. | Remover la declaración de `statusLabels` para limpiar el espacio de nombres. |
| `AgentDashboard.jsx` | `client/src/pages/AgentDashboard.jsx` | 65 | La variable `removeVisit` está asignada pero nunca se usa. | Eliminar la asignación de `removeVisit` o implementarla en el flujo. |
| `AgentRequests.jsx` | `client/src/pages/AgentRequests.jsx` | 16 | La constante `user` se extrae de `useAuth` pero no se utiliza. | Quitar `user` de la desestructuración de `useAuth`. |
| `HomePage.jsx` | `client/src/pages/HomePage.jsx` | 22 | Parámetro `e` no utilizado en el manejador y bloque de sentencia vacío. | Remover el parámetro y el bloque o documentar su propósito. |
| `Nosotros.jsx` | `client/src/pages/Nosotros.jsx` | 1-2 | Imports de `React` y `Link` sin uso activo en el archivo. | Limpiar los imports de la cabecera para optimizar la compilación. |
| `PropertyDetail.jsx` | `client/src/pages/PropertyDetail.jsx` | 21 | Parámetro `e` definido pero sin uso en la función. | Quitar el parámetro `e`. |
| `Propiedades.jsx` | `client/src/pages/Propiedades.jsx` | 16, 35 | Las variables `error` y `prices` están declaradas/asignadas sin uso. | Quitar las variables de estado redundantes. |

### 2. Lógica o Estructuras Duplicadas

| Componentes Relacionados | Rutas Exactas | Hallazgo | Sugerencia de Mejora |
| :--- | :--- | :--- | :--- |
| `AgentRequests.jsx`, `AgentAgenda.jsx`, `AdminVisitRequests.jsx`, `AdminDashboard.jsx`, `VisitDetailModal.jsx`, `NotificationBell.jsx` | `client/src/pages/*` y `client/src/components/*` | Formateo duplicado de fechas y horas locales mediante `new Date(date).toLocaleDateString()` repetido en 7 archivos distintos. | Crear una función helper centralizada de utilidad en `client/src/utils/date.js` (ej. `formatLocalDate`) e importarla donde corresponda. |
| Modales de la interfaz | `client/src/components/ChangePasswordModal.jsx` y otros componentes de tipo modal | Estilos Tailwind de fondo semi-transparente (`bg-black/70`), transiciones de opacidad y botones de cierre replicados individualmente en el JSX. | Abstraer la estructura base del modal en un componente contenedor reutilizable `ModalLayout.jsx`. |

### 3. Archivos o Componentes Complejos (Más de 300 líneas)

| Componente | Ruta Exacta | Líneas (Aprox) | Motivo de Complejidad | Sugerencia de Rediseño / División |
| :--- | :--- | :--- | :--- | :--- |
| `AdminDashboard.jsx` | `client/src/pages/AdminDashboard.jsx` | ~1,000 | Gestiona estadísticas globales, agregaciones, listados de visitas y renderizado de múltiples gráficos. | Extraer los gráficos de rendimiento a subcomponentes separados (ej. `PerformanceCharts.jsx`, `VisitsTable.jsx`). |
| `AdminAgentes.jsx` | `client/src/pages/AdminAgentes.jsx` | ~800 | Controla la lista de asesores, registros, actualizaciones de perfil, modales y validaciones internas en un único archivo. | Separar el modal de registro y el formulario de edición de asesores en componentes dedicados (`AgentFormModal.jsx`). |
| `AgentNewProperty.jsx` | `client/src/pages/AgentNewProperty.jsx` | ~600 | Combina un gran formulario de carga, subida de multimedia a Firebase, manejo de múltiples amenidades y lógica de guardado. | Dividir en subcomponentes funcionales: `MultimediaUploader.jsx` (ya existente, pero mejorar integración), y `AmenitiesForm.jsx`. |
| `PropertyCatalog.jsx` | `client/src/components/PropertyCatalog.jsx` | ~500 | Contiene la lógica de filtros complejos, paginación y renderizado de la grilla de propiedades. | Extraer el panel lateral de filtros a un componente autónomo `FilterPanel.jsx`. |
| `VisitRequestForm.jsx` | `client/src/components/VisitRequestForm.jsx` | ~327 | Lógica densa de validación reactiva de inputs en tiempo real combinada con el maquetado del formulario de solicitud. | Separar las funciones de validación regex a un helper externo. |

---

## ⚙️ BACKEND (Server)

### 1. Variables, Imports o Funciones no Utilizadas (Código Muerto)

| Archivo / Controlador | Ruta Exacta | Línea | Hallazgo | Sugerencia de Mejora |
| :--- | :--- | :--- | :--- | :--- |
| `adminController.js` | `server/controllers/adminController.js` | 14 | La función `parseLocalDate` está definida en el cuerpo del controlador pero no es utilizada ni exportada. | Eliminar la función `parseLocalDate` ya que es código muerto. |
| `visitRequestController.js` | `server/controllers/visitRequestController.js` | 15 | La función helper `buildAppointmentPayloadFromVisit` está declarada pero no se usa en ninguna parte del archivo. | Remover la función ya que la sincronización de citas se maneja con `syncAppointmentForVisit`. |
| `visitRequestController.js` | `server/controllers/visitRequestController.js` | 53 | La función `populateAppointment` está completamente definida pero sin llamadas activas dentro del controlador. | Eliminar `populateAppointment` para mantener el controlador limpio. |

### 2. Lógica o Estructuras Duplicadas

| Controladores / Archivos | Rutas Exactas | Hallazgo | Sugerencia de Mejora |
| :--- | :--- | :--- | :--- |
| `visitRequestController.js` y `adminController.js` | `server/controllers/*` | Doble definición del pipeline de agregación para consultas y normalización de visitas/propiedades con `.populate('propertyId')` repetido de forma redundante. | Definir un método estático o helper de consulta en el modelo `visitRequest.js` para retornar datos normalizados de forma homogénea. |
| Manejo de Socket.IO | `server/controllers/visitRequestController.js` y `server/controllers/adminController.js` | Extracción manual y repetitiva del servidor Socket en cada método mediante `req.app.get('io')` seguido de condicionales idénticos. | Implementar un middleware o helper de notificaciones socket para modularizar las emisiones (ej. `emitToRooms(io, rooms, event, data)`). |

### 3. Archivos o Controladores Complejos (Más de 300 líneas)

| Archivo | Ruta Exacta | Líneas | Motivo de Complejidad | Sugerencia de Rediseño / División |
| :--- | :--- | :--- | :--- | :--- |
| `visitRequestController.js` | `server/controllers/visitRequestController.js` | 664 | Concentra toda la lógica del flujo de visitas: creación, asignaciones, cancelaciones, notas de seguimiento, y sincronización con citas/calendario. | Dividir en dos controladores más pequeños: `visitRequestController.js` (para la solicitud/flujo inicial) y `visitAppointmentController.js` (para la agenda/citas confirmadas). |
| `propertyController.js` | `server/controllers/propertyController.js` | ~600 | Maneja la creación, filtros avanzados, búsquedas geográficas, subida de archivos y actualización de estados de propiedades. | Mudar los filtros de búsqueda y agregaciones complejas a un servicio de consultas dedicado (`services/propertyQueryService.js`). |
| `adminController.js` | `server/controllers/adminController.js` | 568 | Agrupa la administración de usuarios, asesores, y la generación de complejas agregaciones estadísticas de rendimiento mensual y por sector. | Extraer las estadísticas agregadas a un servicio de reportes independiente (`services/dashboardStatsService.js`). |
