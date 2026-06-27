# Puma Real Estate

Puma Real Estate es un sistema web de gestión inmobiliaria desarrollado con MERN para centralizar inventario, usuarios, propiedades y solicitudes de visita. El objetivo del proyecto es reemplazar procesos manuales por una plataforma web que organice la información en tiempo real y facilite el trabajo de administración, ventas y seguimiento de visitas.

---

## Descripción general

La aplicación permite consultar un catálogo público de propiedades, ver el detalle de cada inmueble, enviar solicitudes de visita y administrar la información desde paneles privados para administradores y agentes. El frontend consume una API REST construida en Node.js y Express, mientras que la persistencia se realiza en MongoDB Atlas con Mongoose. El sistema también integra Firebase Storage para multimedia y Socket.IO para eventos en tiempo real.

---

## Arquitectura general

El proyecto tiene una arquitectura modular con separación por responsabilidades:

- **Presentación:** `client`, construida con React, Vite y Tailwind CSS.
- **Negocio:** `server/controllers`, donde se procesa la lógica de autenticación, propiedades, solicitudes y administración.
- **Persistencia:** `server/models`, donde están los esquemas de Mongoose.
- **Base de datos:** MongoDB Atlas.

Además, el backend usa `routes` para exponer endpoints, `middleware` para autenticación/autorización, `config` para la conexión a base de datos y `socket.io` para notificaciones en tiempo real.

### Rutas principales del frontend

- Públicas: `/inicio`, `/propiedades`, `/propiedades/:id`, `/nosotros`, `/contacto`, `/login`
- Administrador: `/admin`, `/admin/visitas`, `/admin/agentes`, `/admin/propiedades`, `/admin/nueva-propiedad`
- Agente: `/agente`, `/agente/inventario`, `/agente/solicitudes`, `/agente/agenda`, `/agente/nueva-propiedad`

### Componentes relevantes

- `PropertyCatalog`
- `PropertyDetail`
- `VisitRequestForm`
- `VisitDetailModal`
- `MultimediaUploader`
- `LoginLuxury`
- `ProtectedRoute`
- `RoleGuard`
- `PublicLayout`
- `AdminLayout`
- `AgentLayout`

---

## Tecnologías, versiones y dependencias

Las versiones listadas corresponden a los `package.json` actuales.

### Frontend

- React `^19.2.5`
- React DOM `^19.2.5`
- Vite `^8.0.10`
- Tailwind CSS `^3.4.17`
- Axios `^1.16.1`
- Firebase `^12.14.0`
- Firebase Admin `^12.7.0`
- React Router DOM `^7.16.0`
- Socket.IO Client `^4.8.3`

### Backend

- Node.js
- Express `^5.2.1`
- Mongoose `^9.6.2`
- MongoDB Atlas
- JWT `^9.0.3`
- dotenv `^17.4.2`
- cors `^2.8.6`
- helmet `^8.1.0`
- morgan `^1.10.1`
- Socket.IO `^4.8.3`
- bcrypt `^6.0.0`
- bcryptjs `^3.0.3`
- Firebase Admin `^12.7.0`

---

## Requisitos previos

Antes de ejecutar el proyecto en una computadora nueva, verifica lo siguiente:

| Herramienta / servicio | Uso |
|---|---|
| Git | Clonar el repositorio |
| Node.js 18 o superior | Ejecutar frontend y backend |
| npm | Instalar dependencias y scripts |
| MongoDB Atlas | Base de datos en la nube |
| Firebase Project | Storage y credenciales de administración |
| Navegador web actual | Probar la interfaz |
| MongoDB Compass, opcional | Revisar documentos visualmente |

---

## Estructura principal

```text
./
  client/
    src/
      api/
      assets/
      components/
      context/
      hooks/
      layouts/
      pages/
      utils/
  server/
    config/
    controllers/
    middleware/
    models/
    routes/
    scripts/
  modelado-datos/
  tesis-docs/
  README.md
```

---

## Variables de entorno

### `server/.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/PumaRealEstate?retryWrites=true&w=majority
# Opcional si la red bloquea SRV/DNS
# MONGO_URI_DIRECT=mongodb://<usuario>:<password>@host1:27017,host2:27017,host3:27017/PumaRealEstate?replicaSet=<replicaSet>&authSource=admin&retryWrites=true&w=majority
JWT_SECRET=clave_secreta_para_desarrollo
FIREBASE_SERVICE_ACCOUNT_BASE64=base64_del_json_de_service_account
FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
```

### `client/.env.local`

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Cómo generar `FIREBASE_SERVICE_ACCOUNT_BASE64`

1. Descarga el archivo JSON de la cuenta de servicio desde Firebase o Google Cloud.
2. Codifícalo en Base64.

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("ruta\al\service-account.json"))
```

