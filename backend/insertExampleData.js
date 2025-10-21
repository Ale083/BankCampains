const mongoose = require('mongoose');
require('dotenv').config();

async function insertExampleData() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bankcampains';
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a la DB');

    // Insertar datos directamente en las colecciones usando la API nativa de MongoDB
    const db = mongoose.connection.db;

    // Datos para la colección export
    const exportData = [
      {
        fileName: "reporte_contactos.csv",
        format: "csv", 
        status: "ready",
        url: "/downloads/reporte_contactos.csv",
        createdAt: new Date("2025-10-20T02:37:14.653Z"),
        sizeMB: 2.5,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requestedBy: "admin",
        filters: { edad: "25-35", estado: "activo" },
        resultCount: 150
      },
      {
        fileName: "reporte_octubre.xlsx",
        format: "xlsx",
        status: "ready", 
        url: "/downloads/reporte_octubre.xlsx",
        createdAt: new Date("2025-10-20T02:37:14.653Z"),
        sizeMB: 4.1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requestedBy: "admin",
        filters: { mes: "octubre", año: "2025" },
        resultCount: 300
      },
      {
        fileName: "reporte_pendiente.csv",
        format: "csv",
        status: "pending",
        url: "/downloads/reporte_pendiente.csv", 
        createdAt: new Date(),
        sizeMB: 0,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        requestedBy: "admin",
        filters: { tipo: "pending" },
        resultCount: 0
      }
    ];

    // Verificar si ya existen datos en export
    const existingExports = await db.collection('export').countDocuments();
    if (existingExports === 0) {
      await db.collection('export').insertMany(exportData);
      console.log(`${exportData.length} exports insertados`);
    } else {
      console.log('Ya existen datos de export, saltando inserción');
    }

    // Agregar más datos de history si no existen suficientes
    const existingHistory = await db.collection('history').countDocuments();
    if (existingHistory < 3) {
      const additionalHistoryData = [
        {
          name: "Consulta Avanzada",
          type: "búsqueda",
          description: "Búsqueda con múltiples filtros",
          filtersIncluded: ["edad", "trabajo", "estado_civil"],
          resultsCount: 87,
          createdAt: new Date("2025-10-20T01:30:00.000Z"),
          status: "success",
          filters: { edad: "30-45", trabajo: "management", estado_civil: "married" },
          notes: "Consulta compleja con buenos resultados",
          requestedBy: "admin",
          sizeMB: 1.2,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          name: "Export Fallido",
          type: "csv",
          description: "Intento de exportación que falló",
          filtersIncluded: ["filtro_problematico"],
          resultsCount: 0,
          createdAt: new Date("2025-10-20T00:15:00.000Z"),
          status: "failed",
          filters: { filtro_complejo: "valor_que_causa_error" },
          notes: "Error durante la exportación - timeout",
          requestedBy: "admin",
          sizeMB: 0,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ];

      await db.collection('history').insertMany(additionalHistoryData);
      console.log(`${additionalHistoryData.length} registros adicionales de history insertados`);
    }

    console.log('Datos de ejemplo verificados/insertados correctamente');
    
  } catch (error) {
    console.error('Error insertando datos de ejemplo:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de la DB');
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  insertExampleData();
}

module.exports = insertExampleData;