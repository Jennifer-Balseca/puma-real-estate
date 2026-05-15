const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true },
    tipo: { 
        type: String, 
        required: true, 
        enum: ['Casa', 'Departamento', 'Terreno', 'Oficina'] 
    },
    estado: { 
        type: String, 
        default: 'Disponible', 
        enum: ['Disponible', 'Vendida', 'Rentada'] 
    },
    precio: { type: Number, required: true },
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
    agente: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);