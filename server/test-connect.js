const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const uri = process.argv[2] || process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

if (!uri) {
  console.error('Falta URI. Pasa la URI como primer argumento o configura MONGO_URI/MONGO_URI_DIRECT en .env');
  process.exit(1);
}

mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('OK - Mongoose conectado');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('ERROR CONNECT:', err.message);
    process.exit(1);
  });
