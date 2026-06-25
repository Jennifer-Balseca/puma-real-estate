# Puma Real Estate - Sistema de Gestión Inmobiliaria

Sistema web de gestión inmobiliaria desarrollado con stack MERN para centralizar inventario, usuarios y solicitudes de visitas. Su objetivo es reemplazar procesos manuales por una plataforma web que organice la información en tiempo real y facilite el trabajo del equipo inmobiliario.

---

## 🧑‍🎓 Datos del Estudiante
- **Autor:** Jennifer Balseca
- **Carrera:** Tecnología Superior en Desarrollo de Software
- **Docente:** Jonathan Quespaz
- **Período:** 1er Período Ordinario 2026 TEC

---

## 📌 Descripción General del Proyecto
Puma Real Estate es una plataforma web para administrar propiedades, usuarios y solicitudes de visitas dentro de una inmobiliaria. El proyecto resuelve el problema de la información dispersa en archivos y dispositivos personales, permitiendo centralizar los datos en una base de datos en la nube.

El alcance actual incluye frontend en React, backend en Node.js con Express, autenticación con JWT, persistencia en MongoDB Atlas, mensajería en tiempo real con Socket.IO y un modelo de datos orientado a propiedades, usuarios y solicitudes de visita.

---

## 🏛️ Arquitectura del Sistema
El sistema está organizado como una aplicación web monolítica dividida en capas y módulos:

- **Frontend:** carpeta `client`, construida con React y Vite. Aquí vive la interfaz pública y la base para futuras vistas privadas de administración.
- **Backend:** carpeta `server`, construida con Node.js y Express. Expone la API REST, maneja la conexión a la base de datos y centraliza la lógica del servidor.
- **Capas del backend:** `routes`, `controllers`, `models`, `middleware`, `config` y `scripts`.
- **Base de datos:** MongoDB Atlas, usando Mongoose para definir esquemas y relaciones entre documentos.
- **Tiempo real:** Socket.IO para eventos y comunicación en vivo entre cliente y servidor.
- **Multimedia:** Firebase Storage queda preparada para futuras cargas de imágenes y videos.

Flujo principal:
1. El usuario ingresa desde el frontend.
2. Consulta el catálogo de propiedades.
3. Solicita una cita o visita.
4. El backend registra la información en MongoDB Atlas.
5. El agente o administrador gestiona la solicitud desde el panel correspondiente.

---

## 🛠️ Tecnologías y Versiones Utilizadas
- **Lenguaje principal:** JavaScript
- **Frontend:** React `^19.2.5`
- **Vite:** `^8.0.10`
- **Backend:** Node.js + Express `^5.2.1`
- **Base de datos:** MongoDB Atlas
- **ODM:** Mongoose `^9.6.2`
- **Autenticación:** jsonwebtoken `^9.0.3`
- **Variables de entorno:** dotenv `^17.4.2`
- **Seguridad:** helmet `^8.1.0`
- **CORS:** cors `^2.8.6`
- **Logs HTTP:** morgan `^1.10.1`
- **Hash de contraseñas:** bcrypt `^6.0.0` y bcryptjs `^3.0.3`
- **Tiempo real:** socket.io `^4.8.3` y socket.io-client `^4.8.3`
- **Frontend auxiliar:** react-router-dom, axios, react-icons, Tailwind CSS
- **Multimedia / backend cloud:** firebase y firebase-admin

---

## 📦 Dependencias
Las dependencias se manejan con `package.json` en las carpetas `client/` y `server/`.

### Dependencias críticas
- `express`: servidor web y rutas de la API.
- `mongoose`: modelo de datos y conexión con MongoDB.
- `jsonwebtoken`: autenticación por tokens.
- `dotenv`: carga de variables sensibles desde `.env`.
- `bcrypt` / `bcryptjs`: hash seguro de contraseñas.
- `helmet` y `cors`: refuerzo básico de seguridad para la API.
- `socket.io`: comunicación en tiempo real.
- `vite` y `@vitejs/plugin-react`: entorno de desarrollo del frontend.
- `react-router-dom`: navegación del frontend.
- `axios`: consumo de API desde React.

