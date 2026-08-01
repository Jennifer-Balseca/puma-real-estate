# Informacion del Proyecto — Material de Referencia para Actividad 8

> **Proposito:** Fuente de verdad tecnica extraida directamente del codigo del repositorio `puma-real-estate`.
> **Uso:** Referencia al redactar cada capitulo del documento de titulacion. NO es el documento de tesis.
> **Fecha de extraccion:** 2026-07-31
> **Nota:** Donde el codigo no contiene la informacion, se indica con `[NO ENCONTRADO EN EL CODIGO]`.

---

## 1. Inventario General del Repositorio

### Arbol de Carpetas Principal

```text
puma-real-estate/
+-- client/                          -> Aplicacion React (frontend publico + paneles privados)
|   +-- src/
|   |   +-- api/                     -> Instancia Axios + servicios HTTP del cliente
|   |   +-- assets/                  -> Recursos estaticos
|   |   +-- components/              -> Componentes reutilizables de UI
|   |   +-- context/                 -> Contextos React (AuthContext, PropertyFiltersContext)
|   |   +-- hooks/                   -> Custom hooks (usePropertiesRefresh)
|   |   +-- layouts/                 -> Layouts de ruta (AdminLayout, AgentLayout, PublicLayout)
|   |   +-- pages/                   -> Vistas de pagina completa
|   |   +-- utils/                   -> Utilidades JS (propertyEvents)
|   |   +-- App.jsx                  -> Definicion de todas las rutas React Router
|   |   +-- firebase.js              -> Configuracion Firebase SDK (cliente)
|   |   +-- socket.js                -> Instancia Socket.IO-client singleton
|   |   +-- main.jsx                 -> Punto de entrada React + BrowserRouter
|   +-- firebase.storage.rules       -> Reglas de seguridad de Firebase Storage
|   +-- tailwind.config.js           -> Configuracion Tailwind CSS
|   +-- vite.config.js               -> Configuracion Vite
|   +-- index.html                   -> HTML raiz de Vite
|   +-- package.json                 -> Dependencias y scripts del frontend
|
+-- server/                          -> API REST + WebSocket (backend Node.js/Express)
|   +-- config/db.js                 -> Conexion a MongoDB con Mongoose
|   +-- controllers/
|   |   +-- authController.js        -> Logica de autenticacion JWT
|   |   +-- propertyController.js    -> CRUD de propiedades + multimedia Firebase
|   |   +-- visitRequestController.js -> CRUD solicitudes de visita + eventos WS
|   |   +-- adminController.js       -> Gestion de usuarios, dashboard estadisticas
|   +-- middleware/
|   |   +-- authMiddleware.js        -> Verificacion JWT + control de rol
|   |   +-- authorizeProperty.js     -> Autorizacion de acceso a propiedad por dueno/admin
|   +-- models/
|   |   +-- User.js                  -> Esquema de usuarios (Admin/Agente)
|   |   +-- Property.js              -> Esquema de propiedades inmobiliarias
|   |   +-- visitRequest.js          -> Esquema de solicitudes de visita (flujo principal)
|   |   +-- Appointment.js           -> Esquema de citas (sincronizado con VisitRequest)
|   +-- routes/
|   |   +-- authRoutes.js            -> /api/auth/*
|   |   +-- propertyRoutes.js        -> /api/properties/*
|   |   +-- visitRequests.js         -> /api/visits/*
|   |   +-- adminRoutes.js           -> /api/admin/*
|   +-- scripts/seed.js              -> Script de datos iniciales (crea Admin y Agente)
|   +-- services/reminderCron.js     -> Cron job de recordatorios via Socket.IO
|   +-- firebaseAdmin.js             -> Inicializacion Firebase Admin SDK (bucket Storage)
|   +-- index.js                     -> Entrada del servidor: Express + Socket.IO + rutas
|   +-- check-visits.js              -> Script diagnostico: consulta solicitudes en BD
|   +-- test-connect.js              -> Script diagnostico: prueba conexion MongoDB
|   +-- package.json
|
+-- modelado-datos/
|   +-- Diagrama_Modelado_Datos_MongoDB.png  -> Diagrama visual del modelo de datos
|
+-- tesis-docs/                      -> Documentacion de tesis
|   +-- TESIS.docx                   -> Documento Word de la tesis (1.2 MB)
|   +-- arquitectura.md              -> Arquitectura del sistema (~7 KB)
|   +-- auditoria_codigo.md          -> Auditoria del codigo (~7.8 KB)
|   +-- diagrama_modelado_datos.md   -> Descripcion del modelo de datos (~4.9 KB)
|   +-- diagramas_cu_extendidos.md   -> Casos de uso extendidos (~51 KB)
|   +-- documentaciontesis.md        -> Documentacion narrativa (~21 KB)
|   +-- informe_flujos_alternos.md   -> Flujos alternos de CU (~30 KB)
|   +-- informe_seguridad_flujos.md  -> Analisis de seguridad (~9.3 KB)
|   +-- reglas_negocio.md            -> Reglas de negocio (~5.6 KB)
|   +-- plan_tesis.md                -> Plan general de tesis
|   +-- manual_estilo.md             -> Manual de estilo del documento
|   +-- tesis.txt                    -> Texto de tesis en plano (~47 KB)
|   +-- Celular_Design_PumaRealEstate/  -> Disenos UI movil
|   +-- Desktop_Design_PumaRealEstate/ -> Disenos UI escritorio
|
+-- cors.js                          -> Config CORS para Firebase Storage (no middleware Express)
+-- README.md                        -> Documentacion principal del proyecto
```

---

### Dependencias — client/package.json

**Produccion (dependencies)**

| Paquete | Version |
|---|---|
| axios | ^1.16.1 |
| firebase | ^12.14.0 |
| firebase-admin | ^12.7.0 |
| react | ^19.2.5 |
| react-dom | ^19.2.5 |
| react-icons | ^5.6.0 |
| react-router-dom | ^7.16.0 |
| socket.io-client | ^4.8.3 |

