const mongoose = require('mongoose');
const VisitRequest = require('./models/visitRequest');
require('dotenv').config({ path: './.env' });

const uri = process.env.MONGO_URI_DIRECT || process.env.MONGO_URI;

mongoose.connect(uri, { family: 4 })
  .then(async () => {
    console.log('Conectado a MongoDB');
    const total = await VisitRequest.countDocuments();
    console.log('Total solicitudes de visita:', total);
    const visits = await VisitRequest.find().sort({ createdAt: -1 }).limit(10);
    console.log('Últimas 10 solicitudes:');
    visits.forEach(v => {
      console.log(`- ID: ${v._id}, Cliente: ${v.fullName}, Creado en: ${v.createdAt}, Estado: ${v.status}`);
    });
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('ERROR:', err);
    process.exit(1);
  });
