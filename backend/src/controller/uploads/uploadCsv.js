const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Contact = require('../../model/contact');

const router = express.Router();

// Asegurar que la carpeta uploads existe
const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para manejar archivos CSV
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Solo permitir archivos CSV
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'), false);
    }
  }
});

// Función para validar un registro según las especificaciones
const validateRecord = (row, rowIndex) => {
  const errors = [];
  
  // Validar age (17-98)
  const age = parseInt(row.age);
  if (isNaN(age) || age < 17 || age > 98) {
    errors.push(`age debe ser un número entero entre 17 y 98, recibido: ${row.age}`);
  }
  
  // Validar job
  const validJobs = ['admin.', 'blue-collar', 'entrepreneur', 'housemaid', 'management', 
                    'retired', 'self-employed', 'services', 'student', 'technician', 
                    'unemployed', 'unknown'];
  if (!validJobs.includes(row.job)) {
    errors.push(`job debe ser uno de [${validJobs.join(', ')}], recibido: ${row.job}`);
  }
  
  // Validar marital
  const validMarital = ['divorced', 'married', 'single', 'unknown'];
  if (!validMarital.includes(row.marital)) {
    errors.push(`marital debe ser uno de [${validMarital.join(', ')}], recibido: ${row.marital}`);
  }
  
  // Validar education
  const validEducation = ['basic.4y', 'basic.6y', 'basic.9y', 'high.school', 'illiterate', 
                         'professional.course', 'university.degree', 'unknown'];
  if (!validEducation.includes(row.education)) {
    errors.push(`education debe ser uno de [${validEducation.join(', ')}], recibido: ${row.education}`);
  }
  
  // Validar default
  const validDefault = ['yes', 'no', 'unknown'];
  if (!validDefault.includes(row.default)) {
    errors.push(`default debe ser uno de [${validDefault.join(', ')}], recibido: ${row.default}`);
  }
  
  // Validar housing
  const validHousing = ['yes', 'no', 'unknown'];
  if (!validHousing.includes(row.housing)) {
    errors.push(`housing debe ser uno de [${validHousing.join(', ')}], recibido: ${row.housing}`);
  }
  
  // Validar loan
  const validLoan = ['yes', 'no', 'unknown'];
  if (!validLoan.includes(row.loan)) {
    errors.push(`loan debe ser uno de [${validLoan.join(', ')}], recibido: ${row.loan}`);
  }
  
  // Validar contact
  const validContact = ['cellular', 'telephone'];
  if (!validContact.includes(row.contact)) {
    errors.push(`contact debe ser uno de [${validContact.join(', ')}], recibido: ${row.contact}`);
  }
  
  // Validar month
  const validMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  if (!validMonths.includes(row.month)) {
    errors.push(`month debe ser uno de [${validMonths.join(', ')}], recibido: ${row.month}`);
  }
  
  // Validar day_of_week
  const validDays = ['mon', 'tue', 'wed', 'thu', 'fri'];
  if (!validDays.includes(row.day_of_week)) {
    errors.push(`day_of_week debe ser uno de [${validDays.join(', ')}], recibido: ${row.day_of_week}`);
  }
  
  // Validar duration (>= 0, <= 4918)
  const duration = parseInt(row.duration);
  if (isNaN(duration) || duration < 0 || duration > 4918) {
    errors.push(`duration debe ser un número entero entre 0 y 4918, recibido: ${row.duration}`);
  }
  
  // Validar campaign (1-56)
  const campaign = parseInt(row.campaign);
  if (isNaN(campaign) || campaign < 1 || campaign > 56) {
    errors.push(`campaign debe ser un número entero entre 1 y 56, recibido: ${row.campaign}`);
  }
  
  // Validar pdays (0-999)
  const pdays = parseInt(row.pdays);
  if (isNaN(pdays) || pdays < 0 || pdays > 999) {
    errors.push(`pdays debe ser un número entero entre 0 y 999, recibido: ${row.pdays}`);
  }
  
  // Validar previous (0-7)
  const previous = parseInt(row.previous);
  if (isNaN(previous) || previous < 0 || previous > 7) {
    errors.push(`previous debe ser un número entero entre 0 y 7, recibido: ${row.previous}`);
  }
  
  // Validar poutcome
  const validPoutcome = ['failure', 'nonexistent', 'success'];
  if (!validPoutcome.includes(row.poutcome)) {
    errors.push(`poutcome debe ser uno de [${validPoutcome.join(', ')}], recibido: ${row.poutcome}`);
  }
  
  // Validar emp.var.rate (-3.4 a 1.4)
  const empVarRate = parseFloat(row['emp.var.rate']);
  if (isNaN(empVarRate) || empVarRate < -3.4 || empVarRate > 1.4) {
    errors.push(`emp.var.rate debe ser un número entre -3.4 y 1.4, recibido: ${row['emp.var.rate']}`);
  }
  
  // Validar cons.price.idx (92.201 a 94.767)
  const consPriceIdx = parseFloat(row['cons.price.idx']);
  if (isNaN(consPriceIdx) || consPriceIdx < 92.201 || consPriceIdx > 94.767) {
    errors.push(`cons.price.idx debe ser un número entre 92.201 y 94.767, recibido: ${row['cons.price.idx']}`);
  }
  
  // Validar cons.conf.idx (-50.8 a -26.9)
  const consConfIdx = parseFloat(row['cons.conf.idx']);
  if (isNaN(consConfIdx) || consConfIdx < -50.8 || consConfIdx > -26.9) {
    errors.push(`cons.conf.idx debe ser un número entre -50.8 y -26.9, recibido: ${row['cons.conf.idx']}`);
  }
  
  // Validar euribor3m (0.634 a 5.045)
  const euribor3m = parseFloat(row.euribor3m);
  if (isNaN(euribor3m) || euribor3m < 0.634 || euribor3m > 5.045) {
    errors.push(`euribor3m debe ser un número entre 0.634 y 5.045, recibido: ${row.euribor3m}`);
  }
  
  // Validar nr.employed (4963.6 a 5228.1)
  const nrEmployed = parseFloat(row['nr.employed']);
  if (isNaN(nrEmployed) || nrEmployed < 4963.6 || nrEmployed > 5228.1) {
    errors.push(`nr.employed debe ser un número entre 4963.6 y 5228.1, recibido: ${row['nr.employed']}`);
  }
  
  // Validar y (objetivo)
  const validY = ['yes', 'no'];
  if (!validY.includes(row.y)) {
    errors.push(`y debe ser 'yes' o 'no', recibido: ${row.y}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    rowIndex: rowIndex + 1 // +1 para mostrar número de línea real (incluyendo header)
  };
};

// Función para mapear los datos del CSV al esquema de Contact
const mapCsvToContact = (row) => {
  return {
    age: parseInt(row.age),
    job: row.job,
    marital: row.marital,
    education: row.education,
    default: row.default,
    housing: row.housing,
    loan: row.loan,
    contact: row.contact,
    month: row.month,
    day_of_week: row.day_of_week,
    duration: parseInt(row.duration),
    campaign: parseInt(row.campaign),
    pdays: parseInt(row.pdays),
    previous: parseInt(row.previous),
    poutcome: row.poutcome,
    emp_var_rate: parseFloat(row['emp.var.rate']),
    cons_price_idx: parseFloat(row['cons.price.idx']),
    cons_conf_idx: parseFloat(row['cons.conf.idx']),
    euribor3m: parseFloat(row.euribor3m),
    nr_employed: parseFloat(row['nr.employed']),
    y: row.y
  };
};

// Controlador para cargar CSV
const uploadCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No se ha subido ningún archivo' 
      });
    }

    const validContacts = [];
    const rejectedRecords = [];
    const filePath = req.file.path;
    let rowIndex = 0;
    
    // Leer y procesar el archivo CSV
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' })) // El CSV usa punto y coma como separador
      .on('data', (row) => {
        try {
          // Validar el registro
          const validation = validateRecord(row, rowIndex);
          
          if (validation.isValid) {
            // Si es válido, mapearlo y agregarlo a los contactos válidos
            const contact = mapCsvToContact(row);
            validContacts.push(contact);
          } else {
            // Si no es válido, agregarlo a los registros rechazados
            rejectedRecords.push({
              row: validation.rowIndex,
              data: row,
              errors: validation.errors
            });
          }
          
          rowIndex++;
        } catch (error) {
          console.error('Error procesando fila:', error);
          rejectedRecords.push({
            row: rowIndex + 1,
            data: row,
            errors: [`Error de procesamiento: ${error.message}`]
          });
          rowIndex++;
        }
      })
      .on('end', async () => {
        try {
          let insertedRecords = [];
          let dbErrors = [];
          
          // Solo intentar insertar si hay contactos válidos
          if (validContacts.length > 0) {
            try {
              insertedRecords = await Contact.insertMany(validContacts, { ordered: false });
            } catch (dbError) {
              // Si hay errores de base de datos, procesarlos individualmente
              console.error('Error insertando en la base de datos:', dbError);
              
              // Intentar insertar uno por uno para identificar registros problemáticos
              for (let i = 0; i < validContacts.length; i++) {
                try {
                  const result = await Contact.create(validContacts[i]);
                  insertedRecords.push(result);
                } catch (individualError) {
                  dbErrors.push({
                    record: i + 1,
                    data: validContacts[i],
                    error: individualError.message
                  });
                }
              }
            }
          }
          
          // Eliminar el archivo temporal
          fs.unlinkSync(filePath);
          
          // Preparar respuesta detallada
          const response = {
            message: 'Procesamiento de CSV completado',
            summary: {
              totalRecords: rowIndex,
              validRecords: validContacts.length,
              insertedRecords: insertedRecords.length,
              rejectedRecords: rejectedRecords.length,
              dbErrors: dbErrors.length
            }
          };
          
          // Agregar detalles de registros rechazados si los hay
          if (rejectedRecords.length > 0) {
            response.rejectedRecords = rejectedRecords;
          }
          
          // Agregar errores de base de datos si los hay
          if (dbErrors.length > 0) {
            response.databaseErrors = dbErrors;
          }
          
          // Determinar código de estado HTTP
          if (insertedRecords.length === 0 && validContacts.length > 0) {
            // Todos los registros válidos fallaron en la inserción
            res.status(500).json({
              ...response,
              error: 'No se pudo insertar ningún registro válido en la base de datos'
            });
          } else if (rejectedRecords.length > 0 || dbErrors.length > 0) {
            // Algunos registros fueron rechazados o tuvieron errores
            res.status(207).json(response); // 207 Multi-Status
          } else {
            // Todo fue exitoso
            res.status(200).json(response);
          }
          
        } catch (error) {
          console.error('Error en el procesamiento final:', error);
          
          // Eliminar el archivo temporal
          fs.unlinkSync(filePath);
          
          res.status(500).json({
            error: 'Error en el procesamiento final del CSV',
            details: error.message
          });
        }
      })
      .on('error', (error) => {
        console.error('Error leyendo el archivo CSV:', error);
        
        // Eliminar el archivo temporal
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        res.status(500).json({
          error: 'Error procesando el archivo CSV',
          details: error.message
        });
      });

  } catch (error) {
    console.error('Error en uploadCsv:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
};

// Ruta para subir CSV
router.post('/upload-csv', upload.single('csvFile'), uploadCsv);

// Ruta para obtener todos los contactos (opcional, para verificar la carga)
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().limit(100); // Limitar a 100 para no sobrecargar
    res.json({
      message: 'Contactos obtenidos exitosamente',
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo contactos',
      details: error.message
    });
  }
});

module.exports = router;