**Desarrollo (devDependencies)**

| Paquete | Version |
|---|---|
| @eslint/js | ^10.0.1 |
| @types/react | ^19.2.14 |
| @vitejs/plugin-react | ^6.0.1 |
| autoprefixer | ^10.5.0 |
| eslint | ^10.2.1 |
| eslint-plugin-react-hooks | ^7.1.1 |
| postcss | ^8.5.15 |
| tailwindcss | ^3.4.17 |
| vite | ^8.0.10 |

---

### Dependencias — server/package.json (produccion)

| Paquete | Version | Uso |
|---|---|---|
| bcrypt | ^6.0.0 | Hash de contrasenas (declarado) |
| bcryptjs | ^3.0.3 | Hash de contrasenas (usado en codigo) |
| cors | ^2.8.6 | Middleware CORS para Express |
| dotenv | ^17.4.2 | Variables de entorno desde .env |
| express | ^5.2.1 | Framework HTTP |
| express-rate-limit | ^8.6.1 | Limitador de tasa (login, visitas) |
| firebase-admin | ^12.7.0 | SDK Admin de Firebase Storage |
| helmet | ^8.1.0 | Headers de seguridad HTTP |
| jsonwebtoken | ^9.0.3 | Generacion/verificacion JWT |
| mongoose | ^9.6.2 | ODM para MongoDB |
| morgan | ^1.10.1 | Logger de peticiones HTTP |
| node-cron | ^4.6.0 | Programacion de tareas cron |
| socket.io | ^4.8.3 | WebSocket en tiempo real |

> **INCONSISTENCIA:** helmet y morgan estan instalados pero no se invocan en server/index.js. Verificar si estan pendientes de integrar.

---

## 2. Arquitectura y Stack Tecnologico

### Stack Real Confirmado en Codigo

| Tecnologia | Version | Evidencia en codigo |
|---|---|---|
| React | ^19.2.5 | client/src/main.jsx, todos los .jsx |
| Vite | ^8.0.10 | client/vite.config.js |
| Tailwind CSS | ^3.4.17 | client/tailwind.config.js, clases JSX |
| React Router DOM | ^7.16.0 | client/src/App.jsx — Routes, Route |
| Axios | ^1.16.1 | client/src/api/axios.js con interceptors |
| Socket.IO cliente | ^4.8.3 | client/src/socket.js — io(URL) |
| Firebase SDK cliente | ^12.14.0 | client/src/firebase.js — getStorage() |
| Node.js | >=18 recomendado | server/index.js (CommonJS, require) |
| Express | ^5.2.1 | server/index.js — express() |
| Mongoose | ^9.6.2 | server/config/db.js — mongoose.connect() |
| MongoDB Atlas | cloud | URI en server/.env |
| Socket.IO servidor | ^4.8.3 | server/index.js — new Server(httpServer) |
| Firebase Admin | ^12.7.0 | server/firebaseAdmin.js — admin.initializeApp() |
| node-cron | ^4.6.0 | server/services/reminderCron.js |
| JWT | ^9.0.3 | server/middleware/authMiddleware.js |
| bcryptjs | ^3.0.3 | server/controllers/authController.js |
| express-rate-limit | ^8.6.1 | authRoutes.js, visitRequests.js |

### Patron Arquitectonico: Capas (Layered Architecture)

```text
Cliente HTTP/WS -> Routes -> Middleware -> Controllers -> Models (Mongoose) -> MongoDB Atlas
                                               |
                                      Firebase Admin SDK (Storage)
                                               |
                                      Socket.IO (io: emitir eventos)
                                               |
                                      node-cron (reminderCron.js)
```

### Flujo 1: Crear Propiedad

```text
POST /api/properties
  -> propertyRoutes.js (router.post /)
  -> authMiddleware (verifica JWT, inyecta req.user)
  -> createProperty() [propertyController.js L.150]
      -> canManageProperty(req.user.role) — valida rol Agente/Admin
      -> Validaciones: titulo, precio, ubicacion, tipo, modalidad, descripcion
      -> buildCharacteristics(caracteristicas) — parsea y valida sub-objeto
      -> Property.create({...})
      -> Property.findById(id).populate('agente').populate('createdBy')
  -> Response 201 JSON { message, property }
```

### Flujo 2: Crear Solicitud de Visita (publica, sin JWT)

```text
POST /api/visits
  -> visitRequests.js (router.post /)
  -> visitRateLimiter (max 5 por IP/hora)
  -> createVisitRequest() [visitRequestController.js L.144]
      -> Validaciones: propertyId, fullName, phone (10 digitos), email, preferredDate, timeSlot, requestKey
      -> VisitRequest.findOne({ requestKey }) — idempotencia
      -> VisitRequest.findOne({ email, propertyId, status in [pending,in-process] }) — sin duplicados activos
      -> Property.findById(propertyId) — valida estado === Disponible
      -> VisitRequest.create({...})
      -> io.emit('visit:created', { visit })
      -> io.to('admin').emit('notification:new', {...})
      -> io.to('agent').emit('notification:new', {...})
  -> Response 201 JSON { visit }
```

---

## 3. Modelos de Datos

### 3.1 User — server/models/User.js

```javascript
const userSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String, required: true,
        enum: ['Admin', 'Agente'], default: 'Agente', alias: 'rol'
    },
    status: {
        type: String, required: true,
        enum: ['Activo', 'Inactivo'], default: 'Activo', alias: 'estado'
    }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);
```

| Campo | Tipo | Req | Unico | Notas |
|---|---|---|---|---|
| name | String | No | No | trim |
| email | String | Si | Si | lowercase, trim |
| password | String | Si | No | select:false — no retornado por defecto |
| role | String | Si | No | enum: Admin/Agente; default Agente; alias: rol |
| status | String | Si | No | enum: Activo/Inactivo; default Activo; alias: estado |
| createdAt/updatedAt | Date | auto | — | Mongoose timestamps |