### Cómo se gestionan las dependencias

- Cada componente (frontend y backend) declara dependencias en su propio `package.json` (`client/package.json` y `server/package.json`).
- Para instalar dependencias en desarrollo, ejecuta en cada carpeta:

```bash
cd server
npm install

cd ../client
npm install
```

- Para instalaciones reproducibles en CI o despliegues usa `npm ci` (requiere que `package-lock.json` esté presente y versionado):

```bash
cd server
npm ci

cd ../client
npm ci
```

- Mantén y versiona el archivo `package-lock.json` para garantizar instalaciones consistentes entre entornos.
- Para actualizar dependencias de forma controlada puedes usar `npx npm-check-updates -u` seguido de `npm install`.
- Usa `npm audit` regularmente para detectar vulnerabilidades y `npm audit fix` cuando sea seguro hacerlo.
- Las herramientas de desarrollo deben preferiblemente instalarse como `devDependencies` y ejecutarse a través de scripts de `package.json`.

Nota: Este repositorio utiliza `npm`; si deseas cambiar a `yarn` o `pnpm`, actualiza la documentación y los archivos de bloqueo correspondientes.

---

## 🚀 Requisitos Previos
Antes de ejecutar el proyecto, el usuario debe tener instalados:

| Herramienta / Servicio | Versión Recomendada | Descripción |
|------------------------|---------------------|-------------|
| Git | Última estable | Clonar y versionar el proyecto |
| Node.js | 18 o superior | Ejecutar el backend y el frontend |
| npm | 9 o superior | Instalar dependencias y correr scripts |
| MongoDB Atlas | Plan gratuito o superior | Base de datos NoSQL del proyecto |
| MongoDB Compass | Opcional | Revisar colecciones y documentos de forma visual |
| Cuenta de Firebase | Activa | Subida futura de imágenes o videos |
| Navegador web | Última estable | Probar la aplicación en local |
| Docker / Docker Compose | Opcional | Solo si se desean contenedores auxiliares |

---

## 🔧 Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/Jennifer-Balseca/puma-real-estate.git
cd puma-real-estate
```

Si el proyecto ya está abierto en VS Code como carpeta local, no es necesario volver a clonarlo; solo ubícate en la raíz del repositorio.

### 2. Configuración de variables de entorno
Crea un archivo `server/.env` basado en el archivo de ejemplo `server/.env.example`.

**Variables requeridas:**

```env
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/PumaRealEstate?retryWrites=true&w=majority
JWT_SECRET=clave_secreta_para_desarrollo
```

**Variables opcionales (para conexión directa y multimedia):**

```env
MONGO_URI_DIRECT=mongodb://<usuario>:<password>@<host1>:27017,<host2>:27017,<host3>:27017/PumaRealEstate?replicaSet=<replicaSet>&authSource=admin&retryWrites=true&w=majority
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_firebase_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_project.appspot.com
```

**Cómo obtener `MONGO_URI` desde MongoDB Atlas:**

1. Accede a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Selecciona tu cluster `PumaRealEstate`.
3. Haz clic en **Connect** → **Drivers** → elige **Node.js**.
4. Copia la cadena de conexión (por ejemplo, `mongodb+srv://...`).
5. Reemplaza `<username>` y `<password>` con tus credenciales reales.
6. Asegúrate de que la BD sea `PumaRealEstate` al final de la URI.
7. Pega la cadena completa en `server/.env` como `MONGO_URI=`.

**Problema con SRV (DNS/resolución):**

Si ves el error `querySrv ECONNREFUSED` al iniciar, significa que tu red no resuelve correctamente `mongodb+srv://`. En ese caso:

1. Obtén la cadena estándar sin `+srv` desde Atlas.
2. Pégala en `server/.env` como `MONGO_URI_DIRECT=`.
3. El backend preferirá automáticamente `MONGO_URI_DIRECT` si existe, evitando el problema de resolución SRV.

