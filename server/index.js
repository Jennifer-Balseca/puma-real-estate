require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const conectarDB = require('./config/db.js');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const { authMiddleware } = require('./middleware/authMiddleware');
const { initFirebaseAdmin } = require('./firebaseAdmin');

const http = require('http');
const { Server } = require('socket.io');
const visitRoutes = require('./routes/visitRequests');

const app = express();

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
];

app.use(express.json());
app.use(
    cors({
        origin: ALLOWED_ORIGINS,
        credentials: true
    })
);
app.get('/', (req, res) => {
    res.send('API de Puma Real Estate funcionando correctamente 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/visits', visitRoutes);

app.get('/health', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;

    res.status(isConnected ? 200 : 503).json({
        ok: isConnected,
        database: {
            connected: isConnected,
            host: mongoose.connection.host || null,
            name: mongoose.connection.name || null,
            readyState: mongoose.connection.readyState
        }
    });
});

app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: error.message || 'Error interno del servidor'
    });
});

const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
    try {
        await conectarDB();

        initFirebaseAdmin();

        const server = http.createServer(app);
        const io = new Server(server, { cors: { origin: ALLOWED_ORIGINS } });
        app.set('io', io);

        io.on('connection', (socket) => {
            socket.on('auth:join', (data) => {
                if (data?.userId) {
                    socket.join(data.userId);
                    socket.join(`user:${data.userId}`);
                    const role = String(data.role || '').toLowerCase();
                    if (role === 'admin' || role === 'administrador') {
                        socket.join('admin');
                    } else if (role === 'agent' || role === 'agente') {
                        socket.join('agent');
                    }
                }
            });
            socket.on('disconnect', () => {
            });
        });

        // Inicializar cron de recordatorios
        const { initReminderCron } = require('./services/reminderCron');
        initReminderCron(io);

        server.listen(PORT, () => {
            console.log(`✅ Servidor encendido en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(`Error al iniciar el backend: ${error.message}`);
        process.exit(1);
    }
};

iniciarServidor();