Indice: email (unique implicito)
Referenciado por: Property.createdBy, Property.agente, VisitRequest.assignedAgentId,
                  VisitRequest.createdBy, VisitRequest.followUpNotes[].createdBy, Appointment.agenteResponsable

---

### 3.2 Property — server/models/Property.js

```javascript
const propertySchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    tipo: { type: String, required: true, enum: ['Casa','Departamento','Terreno','Oficina'] },
    modalidad: { type: String, required: true, enum: ['Venta','Alquiler'] },
    estado: { type: String, default: 'Disponible', enum: ['Disponible','Vendida','Alquilada'] },
    precio: { type: Number, required: true, min: 0 },
    ubicacion: {
        direccion: { type: String, required: true },
        ciudad: { type: String, default: 'Quito' },
        sector: { type: String }
    },
    caracteristicas: {
        habitaciones: { type: Number },
        banos: { type: Number },
        areaMetros: { type: Number },
        parqueadero: { type: Boolean, default: false },
        amenidades: [{ type: String }]
    },
    imagenes: [{ type: String }],
    mediaUrls: [{ type: String }],
    storagePaths: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agente: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Property', propertySchema);
```

| Campo | Tipo | Req | Notas |
|---|---|---|---|
| titulo | String | Si | trim |
| descripcion | String | Si | — |
| tipo | String | Si | enum: Casa/Departamento/Terreno/Oficina |
| modalidad | String | Si | enum: Venta/Alquiler |
| estado | String | No | enum: Disponible/Vendida/Alquilada; default Disponible |
| precio | Number | Si | min: 0 |
| ubicacion.direccion | String | Si | sub-documento |
| ubicacion.ciudad | String | No | default: Quito |
| ubicacion.sector | String | No | para estadisticas de zonas |
| caracteristicas.habitaciones | Number | No | — |
| caracteristicas.banos | Number | No | — |
| caracteristicas.areaMetros | Number | No | — |
| caracteristicas.parqueadero | Boolean | No | default: false |
| caracteristicas.amenidades | [String] | No | — |
| imagenes | [String] | No | URLs historicas + Firebase |
| mediaUrls | [String] | No | URLs de Firebase Storage |
| storagePaths | [String] | No | Rutas internas del bucket para eliminar fisicamente |
| createdBy | ObjectId | Si | ref: User |
| agente | ObjectId | No | ref: User |
| createdAt/updatedAt | Date | auto | Mongoose timestamps |

---

### 3.3 VisitRequest — server/models/visitRequest.js

```javascript
const visitRequestSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  preferredDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  message: { type: String, default: '' },
  requestKey: { type: String, required: false, trim: true },
  followUpNotes: [{
    note: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['pending','in-process','finished','cancelled'], default: 'pending' },
  assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });
visitRequestSchema.index({ requestKey: 1 }, { unique: true, sparse: true });
module.exports = mongoose.model('VisitRequest', visitRequestSchema);
```

| Campo | Tipo | Req | Notas |
|---|---|---|---|
| propertyId | ObjectId | Si | ref: Property |
| fullName | String | Si | Nombre del cliente |
| phone | String | Si | Exactamente 10 digitos (validado en controller) |
| email | String | Si | lowercase |
| preferredDate | Date | Si | Fecha deseada de visita |
| timeSlot | String | Si | Franja horaria, ej: 09:00 |
| message | String | No | default '' |
| requestKey | String | No | Clave idempotente; indice unique sparse |
| followUpNotes[].note | String | Si | Texto de la nota |
| followUpNotes[].createdBy | ObjectId | No | ref: User |
| followUpNotes[].createdAt | Date | No | default: Date.now |
| status | String | No | enum: pending/in-process/finished/cancelled; default: pending |
| assignedAgentId | ObjectId | No | ref: User |
| createdBy | ObjectId | No | ref: User (null si solicitud publica) |
| createdAt/updatedAt | Date | auto | Mongoose timestamps |

Indice: requestKey (unique, sparse — permite multiples null)

Diagrama de estados:
```
pending -> in-process -> finished
   |            |
   +-------cancelled
```

---

### 3.4 Appointment — server/models/Appointment.js (Modelo Sincronizado)

> Appointment se crea/actualiza automaticamente via syncAppointmentForVisit() en visitRequestController.js
> cuando VisitRequest transiciona a in-process o finished. No se gestiona directamente por el frontend.

```javascript
const appointmentSchema = new mongoose.Schema({
    visitRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'VisitRequest', default: null },
    propiedad: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    clienteNombre: { type: String, required: true },
    clienteEmail: { type: String, required: true },
    clienteTelefono: { type: String, required: true },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    mensaje: { type: String },
    estado: { type: String, default: 'Pendiente', enum: ['Pendiente','Confirmada','Completada','Cancelada'] },
    agenteResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
module.exports = mongoose.model('Appointment', appointmentSchema);
```

Mapeo de estados VisitRequest -> Appointment:
- in-process -> Confirmada
- finished -> Completada
- cancelled -> Cancelada
- pending -> elimina el Appointment existente

---

## 4. Rutas y Endpoints de la API

### 4.1 Autenticacion — /api/auth (server/routes/authRoutes.js)

| Metodo | Path | Controlador | Middleware | Descripcion |
|---|---|---|---|---|
| POST | /login | login | loginRateLimiter (5/15min) | Autentica usuario; devuelve JWT + datos |
| GET | /me | me | authMiddleware | Retorna usuario autenticado actual |
| POST | /change-password | changePassword | authMiddleware | Cambia contrasena del usuario autenticado |

Rate limit login: 5 intentos en ventana de 15 minutos; responde 429 con mensaje.

---

