const mongoose = require('mongoose');
require('dotenv').config();

// Importar los modelos
const History = require('./src/model/history');
const Export = require('./src/model/export');

async function insertSampleData() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bankcampains';
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a la DB');

    // Limpiar datos existentes (opcional)
    await History.deleteMany({});
    await Export.deleteMany({});
    console.log('Datos anteriores eliminados');

    // Insertar datos de ejemplo para exports
    const exports = [
      {
        fileName: "reporte_contactos.csv",
        format: "csv",
        status: "ready",
        url: "/downloads/reporte_contactos.csv",
        sizeMB: 2.5,
        requestedBy: "admin",
        filters: { edad: "25-35", estado: "activo" },
        resultCount: 150
      },
      {
        fileName: "reporte_octubre.xlsx",
        format: "xlsx",
        status: "ready",
        url: "/downloads/reporte_octubre.xlsx",
        sizeMB: 4.1,
        requestedBy: "admin",
        filters: { mes: "octubre", año: "2025" },
        resultCount: 300
      },
      {
        fileName: "reporte_pendiente.csv",
        format: "csv",
        status: "pending",
        url: "/downloads/reporte_pendiente.csv",
        sizeMB: 0,
        requestedBy: "admin",
        filters: { tipo: "pending" },
        resultCount: 0
      }
    ];

    const insertedExports = await Export.insertMany(exports);
    console.log(`${insertedExports.length} exports insertados`);

    // Insertar datos de ejemplo para history
    const history = [
      {
        name: "Consulta 001",
        type: "búsqueda",
        description: "Prueba inicial del historial",
        filtersIncluded: ["edad", "estado"],
        resultsCount: 42,
        status: "success",
        filters: { edad: "25-35", estado: "activo" },
        notes: "Primera consulta de prueba"
      },
      {
        name: "Export CSV Contactos",
        type: "csv",
        description: "Exportación de contactos en formato CSV",
        filtersIncluded: ["edad", "estado"],
        resultsCount: 150,
        status: "success",
        filters: { edad: "25-35", estado: "activo" },
        notes: "Exportación realizada correctamente"
      },
      {
        name: "Export Excel Octubre",
        type: "excel",
        description: "Reporte mensual de octubre",
        filtersIncluded: ["mes", "año"],
        resultsCount: 300,
        status: "success",
        filters: { mes: "octubre", año: "2025" },
        notes: "Reporte mensual generado"
      },
      {
        name: "Consulta Fallida",
        type: "búsqueda",
        description: "Consulta que falló por timeout",
        filtersIncluded: ["complejo"],
        resultsCount: 0,
        status: "failed",
        filters: { filtro_complejo: "valor_problematico" },
        notes: "Error de timeout en la consulta"
      }
    ];

    const insertedHistory = await History.insertMany(history);
    console.log(`${insertedHistory.length} registros de historial insertados`);

    console.log('Datos de ejemplo insertados correctamente');
    
  } catch (error) {
    console.error('Error insertando datos de ejemplo:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de la DB');
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  insertSampleData();
}

module.exports = insertSampleData;