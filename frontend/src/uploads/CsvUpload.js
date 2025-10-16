import React, { useState, useRef } from 'react';
import Papa from 'papaparse';

const requisitos = [
  'Formato CSV',
  'Máximo 100 MB',
  'Delimitador: punto y coma ( ; )',
  'Encoding: UTF-8 (recomendado)',
  'Separador Decimal: punto ( . )',
  'Campos requeridos: 21 columnas de campañas bancarias'
];

export default function CsvUpload({ onNext }) {
  const [csvData, setCsvData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const fileRef = useRef();
  const [fileObj, setFileObj] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setFileObj(file);
    setLoading(true);
    setProgress(10);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';', // Configurar delimitador para punto y coma
      complete: (results) => {
        setProgress(80);
        setCsvData(results.data);
        setColumns(results.meta.fields);
        setProgress(100);
        setLoading(false);
      },
      error: () => {
        setLoading(false);
        setProgress(0);
      },
    });
  };

  const handleUpload = async () => {
    if (!fileObj) return;
    setLoading(true);
    setMessage('');
    setProgress(30);
    const formData = new FormData();
    formData.append('csvFile', fileObj); // Cambiar 'file' por 'csvFile'
    try {
      const res = await fetch('/api/uploads/upload-csv', { // Corregir URL
        method: 'POST',
        body: formData,
      });
      setProgress(80);
      const data = await res.json();
      
      if (res.ok) {
        // Manejar la nueva estructura de respuesta
        const { summary } = data;
        setUploadResult(data);
        
        let messageText = `✔ ${data.message}`;
        
        if (summary) {
          messageText += `\n📊 Total: ${summary.totalRecords}, Válidos: ${summary.validRecords}, Insertados: ${summary.insertedRecords}`;
          
          if (summary.rejectedRecords > 0) {
            messageText += `\n⚠️ Registros rechazados: ${summary.rejectedRecords}`;
          }
          
          if (summary.dbErrors > 0) {
            messageText += `\n❌ Errores de BD: ${summary.dbErrors}`;
          }
        }
        
        setMessage(messageText);
      } else {
        setUploadResult(null);
        setMessage(`✖ Error: ${data.error || 'No se pudo cargar el archivo.'}`);
      }
    } catch (err) {
      setMessage('✖ Error de red o servidor.');
      console.error('Error de upload:', err);
    }
    setLoading(false);
    setProgress(100);
    if (onNext) onNext();
  };

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ color: '#1976d2', textAlign: 'center' }}>Carga de datos</h2>
      
      {/* Fila superior: Requisitos y área de carga */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
        <div style={{ minWidth: 250, border: '1px solid #bbb', borderRadius: 8, padding: 16 }}>
          <h3>Requisitos de archivo</h3>
          <ul>
            {requisitos.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ border: '1px solid #bbb', borderRadius: 8, padding: 24, textAlign: 'center', marginBottom: 8 }}>
            <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} id="csvInput" ref={fileRef} />
            <label htmlFor="csvInput" style={{ cursor: 'pointer', fontSize: 20 }}>
              Suelte el archivo aquí o seleccione archivo
            </label>
            <div style={{ marginTop: 8, fontSize: 14, color: '#888' }}>
              {fileName && `Nombre del dataset: ${fileName}`}
            </div>
            <div style={{ marginTop: 16, height: 8, background: '#e0e0e0', borderRadius: 4 }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#1976d2', borderRadius: 4, transition: 'width 0.3s' }} />
            </div>
            {message && <div style={{ marginTop: 12, color: message.startsWith('✔') ? 'green' : 'red', fontWeight: 500, whiteSpace: 'pre-line' }}>{message}</div>}
          </div>
          
          {/* Mostrar detalles de errores si los hay */}
          {uploadResult && uploadResult.rejectedRecords && uploadResult.rejectedRecords.length > 0 && (
            <div style={{ marginBottom: 16, border: '1px solid #f44336', borderRadius: 4, padding: 12, backgroundColor: '#ffebee' }}>
              <h4 style={{ color: '#d32f2f', margin: '0 0 8px 0' }}>Registros Rechazados ({uploadResult.rejectedRecords.length})</h4>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {uploadResult.rejectedRecords.slice(0, 10).map((record, idx) => (
                  <div key={idx} style={{ marginBottom: 8, padding: 8, backgroundColor: 'white', borderRadius: 4 }}>
                    <strong>Fila {record.row}:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                      {record.errors.map((error, errorIdx) => (
                        <li key={errorIdx} style={{ fontSize: 12, color: '#d32f2f' }}>{error}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                {uploadResult.rejectedRecords.length > 10 && (
                  <div style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>
                    Y {uploadResult.rejectedRecords.length - 10} registros más...
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <button
              disabled={!csvData.length || loading}
              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 24px', fontSize: 16, cursor: 'pointer' }}
              onClick={handleUpload}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
      
      {/* Vista previa abajo */}
      {csvData.length > 0 && (
        <div>
          <h4>Vista Previa</h4>
          <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col} style={{ borderBottom: '1px solid #ccc', padding: 4, background: '#f5f5f5' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td key={col} style={{ borderBottom: '1px solid #eee', padding: 4 }}>{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
