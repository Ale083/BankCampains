require('dotenv').config();
const mongoose = require('mongoose');

async function testDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bankcampains';
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a la DB');

    // Verificar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Colecciones disponibles:', collections.map(c => c.name));

    // Verificar datos en history
    const historyCount = await mongoose.connection.db.collection('histories').countDocuments();
    console.log('Documentos en histories:', historyCount);
    
    if (historyCount > 0) {
      const historyDocs = await mongoose.connection.db.collection('histories').find().limit(3).toArray();
      console.log('Primeros documentos en histories:', JSON.stringify(historyDocs, null, 2));
    }

    // Probar también con "history" sin s
    const historyCount2 = await mongoose.connection.db.collection('history').countDocuments();
    console.log('Documentos en history:', historyCount2);
    
    if (historyCount2 > 0) {
      const historyDocs2 = await mongoose.connection.db.collection('history').find().limit(3).toArray();
      console.log('Primeros documentos en history:', JSON.stringify(historyDocs2, null, 2));
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testDB();