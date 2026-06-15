const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    tipo: { 
        type: String, 
        required: true, 
        enum: ['Casa', 'Departamento', 'Terreno', 'Oficina'] 
    },
    modalidad: {
        type: String,
        required: true,
        enum: ['Venta', 'Alquiler']
    },
    estado: { 
        type: String, 
        default: 'Disponible', 
        enum: ['Disponible', 'Vendida', 'Alquilada'] 
    },
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
        parqueadero: { type: Boolean, default: false }
    },
    imagenes: [{ type: String }], 
    mediaUrls: [{ type: String }],
    storagePaths: [{ type: String }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    agente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);