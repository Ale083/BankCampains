require('dotenv').config();
const mongoose = require('mongoose');

async function insertSampleData() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bankcampains';
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a la DB');

    // Insertar datos de ejemplo en histories
    const historyData = {
      name: "Consulta 001",
      type: "búsqueda",
      description: "Prueba inicial del historial",
      filtersIncluded: [
        "estado=exitosa",
        "rango=2025-10"
      ],
      resultsCount: 42,
      createdAt: new Date("2025-10-20T02:37:14.540Z"),
      status: "success",
      filters: {
        estado: "exitosa",
        rango: "2025-10"
      },
      sizeMB: 2.5,
      requestedBy: "admin",
      notes: "Consulta de prueba desde la base de datos"
    };

    const result = await mongoose.connection.db.collection('histories').insertOne(historyData);
    console.log('Datos de history insertados:', result.insertedId);

    // Insertar datos de ejemplo en exports
    const exportData1 = {
      fileName: "reporte_contactos.csv",
      format: "csv",
      status: "ready",
      url: "/downloads/reporte_contactos.csv",
      createdAt: new Date("2025-10-20T02:37:14.653Z"),
      sizeMB: 1.8,
      requestedBy: "admin",
      filters: {
        type: "contacts",
        status: "active"
      },
      resultCount: 150
    };

    const exportData2 = {
      fileName: "reporte_octubre.xlsx",
      format: "xlsx",
      status: "ready",
      url: "/downloads/reporte_octubre.xlsx",
      createdAt: new Date("2025-10-20T02:37:14.653Z"),
      sizeMB: 3.2,
      requestedBy: "admin",
      filters: {
        type: "contacts",
        month: "octubre"
      },
      resultCount: 280
    };

    const exportResult1 = await mongoose.connection.db.collection('exports').insertOne(exportData1);
    const exportResult2 = await mongoose.connection.db.collection('exports').insertOne(exportData2);
    
    console.log('Datos de exports insertados:', exportResult1.insertedId, exportResult2.insertedId);

    // Verificar que se insertaron correctamente
    const historyCount = await mongoose.connection.db.collection('histories').countDocuments();
    const exportsCount = await mongoose.connection.db.collection('exports').countDocuments();
    
    console.log(`Total documentos en histories: ${historyCount}`);
    console.log(`Total documentos en exports: ${exportsCount}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

insertSampleData();