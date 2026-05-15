# Puma Real Estate - Sitema de Gestión Inmobiliaria
Sistema web de gestión inmobiliaria desarrollado con stack MERN para centralizar inventario, usuarios y solicitudes de visitas. Su objetivo principal es reemplazar procesos manuales por una plataforma web que organice la información en tiempo real y mejore la operación de la empresa.

---

## 🧑‍🎓 Datos del Estudiante
- **Autor:** Jennifer Balseca
- **Carrera:** Tecnología Superior en Desarrollo de Software
- **Docente:** Jonathan Quespaz
- **Período:** 1er Período Ordinario 2026 TEC

---

## 📌 Descripción General del Proyecto
Puma Real Estate es una plataforma web para administrar propiedades, usuarios y solicitudes de visitas dentro de una inmobiliaria. El proyecto resuelve el problema de la información dispersa en archivos y dispositivos personales, permitiendo centralizar los datos en una base de datos en la nube.

El alcance actual incluye frontend en React, backend en Node.js con Express, autenticación con JWT, persistencia en MongoDB Atlas y un modelo de datos orientado a propiedades, usuarios y citas o visitas.

---

## 🏛️ Arquitectura del Sistema
El sistema está organizado en tres componentes principales:

- **Frontend:** carpeta `client`, construida con React y Vite. Aquí vive la interfaz pública y futura interfaz privada para administración.
- **Backend:** carpeta `server`, construida con Node.js y Express. Expone la API REST, maneja la conexión a la base de datos y centraliza la lógica del servidor.
- **Base de datos:** MongoDB Atlas, usando Mongoose para definir esquemas y relaciones entre documentos.

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
- **Herramienta de desarrollo frontend:** Vite `^8.0.10`
- **Backend:** Node.js + Express `^5.2.1`
- **Base de datos:** MongoDB Atlas
- **ODM:** Mongoose `^9.6.2`
- **Autenticación:** jsonwebtoken `^9.0.3`
- **Variables de entorno:** dotenv `^17.4.2`
- **Seguridad:** helmet `^8.1.0`
- **CORS:** cors `^2.8.6`
- **Logs HTTP:** morgan `^1.10.1`
- **Hash de contraseñas:** bcrypt `^6.0.0` / bcryptjs `^3.0.3`

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
- `vite` y `@vitejs/plugin-react`: entorno de desarrollo del frontend.

### Cómo se gestionan las dependencias

- Cada componente (frontend y backend) declara dependencias en su propio `package.json` (`client/package.json` y `server/package.json`).
- Para instalar dependencias en desarrollo, ejecute en cada carpeta:

```bash
cd server
npm install

cd ../client
npm install
```

- Para instalaciones reproducibles en CI o despliegues use `npm ci` (requiere que `package-lock.json` esté presente y commiteado):

```bash
cd server
npm ci

cd ../client
npm ci
```

- Mantén y versiona el archivo `package-lock.json` para garantizar instalaciones consistentes entre entornos.
- Para actualizar dependencias de forma controlada puedes usar `npx npm-check-updates -u` seguido de `npm install`.
- Usa `npm audit` regularmente para detectar vulnerabilidades y `npm audit fix` cuando sea seguro hacerlo.
- Las herramientas de desarrollo deben preferiblemente instalarse como `devDependencies` y ejecutarse a través de scripts de `package.json` (por ejemplo `npm run lint`).

Nota: Este repositorio utiliza `npm`; si deseas cambiar a `yarn` o `pnpm`, actualiza la documentación y los archivos de bloqueo (`yarn.lock` o `pnpm-lock.yaml`) en consecuencia.

---

## 🚀 Requisitos Previos
Antes de ejecutar el proyecto, el usuario debe tener instalados:

| Herramienta / Servicio | Versión Recomendada | Descripción |
|------------------------|---------------------|-------------|
| Git | Última estable | Clonar y versi0onar el proyecto |
| Node.js | 18 o superior | Ejecutar el backend y el frontend |
| npm | 9 o superior | Instalar dependencias y correr scripts |
| React | 19.x | Framework de interfaz usado en el frontend |
| Vite | 8.x | Entorno de desarrollo del frontend |
| MongoDB Atlas | Plan gratuito o superior | Base de datos NoSQL del proyecto |
| MongoDB Compass | Opcional | Revisar colecciones y documentos de forma visual |
| Cuenta de Firebase | Activa | Subida y gestión de imágenes o videos |
| Navegador web | Última estable | Probar la aplicación en local |
| Docker / Docker Compose | Opcional | Solo si se desea usar contenedores auxiliares |