macOS o Linux:

```bash
base64 -w 0 service-account.json
```

### Nota sobre MongoDB Atlas

Si `mongodb+srv://` falla por DNS o por restricciones de red, usa `MONGO_URI_DIRECT`. El backend y el script de seed priorizan esa variable cuando existe.

---

## Instalación y ejecución en un entorno limpio

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jennifer-Balseca/puma-real-estate.git
cd puma-real-estate
```

### 2. Crear los archivos de entorno

1. Crea `server/.env` con las variables del bloque anterior.
2. Crea `client/.env.local` si quieres dejar explícitas las variables del frontend.

### 3. Instalar dependencias

Instala backend y frontend por separado:

```bash
cd server
npm install

cd ../client
npm install
```

### 4. Inicializar datos base

El proyecto incluye un seed para crear usuarios iniciales de prueba. Ejecuta esto desde `server`:

```bash
npm run seed
```

Credenciales creadas por defecto:

- Admin: `admin@pumarealestate.com` / `12345`
- Agente: `agente@pumarealestate.com` / `agente123`

El seed no crea propiedades ni solicitudes de visita.

### 5. Levantar el backend

Desde la carpeta `server`:

```bash
npm run dev
```

Producción local:

```bash
npm start
```

### 6. Levantar el frontend

Desde la carpeta `client`:

```bash
npm run dev
```

### 7. Verificar que todo funcione

Backend:

```bash
curl http://localhost:5000
curl http://localhost:5000/health
```

En PowerShell:

```powershell
Invoke-WebRequest http://localhost:5000 -UseBasicParsing
Invoke-RestMethod http://localhost:5000/health
```

Frontend:

```text
http://localhost:5173
```

---

## Scripts disponibles

### `server/package.json`

- `npm start`: ejecuta `node index.js`
- `npm run dev`: ejecuta `node --watch index.js`
- `npm run seed`: crea usuarios base de prueba

### `client/package.json`

- `npm run dev`: inicia Vite en modo desarrollo
- `npm run build`: genera la versión de producción
- `npm run preview`: previsualiza la build
- `npm run lint`: ejecuta ESLint

---

## Backend, APIs y puertos

### Puertos

- Frontend Vite: `5173`
- Backend API: `5000` o el valor definido en `PORT`

### Endpoints principales

- `GET /` respuesta básica de estado.
- `GET /health` estado de conexión con MongoDB.
- `POST /api/auth/login` inicio de sesión.
- `GET /api/auth/me` sesión actual autenticada.
- `GET /api/properties` listado público de propiedades.
- `GET /api/properties/:id` detalle de una propiedad.
- `GET /api/properties/my-properties` propiedades del usuario autenticado.
- `POST /api/properties` crear propiedad.
- `PUT /api/properties/:id` actualizar propiedad.
- `DELETE /api/properties/:id` eliminar propiedad.
- `POST /api/properties/:id/media` agregar multimedia.
- `DELETE /api/properties/:id/media` quitar multimedia.
- `GET /api/visits` listar solicitudes autenticadas.
- `GET /api/visits/:id` obtener una solicitud.
- `POST /api/visits` crear solicitud pública.
- `POST /api/visits/:id/assign` asignar agente.
- `POST /api/visits/:id/accept` aceptar solicitud.
- `PATCH /api/visits/:id/status` actualizar estado de visita.
- `PATCH /api/visits/:id/property-status` actualizar estado de la propiedad asociada.
- `GET /api/admin/users` listar usuarios.
- `GET /api/admin/agents` listar agentes activos.
- `POST /api/admin/users/register` registrar agente.
- `POST /api/admin/users` registrar agente.
- `PATCH /api/admin/users/:id` actualizar agente.
- `PATCH /api/admin/users/:id/status` activar o desactivar usuario.

### Eventos Socket.IO

- `visit:created`
- `visit:assigned`
- `visit:accepted`
- `visit:statusUpdated`
- `property:statusUpdated`

---

## Base de datos y configuración

El proyecto usa MongoDB Atlas con Mongoose. Los modelos activos del flujo principal son:

- **User:** nombre, email, password, role y status.
- **Property:** título, descripción, tipo, modalidad, estado, precio, ubicación, características, imágenes, `mediaUrls`, `storagePaths`, `createdBy` y `agente`.
- **VisitRequest:** `propertyId`, `fullName`, `phone`, `email`, `preferredDate`, `timeSlot`, `message`, `status`, `assignedAgentId` y `createdBy`.

Relaciones principales:

- `Property.createdBy` referencia a `User._id`.
- `Property.agente` referencia a `User._id`.
- `VisitRequest.propertyId` referencia a `Property._id`.
- `VisitRequest.assignedAgentId` referencia a `User._id`.

Nota: existe un modelo legado llamado `Appointment.js`, pero el flujo activo usa `VisitRequest`.

---

## Pruebas y verificación

El proyecto no incluye una suite automatizada completa todavía. Para validar el sistema en una instalación nueva, se recomienda:

1. Confirmar que MongoDB Atlas responde desde `server` con `npm run dev`.
2. Ejecutar `npm run seed` para crear usuarios iniciales.
3. Verificar `GET /health` en `http://localhost:5000/health`.
4. Abrir `http://localhost:5173` y comprobar inicio de sesión, catálogo y envío de solicitudes.
5. Revisar que el frontend pueda comunicarse con la API usando `VITE_API_URL`.