### 4.2 Propiedades — /api/properties (server/routes/propertyRoutes.js)

| Metodo | Path | Controlador | Middleware | Descripcion |
|---|---|---|---|---|
| GET | / | listProperties | publico | Lista propiedades; Admin ve todas; Agente solo las suyas |
| GET | /my-properties | listMyProperties | authMiddleware | Propiedades del usuario autenticado |
| GET | /:id | getPropertyById | publico | Detalle de una propiedad |
| POST | / | createProperty | authMiddleware | Crea nueva propiedad |
| POST | /:id/media | addPropertyMedia | authMiddleware, authorizeProperty | Anade URL multimedia Firebase |
| DELETE | /:id/media | removePropertyMedia | authMiddleware, authorizeProperty | Elimina multimedia del bucket y doc |
| PUT | /:id | updateProperty | authMiddleware, authorizeProperty | Actualiza campos de propiedad |
| DELETE | /:id | deleteProperty | authMiddleware, authorizeProperty | Elimina propiedad y archivos de Storage |

authorizeProperty: verifica que el usuario sea createdBy, agente, o Admin.

---

### 4.3 Solicitudes de Visita — /api/visits (server/routes/visitRequests.js)

| Metodo | Path | Controlador | Middleware | Descripcion |
|---|---|---|---|---|
| GET | / | listVisitRequests | authMiddleware | Lista con filtros: tab, status, assigned, agentId |
| GET | /:id | getVisitRequest | authMiddleware | Detalle de una solicitud |
| POST | / | createVisitRequest | visitRateLimiter (5/hora) | Crea solicitud publica (SIN JWT) |
| POST | /:id/assign | assignAgent | authMiddleware, requireAdmin | Admin asigna agente; verifica conflicto de agenda |
| POST | /:id/accept | agentAccept | authMiddleware | Agente acepta solicitud pendiente |
| PATCH | /:id | agentAccept | authMiddleware | Alias PATCH de accept |
| POST | /:id/confirm | confirmVisitRequest | authMiddleware, requireAdmin | Admin confirma y genera Appointment |
| POST | /:id/cancel | cancelVisitRequest | authMiddleware | Cancela visita (Admin o agente asignado) |
| POST | /:id/notes | addFollowUpNote | authMiddleware | Anade nota de seguimiento |
| PATCH | /:id/status | updateVisitStatus | authMiddleware | Actualiza estado de la visita |
| PATCH | /:id/property-status | agentUpdatePropertyStatus | authMiddleware | Agente actualiza estado de la propiedad |

---

### 4.4 Administracion — /api/admin (server/routes/adminRoutes.js)

Middleware global: authMiddleware (en index.js) + requireAdmin (router.use en adminRoutes.js)

| Metodo | Path | Controlador | Descripcion |
|---|---|---|---|
| GET | /users | listUsers | Lista usuarios; filtra por role/status |
| GET | /agents | getActiveAgents | Agentes activos; con date+timeSlot marca isBusy |
| GET | /dashboard-stats | getDashboardStats | Estadisticas: conteos, historial leads, sectores, agentes, propiedades |
| POST | /users/register | registerAgent | Registra nuevo usuario/agente |
| POST | /users | registerAgent | Alias del anterior |
| PATCH | /users/:id | updateAgent | Actualiza datos de agente |
| PATCH | /users/:id/status | deactivateUser | Desactiva agente (status -> Inactivo) |
| POST | /users/:id/reset-password | resetAgentPassword | Genera contrasena provisional y devuelve en texto |

---

### 4.5 Estado del Servidor (server/index.js)

| Metodo | Path | Descripcion |
|---|---|---|
| GET | / | Texto de confirmacion que la API funciona |
| GET | /health | JSON con estado MongoDB: connected, host, name, readyState |

---

## 5. Logica de Negocio Clave

### 5.1 server/controllers/authController.js

Exporta: login, me, changePassword

| Funcion | Entrada | Salida | Descripcion |
|---|---|---|---|
| sanitizeUser(user) | doc User | obj plano | Elimina password y __v |
| createToken(user) | doc User | JWT string | Firma {id, email, role, status} con JWT_SECRET; expira en 7d |
| login(req, res) | body: {email, password} | {token, user} | Valida rol, status Activo, bcrypt.compare; devuelve JWT |
| me(req, res) | JWT header | {user} | Busca User por req.user.id |
| changePassword(req, res) | body: {currentPassword, newPassword} | {message} | Valida actual, hashea nueva, guarda |

---

### 5.2 server/controllers/propertyController.js

Exporta: createProperty, listProperties, listMyProperties, updateProperty, deleteProperty, addPropertyMedia, removePropertyMedia, getPropertyById

| Funcion | Descripcion |
|---|---|
| buildCharacteristics(obj) | Parsea y valida sub-objeto caracteristicas; retorna {value} o {error} |
| canManageProperty(role) | true si rol es agente o admin |
| buildPropertyFilter(req) | Admin: sin filtro; Agente: solo createdBy o agente === req.user.id |
| listProperties | .find(filter).populate(agente,createdBy).sort(createdAt desc) |
| createProperty | Valida campos; Property.create(); popula y retorna 201 |
| updateProperty | Actualiza solo campos en body; usa req.property de authorizeProperty |
| deleteProperty | Elimina archivos de Storage por storagePaths; luego Property.deleteOne() |
| addPropertyMedia | Valida URL HTTPS + host Firebase + extension imagen/video; guarda en mediaUrls/imagenes/storagePaths |
| removePropertyMedia | Acepta mediaUrls[] o mediaUrl; elimina del bucket y del doc |
| extractStoragePathFromUrl(url) | Helper: extrae path interno del bucket desde URL publica |