---

## 🔧 Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/Jennifer-Balseca/puma-real-estate.git
cd puma-real-estate
```

Si el proyecto ya está abierto en VS Code como carpeta local, no es necesario volver a clonarlo; solo ubícate en la raíz del repositorio.

### 2. Configuración de variables de entorno
Crea un archivo `server/.env` basado en el archivo de ejemplo `server/.env.example` (ubicado en la carpeta `server`).

**Variables requeridas:**

```env
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/PumaRealEstate?retryWrites=true&w=majority
JWT_SECRET=clave_secreta_para_desarrollo
```

**Variables opcionales (para multimedia):**

```env
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_firebase_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_project.appspot.com
```

**Cómo obtener `MONGO_URI` desde MongoDB Atlas:**

1. Accede a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Selecciona tu cluster "PumaRealEstate".
3. Haz clic en **Connect** → **Drivers** → elige **Node.js**.
4. Copia la cadena de conexión (algo como `mongodb+srv://...@cluster.mongodb.net/?...`).
5. Reemplaza `<username>` y `<password>` con tus credenciales reales.
6. Asegúrate de que la BD sea `PumaRealEstate` al final (ej: `...mongodb.net/PumaRealEstate?...`).
7. Pega la cadena completa en `server/.env` como `MONGO_URI=`.

**Problema con SRV (DNS/resolución):**

Si ves error `querySrv ECONNREFUSED` al iniciar, significa que tu red no resuelve correctamente `mongodb+srv://`. En ese caso:

1. Obtén la cadena "estándar" sin +srv desde Atlas:
   - Atlas → Connect → Show additional connection string options → Copy "Standard connection string (without +srv)".
2. Pégala en `server/.env` como `MONGO_URI_DIRECT=` (línea adicional):

```env
MONGO_URI_DIRECT=mongodb://user:password@ac-xxx.mongodb.net:27017,ac-yyy.mongodb.net:27017,ac-zzz.mongodb.net:27017/PumaRealEstate?replicaSet=atlas-XXX-shard-0&authSource=admin&retryWrites=true&w=majority
```

3. El backend preferirá automáticamente `MONGO_URI_DIRECT` si existe, evitando el problema de resolución SRV.

**Importante:** No subas el archivo `.env` al repositorio — contiene credenciales sensibles. El archivo `.env` debe permanecer local y excluido en `.gitignore`.

---

## 🗄️ Base de Datos

### 🔹 Estructura de la BD
El proyecto usa MongoDB con Mongoose y trabaja con un modelo de datos documental centrado en tres colecciones principales. La colección **users** almacena a los usuarios del sistema, incluyendo administradores y agentes con sus credenciales y rol. La colección **properties** guarda la información de los inmuebles publicados, como título, descripción, tipo, estado, precio, ubicación, características e imágenes. La colección **appointments** registra las solicitudes de visita o citas realizadas por los clientes, junto con sus datos de contacto, fecha, hora, mensaje y estado de atención.

En términos de diseño, el modelo permite que un usuario administre varias propiedades, que cada propiedad reciba múltiples solicitudes de visita y que una visita quede asociada tanto al inmueble como al agente responsable. Esto permite mantener la información organizada, evitar duplicidad y gestionar el flujo de trabajo inmobiliario de forma centralizada.

Colecciones principales:

- **users**: usuarios del sistema con `nombre`, `email`, `password` y `rol`.
- **properties**: inmuebles con `titulo`, `descripcion`, `tipo`, `estado`, `precio`, `ubicacion`, `caracteristicas`, `imagenes` y `agente`.
- **appointments**: solicitudes de visita con `propiedad`, `clienteNombre`, `clienteEmail`, `clienteTelefono`, `fecha`, `hora`, `mensaje`, `estado` y `agenteResponsable`.

### 🔹 Relaciones importantes
- Un **User** puede tener muchas **Property**.
- Un **User** puede tener muchas **Appointment**.
- Una **Property** puede tener muchas **Appointment**.