---

## Estado actual del proyecto

El proyecto está funcional en su flujo principal:

- frontend público en React,
- autenticación por JWT,
- paneles para administrador y agente,
- propiedades con multimedia,
- solicitudes de visita,
- persistencia en MongoDB Atlas,
- eventos en tiempo real con Socket.IO.

Pendientes o mejoras futuras:

- ampliar pruebas automatizadas,
- completar más validaciones de negocio,
- seguir refinando el flujo multimedia y administrativo.

---

## Seguridad y buenas prácticas

- No subas `server/.env` ni `client/.env.local` al repositorio.
- Protege las credenciales de MongoDB, Firebase y JWT.
- Usa `npm ci` en despliegues reproducibles cuando exista `package-lock.json`.

---

## Licencia

Proyecto académico. Puede utilizarse licencia MIT si se desea.

### Diagrama del modelo de datos
- [modelado-datos/diagrama_modelado_datos.svg](modelado-datos/diagrama_modelado_datos.svg)

---

## Endpoints principales

### Backend
- `GET /` respuesta básica de estado.
- `GET /health` estado de conexión con MongoDB.
- `POST /api/auth/login` inicio de sesión.
- `GET /api/auth/me` sesión actual.
- `GET /api/properties` listado público de propiedades.
- `GET /api/properties/:id` detalle de una propiedad.
- `GET /api/properties/my-properties` propiedades del usuario autenticado.
- `POST /api/properties` crear propiedad.
- `PUT /api/properties/:id` actualizar propiedad.
- `DELETE /api/properties/:id` eliminar propiedad.
- `POST /api/properties/:id/media` agregar multimedia.
- `DELETE /api/properties/:id/media` quitar multimedia.
- `GET /api/visits` listar solicitudes.
- `GET /api/visits/:id` obtener solicitud.
- `POST /api/visits` crear solicitud pública.
- `POST /api/visits/:id/assign` asignar agente.
- `POST /api/visits/:id/accept` aceptar solicitud.
- `PATCH /api/visits/:id/status` actualizar estado de visita.
- `PATCH /api/visits/:id/property-status` actualizar estado de la propiedad asociada.
- `GET /api/admin/users` listar usuarios.
- `GET /api/admin/agents` listar agentes activos.
- `POST /api/admin/users/register` registrar agente.
- `PATCH /api/admin/users/:id` actualizar agente.
- `PATCH /api/admin/users/:id/status` activar o desactivar usuario.

### Eventos en tiempo real
El backend emite eventos por Socket.IO cuando cambian las visitas o el estado de una propiedad:
- `visit:created`
- `visit:assigned`
- `visit:accepted`
- `visit:statusUpdated`
- `property:statusUpdated`

---

## Datos de prueba
El script de seed crea solo usuarios base para pruebas de acceso; no genera propiedades ni solicitudes.

```bash
cd server
npm run seed
```

Credenciales que crea por defecto:
- **Admin:** `admin@pumarealestate.com` / `12345`
- **Agente:** `agente@pumarealestate.com` / `agente123`

El script no duplica registros si ya existen.

---

## Pruebas de conexión
Para validar rápidamente la conexión a MongoDB:

```bash
cd server
node test-connect.js
```

También puedes pasar la URI directamente:

```bash
node test-connect.js "mongodb+srv://..."
```

---

## Estado actual del proyecto
El proyecto está funcional en su flujo principal:
- frontend público en React,
- autenticación por JWT,
- paneles para administrador y agente,
- propiedades con multimedia,
- solicitudes de visita,
- persistencia en MongoDB Atlas,
- eventos en tiempo real con Socket.IO.

Pendientes o futuros avances:
- ampliar pruebas automatizadas,
- completar más validaciones de negocio,
- seguir refinando el flujo multimedia y administrativo.

---

## Seguridad y buenas prácticas
- No subas `server/.env` ni `client/.env.local` al repositorio.
- Mantén seguras las credenciales de MongoDB, Firebase y JWT.
- Usa `npm ci` en despliegues reproducibles cuando exista `package-lock.json`.

---

## Licencia
Proyecto académico. Puede utilizarse licencia MIT si se desea.

---