**Importante:** No subas el archivo `.env` al repositorio. Contiene credenciales sensibles y debe permanecer local.

---

## 🗄️ Base de Datos

### 🔹 Estructura de la BD
El proyecto usa MongoDB con Mongoose y trabaja con un modelo documental centrado en tres colecciones activas principales. La colección `users` almacena a los usuarios del sistema, incluyendo administradores y agentes con sus credenciales y rol. La colección `properties` guarda la información de los inmuebles publicados, como título, descripción, tipo, estado, precio, ubicación, características e imágenes. La colección `visitrequests` registra las solicitudes de visita creadas desde el flujo actual del sistema, junto con sus datos de contacto, fecha, hora preferida, mensaje, estado y agente asignado.

En términos de diseño, el modelo permite que un usuario administre varias propiedades, que cada propiedad reciba múltiples solicitudes de visita y que una visita quede asociada tanto al inmueble como al agente responsable. Esto permite mantener la información organizada, evitar duplicidad y gestionar el flujo de trabajo inmobiliario de forma centralizada.

Colecciones activas principales:

- **users**: usuarios del sistema con `name`, `email`, `password`, `role` y `status`.
- **properties**: inmuebles con `titulo`, `descripcion`, `tipo`, `modalidad`, `estado`, `precio`, `ubicacion`, `caracteristicas`, `imagenes`, `mediaUrls`, `storagePaths`, `createdBy` y `agente`.
- **visitrequests**: solicitudes de visita con `propertyId`, `fullName`, `phone`, `email`, `preferredDate`, `timeSlot`, `message`, `status`, `assignedAgentId` y `createdBy`.

### 🔹 Modelo adicional
Además existe el modelo `Appointment`, pero hoy se considera adicional porque no es el que usa el flujo principal actual de la aplicación. El backend de visitas trabaja con `VisitRequest` en `server/controllers/visitRequestController.js` y `server/routes/visitRequests.js`, por lo que `Appointment` queda como una estructura secundaria o alternativa para futuras decisiones de modelado.

Si en algún momento se activara ese modelo, Mongoose generaría una colección separada llamada `appointments`. Por ahora, la colección operativa es `visitrequests`.

### 🔹 Relaciones importantes
- Un **User** puede tener muchas **Property**.
- Un **User** puede tener muchas **VisitRequest**.
- Una **Property** puede tener muchas **VisitRequest**.

Campos de referencia relevantes:
- `Property.agente` referencia a `User._id`.
- `VisitRequest.assignedAgentId` referencia a `User._id`.
- `VisitRequest.propertyId` referencia a `Property._id`.

Diagrama del modelo de datos:
- [modelado-datos/diagrama_modelado_datos.svg](modelado-datos/diagrama_modelado_datos.svg)

### 🔹 Inicialización de la Base de Datos
MongoDB no requiere migraciones como en SQL. Las colecciones se crean al insertar documentos.

**Flujo de inicialización:**

1. **Crear cuenta y cluster en MongoDB Atlas:**
   - Accede a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Crea un cluster, por ejemplo `PumaRealEstate`.
   - Añade un usuario de base de datos.
   - Autoriza tu IP en Network Access o usa `0.0.0.0/0` temporalmente para desarrollo.

2. **Configurar `MONGO_URI` en `server/.env`:**
   - Copia la cadena de conexión desde Atlas.
   - Si hay problemas SRV, usa `MONGO_URI_DIRECT`.

3. **Instalar dependencias y levantar el backend:**

   ```bash
   cd server
   npm install
   npm run dev
   ```

4. **Verificar conexión:**

   Desde otra terminal:
   ```bash
   curl http://localhost:5000/health
   ```

   En PowerShell:
   ```powershell
   Invoke-RestMethod http://localhost:5000/health
   ```

   Respuesta esperada (exitosa):
   ```json
   {
     "ok": true,
     "database": {
       "connected": true,
       "host": "...",
       "name": "PumaRealEstate",
       "readyState": 1
     }
   }
   ```