Campos de referencia relevantes:
- `Property.agente` referencia a `User._id`.
- `Appointment.agenteResponsable` referencia a `User._id`.
- `Appointment.propiedad` referencia a `Property._id`.

Diagrama del modelo de datos:
- [modelado-datos/diagrama_modelado_datos.svg](modelado-datos/diagrama_modelado_datos.svg)

### 🔹 Inicialización de la Base de Datos
MongoDB no requiere migraciones como en SQL. Las colecciones se crean al insertar documentos.

**Flujo de inicialización:**

1. **Crear cuenta y cluster en MongoDB Atlas:**
   - Accede a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Crea un cluster (p. ej., "PumaRealEstate").
   - Añade un usuario de base de datos (p. ej., `jennbalseca1d_db_user`).
   - Whitelist tu IP en Network Access (o usa `0.0.0.0/0` temporalmente para desarrollo).

2. **Configurar `MONGO_URI` en `server/.env`:**
   - Copia la cadena de conexión desde Atlas.
   - Si hay problemas SRV, usa `MONGO_URI_DIRECT` como se explicó arriba.

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
   # o en PowerShell
   (Invoke-RestMethod http://localhost:5000/health)
   ```

   Respuesta esperada (exitosa):
   ```json
   {
     "ok": true,
     "database": {
       "connected": true,
       "host": "ac-sq64ycu-shard-00-02.r5rzfhm.mongodb.net",
       "name": "PumaRealEstate",
       "readyState": 1
     }
   }
   ```

   Si `connected` es `false` o hay error de conexión, revisa tu `MONGO_URI` y whitelist en Atlas.

5. **Crear datos de ejemplo (opcional):**

   Para insertar automáticamente usuarios, propiedades y citas de prueba, ejecuta el script seed:
   
   ```bash
   cd server
   npm run seed
   ```

   El script crea:
   - Usuario admin: `admin@example.com` / contraseña `admin123` (hasheada)
   - Usuario agente: `agente@example.com` / contraseña `agent123` (hasheada)
   - Propiedad demo: "Departamento demo en el centro"
   - Cita demo: cliente `cliente@example.com`

   Si algún documento ya existe (por email), no lo duplica.

6. **Verificar datos en la BD:**

   - **Con MongoDB Compass:**
     - Descarga [MongoDB Compass](https://www.mongodb.com/products/tools/compass).
     - New Connection → pega tu `MONGO_URI`.
     - Selecciona la base `PumaRealEstate`.
     - Busca colecciones `users`, `properties`, `appointments`.

   - **Con mongosh (CLI):**
     ```bash
     mongosh "mongodb+srv://user:password@cluster.mongodb.net/PumaRealEstate"
     > db.users.findOne({ email: "admin@example.com" })
     > db.properties.findOne({ titulo: "Departamento demo en el centro" })
     ```

   - **Con atlas UI:**
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

# O producción
npm start
```

Deberías ver:
```
✅ Servidor encendido en http://localhost:5000
```

### 3. Levantar el frontend

Desde otra terminal, carpeta `client`:

```bash
npm run dev
```

Deberías ver algo como:
```
LOCAL:   http://localhost:5173/
```

### 4. Verificar que todo funciona

**Backend alive:**
```bash
curl http://localhost:5000

Invoke-WebRequest http://localhost:5000 -UseBasicParsing
```

Respuesta: `API de Puma Real Estate funcionando correctamente 🚀`

**Backend + BD conectados:**
```bash
curl http://localhost:5000/health
```

Respuesta: JSON con `"ok": true` y `"database": { "connected": true, ... }`

**Frontend en navegador:**
- Abre `http://localhost:5173` en el navegador.
- Deberías ver la interfaz de React.

### Puertos y URLs
- **Backend:** puerto `5000` (API REST).
- **Frontend:** puerto `5173` (interfaz web).
- **Base de datos:** MongoDB Atlas (en la nube).
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

Respuesta esperada: `OK - Mongoose conectado`

Este script prueba que Node.js pueda conectar a MongoDB usando Mongoose con las variables de `.env`.

**2. Probar endpoints del backend:**

Con el backend levantado (`npm run dev`):

```bash
# Health check (BD)
curl http://localhost:5000/health

# Root endpoint
curl http://localhost:5000
```

**3. Datos de prueba:**

Para insertar usuarios y propiedades de prueba:
```bash
cd server
npm run seed
```

Luego verifica en Compass o mongosh que existan documentos con:
- Usuario: `admin@example.com`
- Propiedad: "Departamento demo en el centro"
- Cita: cliente `cliente@example.com`

### Pruebas automatizadas
Actualmente no hay suite de tests automatizadas. El script `npm test` es un placeholder.

**Futuro:** Se recomienda agregar tests con Jest (backend) y Vitest (frontend) cuando el proyecto avance.

---

## 📁 Estructura del Proyecto

```text
./
  .gitignore                    
  README.md                     
  modelado-datos/
    diagrama_modelado_datos.svg 
  client/                         
    .gitignore
    eslint.config.js
    index.html
    package.json
    package-lock.json
    vite.config.js
    public/
      favicon.svg
      icons.svg
    src/
      App.css
      App.jsx
      index.css
      main.jsx
      assets/
        hero.png
        react.svg
        vite.svg
  server/                       
    .env                        
    .env.example                
    package.json
    package-lock.json
    index.js                    
    test-connect.js             
    config/
      db.js                   
    models/
      Appointment.js           
      Property.js               
      User.js              
    scripts/
      seed.js               
```

---

## 📊 Datos, Archivos o Recursos Necesarios

### Recursos incluidos:
- **Diagrama de modelo de datos:** `modelado-datos/diagrama_modelado_datos.svg` (visualización de relaciones entre colecciones).
- **Script de seed:** `server/scripts/seed.js` (crea datos de ejemplo automáticamente).
- **Assets del frontend:** `client/public/` e `client/src/assets/` (imágenes, íconos, etc.).

### Recursos opcionales (para producción/expansión):
- **CSV / JSON:** para importar datos de prueba o catálogos iniciales (ubicar en carpeta `data/` si existe).
- **Imágenes de propiedades:** material visual (se cargarían vía Firebase Storage).
- **Backups de BD:** dumps de MongoDB Atlas (guardar en carpeta `server/backups/` si se implementa).
- **Credenciales Firebase:** solo si se activa la funcionalidad de multimedia.

### Firebase 
Esta fase del proyecto **no requiere Firebase** para funcionar. Las variables de Firebase en `.env` son opcionales para futuras funcionalidades de carga de imágenes. Si deseas habilitarlas:
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
El proyecto se encuentra **en desarrollo**.

Estado actual:
- Backend funcional con conexión a MongoDB Atlas.
- Frontend inicial en React + Vite.
- Modelado de datos definido para usuarios, propiedades y citas/visitas.

Pendientes o aspectos futuros:
- Completar panel administrativo.
- Implementar más rutas y controladores.
- Añadir pruebas automatizadas.
- Integrar completamente el flujo de multimedia con Firebase Storage.

Obstáculos técnicos encontrados y solucionados:
- **Variaciones en la conexión DNS/SRV hacia MongoDB Atlas:** En algunos entornos (redes corporativas, ISP con bloqueos DNS), la resolución SRV falla con error `querySrv ECONNREFUSED`. **Solución:** usar la variable `MONGO_URI_DIRECT` con hosts directos en lugar de SRV (ver sección "Configuración de variables de entorno").
- **Existencia de modelos duplicados:** Durante la etapa de organización había modelos en `server/models/` y `server/src/models/`. Fueron consolidados en `server/models/`.
- **Parámetros de conexión optimizados:** Se configuraron timeouts y opciones de Mongoose para mejorar la estabilidad en conexiones lentas.

---

## � URLs y Endpoints Principales

### Backend (Express API)
- **Raíz:** `GET http://localhost:5000/` → "API de Puma Real Estate funcionando correctamente 🚀"
- **Health check:** `GET http://localhost:5000/health` → Estado de conexión con BD (JSON con `ok`, `database.connected`, etc.)

Futuros endpoints (por implementar):
- Rutas de autenticación (`POST /login`, `POST /register`)
- CRUD de propiedades (`GET /properties`, `POST /properties`, etc.)
- CRUD de citas (`GET /appointments`, `POST /appointments`, etc.)

### Frontend (React + Vite)
- **URL:** `http://localhost:5173`
- **Componentes:** App.jsx, componentes reutilizables (por desarrollarse)

---

## 📄 Licencia (Opcional)
Proyecto académico. Puede utilizarse licencia MIT si se desea.

---