Flujo multimedia Firebase:
1. Frontend (MultimediaUploader.jsx) sube archivo directamente al bucket via SDK cliente
2. Frontend obtiene URL publica + storagePath
3. Frontend llama POST /api/properties/:id/media con {mediaUrl, storagePath}
4. Backend valida host (firebasestorage.googleapis.com / storage.googleapis.com) y guarda
5. Al eliminar, backend usa getBucket().file(storagePath).delete() via Firebase Admin

---

### 5.3 server/controllers/visitRequestController.js

Exporta: createVisitRequest, listVisitRequests, getVisitRequest, assignAgent, agentAccept,
         updateVisitStatus, agentUpdatePropertyStatus, cancelVisitRequest, addFollowUpNote, confirmVisitRequest

| Funcion | Descripcion |
|---|---|
| checkAgentScheduleConflict(agentId,date,slot,excludeId) | Busca VisitRequest in-process en mismo dia/horario del agente |
| syncAppointmentForVisit(visit, nextStatus) | Crea/actualiza/cancela Appointment segun estado de VisitRequest |
| normalizeVisitResponse(doc) | Anade aliases property y assignedAgent al objeto de respuesta |
| createVisitRequest | Publico; idempotente por requestKey; valida propiedad Disponible; emite visit:created y notification:new |
| listVisitRequests | Filtra por tab, status, assigned, agentId; excluye canceladas por defecto |
| assignAgent | Admin asigna; verifica conflicto de agenda; status -> in-process; emite visit:assigned + notification |
| agentAccept | Agente toma pendiente; verifica conflicto; syncAppointment; emite visit:accepted |
| updateVisitStatus | Valida permisos; syncAppointment; emite visit:statusUpdated + appointment:* |
| cancelVisitRequest | Solo Admin o agente asignado; syncAppointment(cancelled); emite visit:cancelled |
| addFollowUpNote | Anade a followUpNotes[]; solo Admin o agente asignado |
| agentUpdatePropertyStatus | Solo agente asignado; cambia property.estado; emite property:statusUpdated |
| confirmVisitRequest | Admin; genera Appointment si no existe; requiere status in-process |

---

### 5.4 server/controllers/adminController.js

Exporta: listUsers, registerAgent, updateAgent, deactivateUser, getActiveAgents, getDashboardStats, resetAgentPassword

| Funcion | Descripcion |
|---|---|
| listUsers | User.find({role?, status?}).select(-password) |
| registerAgent | Valida campos; bcrypt hash 10 rondas; User.create(); emite agent:updated |
| updateAgent | Actualiza campos individualmente; re-hashea contrasena si se envia; emite agent:updated |
| deactivateUser | Solo Agentes; status -> Inactivo; emite agent:updated |
| getActiveAgents | Agentes activos; con date+timeSlot marca isBusy via query VisitRequest |
| getDashboardStats | Conteos por status; historial leads (diario/semanal/mensual); top 5 sectores; rendimiento agentes; propiedades populares; 20 visitas recientes. Usa MongoDB aggregate. |
| resetAgentPassword | Genera contrasena provisional (Puma+4letras+2nums); bcrypt hash; devuelve texto plano; emite agent:updated |

---

### 5.5 server/middleware/authMiddleware.js

Exporta: authMiddleware, requireAdmin

authMiddleware:
1) Extrae Bearer token del header Authorization
2) jwt.verify(token, JWT_SECRET)
3) User.findById(decoded.id)
4) Verifica status Activo
5) Inyecta req.user = {id, email, role, status}

requireAdmin: Normaliza role a lowercase; si !== admin retorna 403

---

### 5.6 server/middleware/authorizeProperty.js

Exporta: authorizeProperty, getPropertyOwnerId

getPropertyOwnerId(property): Retorna property.createdBy o property.agente como fallback
authorizeProperty:
1) Valida que req.params.id sea ObjectId valido
2) Property.findById(id)
3) Admin pasa; dueno (createdBy o agente) pasa; de lo contrario 403
4) Inyecta req.property para el controller

---

### 5.7 server/check-visits.js — Script Diagnostico

Proposito: Verificacion manual de la coleccion VisitRequest en MongoDB.
Que hace: Conecta a MongoDB, cuenta documentos totales, muestra 10 mas recientes (ID, fullName, createdAt, status).
Ejecucion: node check-visits.js desde server/ (requiere .env).
Tipo: NO es prueba automatizada. Es script de diagnostico para el desarrollador.

---

### 5.8 server/services/reminderCron.js — Cron de Recordatorios

Proposito: Alertas automaticas via Socket.IO sobre visitas proximas, sin asignar o vencidas.
Inicializacion: initReminderCron(io) llamado en server/index.js durante el arranque.
Frecuencia: Cada 15 minutos — cron.schedule('*/15 * * * *', ...)
Anti-duplicados: Set en memoria sentRemindersCache con claves {visitId}-{tipo}.

| Caso | Condicion | Destinatario | Evento |
|---|---|---|---|
| Sin asignar 2+ dias | pending + null agent + creada hace 48h + visita en >2 dias | admin | notification:new |
| Urgente sin asignar | pending + null agent + preferredDate < now+24h | admin | notification:new |
| Visita vencida | status in [pending,in-process] + preferredDate < now | agente + admin | notification:new |
| Recordatorio 24h | in-process + preferredDate en prox. 24h | agente + admin | notification:new |
| Alerta urgente 2h | in-process + preferredDate en prox. 2h | agente + admin | notification:new |

---

### 5.9 server/firebaseAdmin.js — Firebase Admin SDK

```javascript
const initFirebaseAdmin = () => {
    if (!admin.apps.length) {
        const serviceAccount = JSON.parse(
            Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
        );
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
        bucket = admin.storage().bucket();
    }
    return bucket;
};
const getBucket = () => { if (!bucket) return initFirebaseAdmin(); return bucket; };
```

Credenciales del service account codificadas en Base64 en FIREBASE_SERVICE_ACCOUNT_BASE64.
getBucket() es llamado por propertyController.js para eliminar archivos del bucket.

---

