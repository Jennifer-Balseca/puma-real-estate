const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
    res.send('Servidor de Puma Real Estate corriendo 🚀');
});

app.listen(PORT, () => {
    console.log(`Servidor encendido en http://localhost:${PORT}`);
});