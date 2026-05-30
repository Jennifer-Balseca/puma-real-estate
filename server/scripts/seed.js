const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Property = require('../models/Property');
const Appointment = require('../models/Appointment');

const MONGO_URI = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Falta MONGO_URI o MONGO_URI_DIRECT en las variables de entorno. Revisa server/.env');
  process.exit(1);
}

const connectDB = async () => {
  return mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    family: 4
  });
};

const seed = async () => {
  try {
    await connectDB();
    console.log('Conectado a MongoDB para seed');

    const ensureUser = async ({ email, password, role, status = 'Activo' }) => {
      let user = await User.findOne({ email });
      if (!user) {
        const hash = await bcrypt.hash(password, 10);
        user = new User({ email, password: hash, role, status });
        await user.save();
        console.log(`Usuario creado: ${email}`);
      } else {
        let updated = false;

        if (!user.role) {
          user.role = role;
          updated = true;
        }

        if (!user.status) {
          user.status = status;
          updated = true;
        }

        if (updated) {
          await user.save();
          console.log(`Usuario actualizado: ${email}`);
        }

        console.log(`Usuario ya existe: ${email}`);
      }
      return user;
    };

    const admin = await ensureUser({ email: 'admin@pumarealestate.com', password: '12345', role: 'Admin', status: 'Activo' });
    const agente = await ensureUser({ email: 'agente@pumarealestate.com', password: 'agente123', role: 'Agente', status: 'Activo' });

    const agentUser = agente || admin;

    let propiedad = await Property.findOne({ titulo: 'Departamento demo en el centro' });
    if (!propiedad && agentUser) {
      propiedad = new Property({
        titulo: 'Departamento demo en el centro',
        descripcion: 'Departamento de prueba para el seed del proyecto Puma Real Estate.',
        tipo: 'Departamento',
        estado: 'Disponible',
        precio: 120000,
        ubicacion: { direccion: 'Av. Demo 123', ciudad: 'Quito', sector: 'Centro' },
        caracteristicas: { habitaciones: 2, banos: 1, areaMetros: 60, parqueadero: false },
        imagenes: [],
        agente: agentUser._id
      });
      await propiedad.save();
      console.log('Propiedad de ejemplo creada.');
    } else if (propiedad) {
      console.log('Propiedad ya existe:', propiedad.titulo);
    } else {
      console.log('No se pudo crear propiedad: falta agente.');
    }

    let appointment = await Appointment.findOne({ clienteEmail: 'cliente@example.com' });
    if (!appointment && propiedad && agentUser) {
      appointment = new Appointment({
        propiedad: propiedad._id,
        clienteNombre: 'Cliente Demo',
        clienteEmail: 'cliente@example.com',
        clienteTelefono: '0999999999',
        fecha: new Date(),
        hora: '10:00',
        mensaje: 'Solicitud de visita de prueba',
        agenteResponsable: agentUser._id
      });
      await appointment.save();
      console.log('Cita de ejemplo creada.');
    } else if (appointment) {
      console.log('Cita ya existe:', appointment.clienteEmail);
    } else {
      console.log('No se pudo crear cita: faltan prerequisitos.');
    }

    await mongoose.disconnect();
    console.log('Seed finalizado.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
};

seed();