### 5.10 WebSockets — Socket.IO

Inicializacion en server/index.js:
```javascript
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }
});
app.set('io', io); // accesible en controllers como req.app.get('io')

io.on('connection', (socket) => {
    socket.on('auth:join', (data) => {
        socket.join(data.userId);
        socket.join('user:' + data.userId);
        if (data.role === 'admin') socket.join('admin');
        else if (data.role === 'agente') socket.join('agent');
    });
});
```

Evento entrante (cliente -> servidor):
  auth:join | payload: {userId, role} | cliente se une a sus salas

Eventos salientes (servidor -> clientes):

| Evento | Emitido en | Destino | Payload |
|---|---|---|---|
| visit:created | createVisitRequest | global | {visit} |
| notification:new | createVisitRequest | admin, agent | nueva solicitud |
| visit:assigned | assignAgent | global | {visit} |
| notification:new | assignAgent | user:{agentId}, admin | asignacion |
| appointment:created | assignAgent, agentAccept | global | {appointment} |
| visit:accepted | agentAccept | global | {visit} |
| notification:new | agentAccept | user:{agentId}, admin | aceptacion |
| visit:statusUpdated | updateVisitStatus | global | {visit} |
| appointment:deleted | updateVisitStatus (->pending) | global | {visitRequestId} |
| visit:cancelled | cancelVisitRequest | global | {visit} |
| appointment:updated | cancelVisitRequest | global | {appointment} |
| property:statusUpdated | agentUpdatePropertyStatus | global | {propertyId, status} |
| agent:updated | register/update/deactivate | global | sin payload |
| notification:new | reminderCron.js (c/15min) | admin / user:{id} | recordatorio o alerta |

Cliente (client/src/socket.js):
```javascript
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:5000', { autoConnect: true });
export default socket;
```

---

## 6. Frontend

### Estructura de client/src/

```text
src/
+-- App.jsx              -> Router principal (todas las rutas de la app)
+-- main.jsx             -> Punto de entrada: ReactDOM.createRoot + BrowserRouter + AuthProvider
+-- firebase.js          -> Inicializa Firebase SDK; solo si vars de entorno presentes
+-- socket.js            -> Instancia Socket.IO-client singleton
+-- api/
|   +-- axios.js         -> Instancia Axios (baseURL=VITE_API_URL; interceptors: Bearer token + redirect 401)
|   +-- authService.js   -> Wrapper /api/auth/*
|   +-- visitService.js  -> Wrapper /api/visits/*, /api/admin/agents, /api/admin/dashboard-stats
+-- context/
|   +-- AuthContext.jsx  -> user, token, role, isAuthenticated, login(), logout(), setSession()
|   |                       Persiste en localStorage clave 'puma-auth'; verifica /api/auth/me al cargar
|   +-- PropertyFiltersContext.jsx -> Estado compartido de filtros del catalogo
+-- hooks/
|   +-- usePropertiesRefresh.js -> Escucha evento JS personalizado para refrescar listas
+-- layouts/
|   +-- AdminLayout.jsx  -> Sidebar + header para panel Administrador
|   +-- AgentLayout.jsx  -> Sidebar + header para panel Agente
|   +-- PublicLayout.jsx -> Navbar + footer para sitio publico
+-- components/
|   +-- ProtectedRoute.jsx       -> Redirige si no autenticado o rol no permitido
|   +-- RoleGuard.jsx            -> Guard de rol inline en componentes
|   +-- LoginLuxury.jsx          -> Formulario de login
|   +-- PropertyCatalog.jsx      -> Catalogo con filtros (tipo, modalidad, precio, ciudad, estado)
|   +-- PropertyCard.jsx         -> Tarjeta individual de propiedad
|   +-- VisitRequestForm.jsx     -> Formulario publico de solicitud de visita
|   +-- VisitDetailModal.jsx     -> Modal: detalle + acciones (asignar, cancelar, notas, estado)
|   +-- MultimediaUploader.jsx   -> Upload a Firebase Storage + registro en backend
|   +-- NotificationBell.jsx     -> Campana con contador; dropdown de notificaciones en tiempo real
|   +-- ChangePasswordModal.jsx  -> Modal de cambio de contrasena
+-- pages/
    (ver tablas de rutas abajo)
```

---

### Vistas del Cliente Final — Rutas Publicas (PublicLayout)

| Ruta | Pagina (archivo) | Descripcion |
|---|---|---|
| /inicio | HomePage.jsx | Hero, propiedades destacadas, seccion nosotros |
| /propiedades | Propiedades.jsx | Catalogo publico completo con PropertyCatalog y filtros |
| /propiedades/:id | PropertyDetail.jsx | Detalle de propiedad + VisitRequestForm |
| /nosotros | Nosotros.jsx | Pagina informativa del equipo |
| /contacto | Contacto.jsx | Pagina de contacto |
| /login | LoginPage.jsx | Formulario de inicio de sesion |

---

### Vistas del Panel Administrador — Rutas privadas rol Admin

| Ruta | Pagina (archivo) | Descripcion |
|---|---|---|
| /admin | AdminDashboard.jsx | Dashboard: estadisticas, historial leads, sectores, agentes, propiedades, visitas recientes |
| /admin/visitas | AdminVisitRequests.jsx | Gestion solicitudes: asignar, ver detalle, filtrar por estado |
| /admin/agentes | AdminAgentes.jsx | CRUD agentes: crear, editar, desactivar, resetear contrasena |
| /admin/propiedades | AdminProperties.jsx | Vista de inventario de propiedades |
| /admin/nueva-propiedad | AgentNewProperty.jsx | Alta de nueva propiedad (compartido con agente) |

---

### Vistas del Panel Agente — Rutas privadas rol Agente

