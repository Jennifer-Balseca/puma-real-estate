const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    const uri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

    if (!uri) {
      throw new Error('No se ha definido una variable de entorno MONGO_URI o MONGO_URI_DIRECT');
    }

    const options = {
      serverSelectionTimeoutMS: 30000, 
      family: 4 
    };

    console.log('Intentando conectar a MongoDB...');
    
    if (process.env.MONGO_URI_DIRECT) {
      console.log('ℹ️ Usando conexión directa (MONGO_URI_DIRECT)');
    }

    const conn = await mongoose.connect(uri, options);
    
    console.log(`✅ Conectado a MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
};

module.exports = conectarDB;