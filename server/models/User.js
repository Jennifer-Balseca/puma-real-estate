const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Agente'],
        default: 'Agente',
        alias: 'rol'
    },
    status: {
        type: String,
        required: true,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo',
        alias: 'estado'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);