| Ruta | Pagina (archivo) | Descripcion |
|---|---|---|
| /agente | AgentDashboard.jsx | Dashboard inicial del agente |
| /agente/inventario | AgentInventory.jsx | Inventario de propiedades del agente |
| /agente/solicitudes | AgentRequests.jsx | Solicitudes asignadas; cambio de estado |
| /agente/agenda | AgentAgenda.jsx | Agenda de visitas con vista de calendario |
| /agente/nueva-propiedad | AgentNewProperty.jsx | Alta de propiedad con upload multimedia |

---

### Manejo de Estado y Autenticacion

AuthContext.jsx: Context API. Estado: {user, token, role, isAuthenticated, initializing}. Persiste en localStorage clave 'puma-auth'.
Inicializacion: Al cargar app, lee localStorage, llama GET /api/auth/me. Si falla -> logout().
ProtectedRoute.jsx: Verifica isAuthenticated + allowedRoles. Redirige a /login o /inicio.
Interceptor Axios: Inyecta Authorization: Bearer <token>. En 401 -> limpia storage -> redirige /login.
Socket.IO: Al autenticarse, App.jsx emite auth:join con {userId, role} para unirse a las salas.

---

## 7. Configuracion, Variables de Entorno y Despliegue

### Variables de Entorno — server/.env.example

| Variable | Proposito |
|---|---|
| PORT | Puerto donde escucha Express (default 5000) |
| MONGO_URI | URI MongoDB Atlas con SRV (metodo estandar) |
| MONGO_URI_DIRECT | URI directa al replica set (fallback para redes con restricciones DNS) |
| JWT_SECRET | Clave para firmar/verificar tokens JWT (expiracion 7 dias) |
| FIREBASE_SERVICE_ACCOUNT_BASE64 | JSON de service account Firebase codificado en Base64 |
| FIREBASE_STORAGE_BUCKET | Nombre del bucket de Firebase Storage |
| FIREBASE_API_KEY | API Key de Firebase |
| FIREBASE_AUTH_DOMAIN | Dominio de autenticacion Firebase |
| FIREBASE_PROJECT_ID | ID del proyecto Firebase |

Prioridad conexion MongoDB: db.js usa MONGO_URI_DIRECT || MONGO_URI.

---

### Variables de Entorno — client/.env

| Variable | Proposito |
|---|---|
| VITE_API_URL | URL base de la API backend (Axios + Socket.IO) |
| VITE_FIREBASE_API_KEY | API Key de Firebase SDK cliente |
| VITE_FIREBASE_AUTH_DOMAIN | Dominio de autenticacion Firebase |
| VITE_FIREBASE_PROJECT_ID | ID del proyecto Firebase |
| VITE_FIREBASE_STORAGE_BUCKET | Bucket para subida directa desde el cliente |
| VITE_FIREBASE_MESSAGING_SENDER_ID | ID del remitente Firebase |
| VITE_FIREBASE_APP_ID | ID de la app Firebase |

---

### CORS

Express (server/index.js):
```javascript
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
```

Socket.IO (server/index.js):
```javascript
new Server(server, { cors: { origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] } });
```

Firebase Storage (cors.js en raiz — config para gsutil cors set, NO es middleware Express):
```json
[{ "origin": ["http://localhost:5173"], "method": ["GET","POST","PUT","DELETE"],
   "responseHeader": ["Content-Type","Authorization"], "maxAgeSeconds": 3600 }]
```

---

### Firebase Storage — Reglas de Seguridad (client/firebase.storage.rules)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /properties/{propertyId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 40 * 1024 * 1024
        && request.resource.contentType.matches('image/.*|video/.*');
    }
    match /{allPaths=**} { allow read, write: if false; }
  }
}
```

---

### Scripts de Ejecucion

```bash
# Backend
npm start        # node index.js
npm run dev      # node --watch index.js
npm run seed     # node scripts/seed.js

