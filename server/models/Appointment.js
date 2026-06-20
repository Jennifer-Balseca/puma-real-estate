const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    propiedad: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Property', 
        required: true 
    },
    clienteNombre: { type: String, required: true },
    clienteEmail: { type: String, required: true },
    clienteTelefono: { type: String, required: true },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    mensaje: { type: String }, 
    estado: { 
        type: String, 
        default: 'Pendiente', 
        enum: ['Pendiente', 'Confirmada', 'Completada'] 
    },
    agenteResponsable: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);