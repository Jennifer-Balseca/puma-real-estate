const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const bcrypt = require('bcryptjs');

const User = require('../models/User');

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

    await ensureUser({ email: 'admin@pumarealestate.com', password: '12345', role: 'Admin', status: 'Activo' });
    await ensureUser({ email: 'agente@pumarealestate.com', password: 'agente123', role: 'Agente', status: 'Activo' });

    console.log('Seed de usuarios completado. No se crean propiedades de prueba.');

    await mongoose.disconnect();
    console.log('Seed finalizado.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
};

seed();