# Frontend
npm run dev      # vite (puerto 5173)
npm run build    # vite build -> dist/
npm run lint     # eslint
npm run preview  # previsualizar build
```

---

### Contenido de tesis-docs/

| Archivo | Tamano aprox. | Descripcion |
|---|---|---|
| TESIS.docx | 1.2 MB | Documento Word de la tesis en proceso |
| arquitectura.md | 7 KB | Descripcion de arquitectura del sistema |
| auditoria_codigo.md | 7.8 KB | Informe de auditoria del codigo |
| diagrama_modelado_datos.md | 4.9 KB | Descripcion del modelo de datos |
| diagramas_cu_extendidos.md | 51 KB | Casos de uso extendidos (documento principal) |
| documentaciontesis.md | 21 KB | Documentacion narrativa de la tesis |
| informe_flujos_alternos.md | 30 KB | Flujos alternos de los casos de uso |
| informe_seguridad_flujos.md | 9.3 KB | Analisis de seguridad de los flujos |
| reglas_negocio.md | 5.6 KB | Reglas de negocio identificadas |
| plan_tesis.md | 2 KB | Plan general de la tesis |
| manual_estilo.md | 5 KB | Manual de estilo del documento |
| tesis.txt | 47 KB | Texto de tesis en formato plano |
| Celular_Design_PumaRealEstate/ | dir | Disenos UI para movil |
| Desktop_Design_PumaRealEstate/ | dir | Disenos UI para escritorio |

---

### Despliegue

[NO ENCONTRADO EN EL CODIGO — falta informacion]

No existe archivo de despliegue en el repositorio: sin Dockerfile, sin docker-compose.yml,
sin configuracion Heroku/Render/Vercel/Railway, sin workflows CI/CD en .github/.
El proyecto esta documentado unicamente para ejecucion local.

---

## 8. Pruebas

### Archivos de Diagnostico Existentes

| Archivo | Tipo | Que valida | Como ejecutar |
|---|---|---|---|
| server/test-connect.js | Script diagnostico manual | Conectividad a MongoDB; imprime OK o ERROR | node test-connect.js o node test-connect.js "mongodb+srv://..." |
| server/check-visits.js | Script diagnostico manual | Estado coleccion VisitRequest: total + 10 ultimas | node check-visits.js (requiere .env) |

### Suite de Pruebas Automatizadas

NO existe una suite de pruebas automatizadas formal en el repositorio.

Evidencia en server/package.json:
```json
"test": "echo \"Error: no test specified\" && exit 1"
```

No hay Jest, Mocha, Vitest ni Supertest instalado.

El README documenta verificacion manual:
1. npm run dev -> confirmar arranque del servidor
2. npm run seed -> crear usuarios base
3. curl http://localhost:5000/health -> verificar MongoDB
4. Navegar http://localhost:5173 -> verificar flujos manualmente

---

## 9. Insumos para la Matriz de Trazabilidad

| Modulo Funcional | Endpoints | Modelos | Componentes Frontend |
|---|---|---|---|
| Autenticacion | POST /api/auth/login, GET /api/auth/me, POST /api/auth/change-password | User | LoginPage, LoginLuxury, AuthContext, ChangePasswordModal, ProtectedRoute |
| Catalogo Publico | GET /api/properties, GET /api/properties/:id | Property, User | Propiedades, PropertyCatalog, PropertyCard, PropertyDetail, PropertyFiltersContext |
| Solicitud de Visita (publica) | POST /api/visits | VisitRequest, Property | PropertyDetail, VisitRequestForm |
| Gestion Propiedades (agente/admin) | GET /my-properties, POST /, PUT /:id, DELETE /:id [/api/properties] | Property, User | AgentInventory, AgentNewProperty, AdminProperties, MultimediaUploader |
| Multimedia Propiedades | POST /api/properties/:id/media, DELETE /api/properties/:id/media | Property | MultimediaUploader, AgentNewProperty |
| Gestion Solicitudes (admin) | GET /api/visits, GET /:id, POST /:id/assign, POST /:id/confirm, POST /:id/cancel, PATCH /:id/status, POST /:id/notes | VisitRequest, Appointment, Property, User | AdminVisitRequests, VisitDetailModal |
| Gestion Solicitudes (agente) | GET /api/visits, GET /:id, POST /:id/accept, PATCH /:id/status, PATCH /:id/property-status, POST /:id/notes | VisitRequest, Appointment, Property | AgentRequests, AgentAgenda, VisitDetailModal |
| Gestion de Agentes (admin) | GET /api/admin/users, POST /users/register, PATCH /users/:id, PATCH /users/:id/status, POST /users/:id/reset-password | User | AdminAgentes |
| Dashboard Estadistico (admin) | GET /api/admin/dashboard-stats, GET /api/admin/agents | VisitRequest, Property, User | AdminDashboard |
| Notificaciones Tiempo Real | Socket.IO: visit:created, visit:assigned, visit:accepted, visit:statusUpdated, property:statusUpdated, notification:new, agent:updated | VisitRequest, Appointment | NotificationBell, App.jsx, socket.js |
| Agenda (agente) | GET /api/visits?agentId=..., GET /api/admin/agents?date=&timeSlot= | VisitRequest, Appointment, User | AgentAgenda |
| Estado del sistema | GET /, GET /health | — | — |

---

## 10. Vacios Detectados

Informacion requerida por la Actividad 8 que NO esta en el codigo y debe aportarse manualmente:

### 10.1 Gestion del Proyecto

- [NO ENCONTRADO] Backlog del producto: lista de historias de usuario o requerimientos priorizados
- [NO ENCONTRADO] Historias de usuario formales: "Como [rol] quiero [accion] para [beneficio]"
- [NO ENCONTRADO] Definicion de sprints/iteraciones: objetivo, duracion, entregables por sprint
- [NO ENCONTRADO] Cronograma de desarrollo (Gantt o equivalente)
- [NO ENCONTRADO] Actas de reuniones o evidencias del proceso iterativo

### 10.2 Pruebas Formales

- [NO ENCONTRADO] Casos de prueba documentados (funcionales, integracion, aceptacion)
- [NO ENCONTRADO] Resultados de ejecucion de pruebas (ejecutados/aprobados/fallidos)
- [NO ENCONTRADO] Metricas de pruebas (cobertura, numero de defectos, tiempo de correccion)
- [NO ENCONTRADO] Pruebas de usabilidad con usuarios reales
- [NO ENCONTRADO] Pruebas de rendimiento (tiempos de respuesta bajo carga)

### 10.3 Trazabilidad

- [NO ENCONTRADO] Matriz de trazabilidad completa: requerimientos numerados <-> CU <-> endpoints <-> modelos <-> componentes <-> pruebas.
  La Seccion 9 de este documento provee la base tecnica para construirla.

### 10.4 Evidencias Visuales

- [NO ENCONTRADO] Capturas de pantalla del sistema funcionando
- [NO ENCONTRADO] Video de demostracion del sistema en operacion

### 10.5 Despliegue y Acceso

- [NO ENCONTRADO] URL del sistema desplegado en la nube (Render, Vercel, Railway, etc.)
- [NO ENCONTRADO] URL del repositorio publico en GitHub
- [NO ENCONTRADO] Credenciales de acceso para el evaluador
- [NO ENCONTRADO] Configuracion de despliegue (Dockerfile, CI/CD): no existe en el repositorio

### 10.6 Metricas No Funcionales

- [NO ENCONTRADO] Tiempos de respuesta medidos por endpoint
- [NO ENCONTRADO] Tamano del bundle Vite de produccion
- [NO ENCONTRADO] Puntuacion Lighthouse u otras metricas de performance

### 10.7 Calidad y Proceso

- [NO ENCONTRADO] Analisis de riesgos del proyecto
- [NO ENCONTRADO] Informe de revision de pares o auditoria externa formal

---

*Fin del archivo de referencia tecnica. Generado: 2026-07-31 mediante recorrido exhaustivo del repositorio puma-real-estate.*
