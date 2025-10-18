// acá vamos a manejar todo todo lo de la carga, entonces validamos y subimos y sacamos la info para el reporte de calidad

const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const Contact = require('../../model/contact');

const router = express.Router();


const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: {
    fileSize: 50 * 1024 * 1024, // esto pq son 50MB max
    files: 1 
  },
  fileFilter: function (req, file, cb) {
  
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'), false);
    }
  }
});

// nulos
const isNullish = (value) => {
  const s = value === undefined || value === null ? '' : String(value).trim();
  return s === '' || s.toLowerCase() === 'null';
};

// validaciones
const validateRecord = (row, rowIndex) => {
  const errors = [];

 
  const isEmpty = (v) => v === undefined || v === null || String(v).trim() === '';
  const requiredFields = [
    'age','job','marital','education','default','housing','loan','contact','month','day_of_week',
    'duration','campaign','pdays','previous','poutcome','emp.var.rate','cons.price.idx','cons.conf.idx',
    'euribor3m','nr.employed','y'
  ];
  for (const f of requiredFields) {
    if (isEmpty(row[f])) {
      errors.push(`${f} es requerido y no puede ser nulo/vacío`);
    }
  }
  

  const age = parseInt(row.age);
  if (isNaN(age) || age < 17 || age > 98) {
    errors.push(`age debe ser un número entero entre 17 y 98, recibido: ${row.age}`);
  }
  

  const validJobs = ['admin.', 'blue-collar', 'entrepreneur', 'housemaid', 'management', 
                    'retired', 'self-employed', 'services', 'student', 'technician', 
                    'unemployed', 'unknown'];
  if (!validJobs.includes(row.job)) {
    errors.push(`job debe ser uno de [${validJobs.join(', ')}], recibido: ${row.job}`);
  }
  

  const validMarital = ['divorced', 'married', 'single', 'unknown'];
  if (!validMarital.includes(row.marital)) {
    errors.push(`marital debe ser uno de [${validMarital.join(', ')}], recibido: ${row.marital}`);
  }
  

  const validEducation = ['basic.4y', 'basic.6y', 'basic.9y', 'high.school', 'illiterate', 
                         'professional.course', 'university.degree', 'unknown'];
  if (!validEducation.includes(row.education)) {
    errors.push(`education debe ser uno de [${validEducation.join(', ')}], recibido: ${row.education}`);
  }
  

  const validDefault = ['yes', 'no', 'unknown'];
  if (!validDefault.includes(row.default)) {
    errors.push(`default debe ser uno de [${validDefault.join(', ')}], recibido: ${row.default}`);
  }
  

  const validHousing = ['yes', 'no', 'unknown'];
  if (!validHousing.includes(row.housing)) {
    errors.push(`housing debe ser uno de [${validHousing.join(', ')}], recibido: ${row.housing}`);
  }
  

  const validLoan = ['yes', 'no', 'unknown'];
  if (!validLoan.includes(row.loan)) {
    errors.push(`loan debe ser uno de [${validLoan.join(', ')}], recibido: ${row.loan}`);
  }
  

  const validContact = ['cellular', 'telephone'];
  if (!validContact.includes(row.contact)) {
    errors.push(`contact debe ser uno de [${validContact.join(', ')}], recibido: ${row.contact}`);
  }
  
  
  const validMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  if (!validMonths.includes(row.month)) {
    errors.push(`month debe ser uno de [${validMonths.join(', ')}], recibido: ${row.month}`);
  }
  
  
  const validDays = ['mon', 'tue', 'wed', 'thu', 'fri'];
  if (!validDays.includes(row.day_of_week)) {
    errors.push(`day_of_week debe ser uno de [${validDays.join(', ')}], recibido: ${row.day_of_week}`);
  }
  
  
  const duration = parseInt(row.duration);
  if (isNaN(duration) || duration < 0 || duration > 4918) {
    errors.push(`duration debe ser un número entero entre 0 y 4918, recibido: ${row.duration}`);
  }
  
 
  const campaign = parseInt(row.campaign);
  if (isNaN(campaign) || campaign < 1 || campaign > 56) {
    errors.push(`campaign debe ser un número entero entre 1 y 56, recibido: ${row.campaign}`);
  }
  
  
  const pdays = parseInt(row.pdays);
  if (isNaN(pdays) || pdays < 0 || pdays > 999) {
    errors.push(`pdays debe ser un número entero entre 0 y 999, recibido: ${row.pdays}`);
  }
  
  
  const previous = parseInt(row.previous);
  if (isNaN(previous) || previous < 0 || previous > 7) {
    errors.push(`previous debe ser un número entero entre 0 y 7, recibido: ${row.previous}`);
  }
  
  
  const validPoutcome = ['failure', 'nonexistent', 'success'];
  if (!validPoutcome.includes(row.poutcome)) {
    errors.push(`poutcome debe ser uno de [${validPoutcome.join(', ')}], recibido: ${row.poutcome}`);
  }
  
  
  const empVarRate = parseFloat(row['emp.var.rate']);
  if (isNaN(empVarRate) || empVarRate < -3.4 || empVarRate > 1.4) {
    errors.push(`emp.var.rate debe ser un número entre -3.4 y 1.4, recibido: ${row['emp.var.rate']}`);
  }
  
  
  const consPriceIdx = parseFloat(row['cons.price.idx']);
  if (isNaN(consPriceIdx) || consPriceIdx < 92.201 || consPriceIdx > 94.767) {
    errors.push(`cons.price.idx debe ser un número entre 92.201 y 94.767, recibido: ${row['cons.price.idx']}`);
  }
  
  
  const consConfIdx = parseFloat(row['cons.conf.idx']);
  if (isNaN(consConfIdx) || consConfIdx < -50.8 || consConfIdx > -26.9) {
    errors.push(`cons.conf.idx debe ser un número entre -50.8 y -26.9, recibido: ${row['cons.conf.idx']}`);
  }
  
  
  const euribor3m = parseFloat(row.euribor3m);
  if (isNaN(euribor3m) || euribor3m < 0.634 || euribor3m > 5.045) {
    errors.push(`euribor3m debe ser un número entre 0.634 y 5.045, recibido: ${row.euribor3m}`);
  }
  
  
  const nrEmployed = parseFloat(row['nr.employed']);
  if (isNaN(nrEmployed) || nrEmployed < 4963.6 || nrEmployed > 5228.1) {
    errors.push(`nr.employed debe ser un número entre 4963.6 y 5228.1, recibido: ${row['nr.employed']}`);
  }
  
 
  const validY = ['yes', 'no'];
  if (!validY.includes(row.y)) {
    errors.push(`y debe ser 'yes' o 'no', recibido: ${row.y}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    rowIndex: rowIndex + 1 
  };
};

// mapeo del csv a mongo
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

// sube
const uploadCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No se ha subido ningún archivo' 
      });
    }

    const validContacts = [];
    const rejectedRecords = [];
    const { Readable } = require('stream');
    let rowIndex = 0;
    

    const columnsSet = new Set();
    const nullsCountByCol = new Map();
   
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    
    
    bufferStream
      .pipe(csv({ separator: ';' })) 
      .on('data', (row) => {
        try {
          
          Object.keys(row).forEach((k) => {
            if (typeof row[k] === 'string') {
              row[k] = row[k].trim();
            }
          });

          
          Object.keys(row).forEach((k) => {
            columnsSet.add(k);
            if (isNullish(row[k])) {
              nullsCountByCol.set(k, (nullsCountByCol.get(k) || 0) + 1);
            }
          });

          const validation = validateRecord(row, rowIndex);
          
          if (validation.isValid) {
            const contact = mapCsvToContact(row);
            validContacts.push(contact);
          } else {
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

          // borramos todo antes de insertar lo nuevo para solo tener los datos del csv actual
          try {
            await Contact.deleteMany({});
          } catch (clearErr) {
            console.error('No se pudo limpiar la colección Contact antes de insertar:', clearErr);
            return res.status(500).json({
              error: 'No se pudo limpiar la colección antes de la carga',
              details: clearErr.message
            });
          }

          if (validContacts.length > 0) {
            try {
              insertedRecords = await Contact.insertMany(validContacts, { ordered: false });
            } catch (dbError) {
              console.error('Error insertando en la base de datos:', dbError);
              
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
          
          // para el reporte de calidad
          const totalRecords = rowIndex;
          const columns = Array.from(columnsSet);
          const nullsByColumn = Array.from(nullsCountByCol.entries()).map(([name, nulls]) => ({
            name,
            nulls,
            percent: totalRecords ? +((nulls * 100) / totalRecords).toFixed(1) : 0,
          }));
          const totalNulls = nullsByColumn.reduce((a, c) => a + c.nulls, 0);
          const columnCount = columns.length || 1;
          const nullPercent = (totalRecords && columnCount)
            ? +(((totalNulls) / (totalRecords * columnCount)) * 100).toFixed(1)
            : 0;

          
          const rejectedCount = rejectedRecords.length;
          const percentRejected = totalRecords ? +(((rejectedCount) / totalRecords) * 100).toFixed(1) : 0;
          const qualityScore = Math.max(0, +(100 - nullPercent - percentRejected).toFixed(1));
         
          const response = {
            message: 'Procesamiento de CSV completado',
            summary: {
              totalRecords: rowIndex,
              validRecords: validContacts.length,
              insertedRecords: insertedRecords.length,
              rejectedRecords: rejectedRecords.length,
              dbErrors: dbErrors.length,
     
              // esto que falta es para el reporte
              columns,
              nullsByColumn,
              nullPercent,
              percentRejected,
              qualityScore
            }
          };
          
         
          if (rejectedRecords.length > 0) {
            response.rejectedRecords = rejectedRecords;
          }
          
          
          if (dbErrors.length > 0) {
            response.databaseErrors = dbErrors;
          }
          
          
          if (insertedRecords.length === 0 && validContacts.length > 0) {
            
            res.status(500).json({
              ...response,
              error: 'No se pudo insertar ningún registro válido en la base de datos'
            });
          } else if (rejectedRecords.length > 0 || dbErrors.length > 0) {
            res.status(207).json(response);
          } else {
            res.status(200).json(response);
          }
          
        } catch (error) {
          console.error('Error en el procesamiento final:', error);
          
          res.status(500).json({
            error: 'Error en el procesamiento final del CSV',
            details: error.message
          });
        }
      })
      .on('error', (error) => {
        console.error('Error leyendo el archivo CSV:', error);
        
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


router.post('/upload-csv', upload.single('csvFile'), uploadCsv);


module.exports = router;