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

const app = express();


app.use(express.json());
app.use(
    cors({
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true
    })
);
app.get('/', (req, res) => {
    res.send('API de Puma Real Estate funcionando correctamente 🚀');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/properties', propertyRoutes);

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

app.use((req, res) => {
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

        app.listen(PORT, () => {
            console.log(`✅ Servidor encendido en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(`Error al iniciar el backend: ${error.message}`);
        process.exit(1);
    }
};

iniciarServidor();