5. **Crear datos de ejemplo (opcional):**

   Para insertar usuarios de prueba, ejecuta el script seed:
   
   ```bash
   cd server
   npm run seed
   ```

   El script crea o valida:
   - Usuario admin: `admin@pumarealestate.com`
   - Usuario agente: `agente@pumarealestate.com`

6. **Verificar datos en la BD:**

   - **Con MongoDB Compass:**
     - Descarga [MongoDB Compass](https://www.mongodb.com/products/tools/compass).
     - New Connection → pega tu `MONGO_URI`.
     - Selecciona la base `PumaRealEstate`.
    - Busca colecciones `users`, `properties` y `visitrequests`.

   - **Con mongosh (CLI):**
     ```bash
     mongosh "mongodb+srv://user:password@cluster.mongodb.net/PumaRealEstate"
    > db.users.findOne({ email: "admin@pumarealestate.com" })
    > db.visitrequests.findOne()
     ```

   - **Con la UI de Atlas:**
     - Accede a tu cluster en Atlas → Collections.
     - Visualiza documentos directamente en la interfaz.

---

## ▶️ Instrucciones para Ejecutar el Proyecto

### 1. Instalar dependencias

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Levantar el backend

Desde la carpeta `server`:

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

Deberías ver:
```text
✅ Servidor encendido en http://localhost:5000
```

### 3. Levantar el frontend

Desde otra terminal, carpeta `client`:

```bash
npm run dev
```

Deberías ver algo como:
```text
LOCAL:   http://localhost:5173/
```

### 4. Verificar que todo funciona

**Backend vivo:**
```bash
curl http://localhost:5000/
```

En PowerShell:
```powershell
Invoke-WebRequest http://localhost:5000/ -UseBasicParsing
```

Respuesta: `API de Puma Real Estate funcionando correctamente 🚀`

**Backend + BD conectados:**
```bash
curl http://localhost:5000/health
```

Respuesta: JSON con `"ok": true` y `"database": { "connected": true, ... }`.

**Frontend en navegador:**
- Abre `http://localhost:5173` en el navegador.
- Deberías ver la interfaz de React.

### Puertos y URLs
- **Backend:** puerto `5000`.
- **Frontend:** puerto `5173`.
- **Base de datos:** MongoDB Atlas en la nube.
- **URLs de acceso:**
  - API: `http://localhost:5000`
  - Frontend: `http://localhost:5173`
  - Health check: `http://localhost:5000/health`

---

## 🧪 Pruebas (Opcional)

### Pruebas manuales básicas

**1. Verificar conectividad Mongoose (Node):**

Desde `server/`, ejecuta:
```bash
node test-connect.js
```

Respuesta esperada: `OK - Mongoose conectado`.

Este script prueba que Node.js pueda conectar a MongoDB usando Mongoose con las variables de `.env`.

**2. Probar endpoints del backend:**

Con el backend levantado (`npm run dev`):

```bash
# Health check (BD)
curl http://localhost:5000/health

# Root endpoint
curl http://localhost:5000/
```

**3. Datos de prueba:**

Para insertar usuarios de prueba:
```bash
cd server
npm run seed
```

Luego verifica en Compass o mongosh que existan documentos con:
- Usuario admin: `admin@pumarealestate.com`
- Usuario agente: `agente@pumarealestate.com`

### Pruebas automatizadas
Actualmente no hay una suite de tests automatizados. El script `npm test` en `server/` es un placeholder.

Futuro: se recomienda agregar tests con Jest en backend y Vitest en frontend cuando el proyecto avance.

---

## 📁 Estructura del Proyecto

```text
./
  README.md
  client/
    eslint.config.js
    firebase.storage.rules
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    vite.config.js
    public/
    src/
      App.css
      App.jsx
      firebase.js
      index.css
      main.jsx
      socket.js
      api/
      assets/
      components/
      context/
      hooks/
      layouts/
      pages/
      utils/
  modelado-datos/
    diagrama_modelado_datos.svg
  server/
    .env
    .env.example
    firebaseAdmin.js
    index.js
    package.json
    test-connect.js
    config/
      db.js
    controllers/
      adminController.js
      authController.js
      propertyController.js
      visitRequestController.js
    middleware/
      authMiddleware.js
      authorizeProperty.js
    models/
      Appointment.js
      Property.js
      User.js
      visitRequest.js
    routes/
      adminRoutes.js
      authRoutes.js
      propertyRoutes.js
      visitRequests.js
    scripts/
      seed.js
  tesis-docs/
    arquitectura.md
    diagrama_modelado_datos.md
    manual_estilo.md
    plan_tesis.md
    reglas_negocio.md
```

---

## 📊 Datos, Archivos o Recursos Necesarios

### Recursos incluidos:
- **Diagrama de modelo de datos:** `modelado-datos/diagrama_modelado_datos.svg`.
- **Script de seed:** `server/scripts/seed.js`.
- **Assets del frontend:** `client/public/` y `client/src/assets/`.

### Recursos opcionales (para producción o expansión):
- **CSV / JSON:** para importar datos de prueba o catálogos iniciales.
- **Imágenes de propiedades:** material visual para subir vía Firebase Storage.
- **Backups de BD:** dumps de MongoDB Atlas.
- **Credenciales Firebase:** solo si se activa la funcionalidad de multimedia.

### Firebase
Esta fase del proyecto no requiere Firebase para funcionar. Las variables de Firebase en `.env` son opcionales para futuras funcionalidades de carga de imágenes. Si deseas habilitarlas:
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Configura Firebase Storage.
3. Copia las credenciales a `server/.env`.

Sin Firebase, el proyecto funciona completamente con MongoDB para persistencia de datos.

---

## 🛡️ Notas de Seguridad
- No subir contraseñas, claves ni tokens al repositorio.
- Usar `.env` para variables sensibles.
- Mantener `server/.env` fuera de control de versiones.
- Proteger las llaves privadas de Firebase y JWT.

---

## 📅 Estado del Proyecto
El proyecto se encuentra en desarrollo.

Estado actual:
- Backend funcional con conexión a MongoDB Atlas.
- Frontend inicial en React + Vite.
- Modelado de datos definido para usuarios, propiedades y solicitudes de visita.
- Autenticación y rutas base preparadas en el servidor.
- Conexión en tiempo real disponible mediante Socket.IO.

Pendientes o aspectos futuros:
- Completar panel administrativo.
- Implementar más rutas y controladores.
- Añadir pruebas automatizadas.
- Integrar completamente el flujo de multimedia con Firebase Storage.

Obstáculos técnicos encontrados y solucionados:
- **Conexión DNS/SRV hacia MongoDB Atlas:** en algunos entornos la resolución SRV falla con `querySrv ECONNREFUSED`. Solución: usar `MONGO_URI_DIRECT` con hosts directos.
- **Organización de modelos:** los modelos quedaron consolidados en `server/models/`.
- **Estabilidad de conexión:** se configuraron timeouts y opciones de Mongoose para mejorar la conexión.

---

## 🔗 URLs y Endpoints Principales

### Backend (Express API)
- **Raíz:** `GET http://localhost:5000/` → `API de Puma Real Estate funcionando correctamente 🚀`
- **Health check:** `GET http://localhost:5000/health` → Estado de conexión con BD en JSON.
- **Auth:** `/api/auth`
- **Admin:** `/api/admin`
- **Properties:** `/api/properties`
- **Visits:** `/api/visits`

### Frontend (React + Vite)
- **URL:** `http://localhost:5173`

### Pruebas rápidas
- `GET http://localhost:5000/` para validar el servidor.
- `GET http://localhost:5000/health` para validar conexión con MongoDB.

---

## 📌 Observaciones Finales
Este README se mantiene alineado con el avance real del proyecto y con la estructura requerida para la tesis. Si en el siguiente avance se agregan nuevas entidades, pantallas, servicios o pruebas, este documento debe actualizarse sin eliminar las secciones base.