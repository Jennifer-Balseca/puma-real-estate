require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const conectarDB = require('./config/db.js');

const app = express();

app.use(express.json());
app.get('/', (req, res) => {
    res.send('API de Puma Real Estate funcionando correctamente 🚀');
});

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

const PORT = process.env.PORT || 5000;

const iniciarServidor = async () => {
    try {
        await conectarDB();

        app.listen(PORT, () => {
            console.log(`✅ Servidor encendido en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(`Error al iniciar el backend: ${error.message}`);
        process.exit(1);
    }
};

iniciarServidor();