import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import Header from '../components/Header';
import './styles.css';
import { useNavigate } from 'react-router-dom';
import { useSessionData } from '../store/useSessionData';
import { useFilters } from '../store/useFilters';
import DataTable from '../components/DataTable';
import { apiFetch } from '../api/client';

const requisitos = [
  'Formato CSV',
  'Máximo 50 MB',
  'Delimitador: punto y coma ( ; )',
  'Encoding: UTF-8 (recomendado)',
  'Separador Decimal: punto ( . )',
  'Campos requeridos: 21 columnas de campañas bancarias'
];

export default function CsvUpload({ onNext }) {
  const { setData } = useSessionData();
  const [csvData, setCsvData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef();
  const [fileObj, setFileObj] = useState(null);
  const navigate = useNavigate();
  const { setDataset, setFilter } = useFilters();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage('Error: El archivo es demasiado grande. Máximo permitido: 50MB');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage(' Error: Solo se permiten archivos CSV');
      return;
    }

    setFileName(file.name);
    setFileObj(file);
    setLoading(true);
    setProgress(10);
    setMessage('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';',
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

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) processFile(files[0]);
  };

  const handleUpload = async () => {
    if (!fileObj) return;
    setLoading(true);
    setMessage('');
    setProgress(30);

    const formData = new FormData();
    formData.append('csvFile', fileObj);

    try {
      const res = await apiFetch('/api/uploads/upload-csv', { method: 'POST', body: formData });
      setProgress(80);
      const data = await res.json();

      if (res.ok) {
        const { summary } = data;
        setUploadResult(data);

        const datasetId = data.batchId || data.datasetId || 'default';
        setDataset(datasetId);
        setFilter({}); 

        let messageText = '';
        if (summary) {
          messageText = `Total: ${summary.totalRecords} registros`;
          messageText += `\nAceptados: ${summary.insertedRecords}`;
          messageText += `\nRechazados: ${summary.rejectedRecords}`;
          if (summary.dbErrors > 0) {
            messageText += `\nErrores de BD: ${summary.dbErrors}`;
          }
        }
        setMessage(messageText);

        
        try {
          const contactsRes = await apiFetch('/api/contacts/list');
          const contactsData = await contactsRes.json();
          if (contactsData.ok && contactsData.data) {
            setData({ rows: contactsData.data, columns: summary.columns || columns });
          }
        } catch (err) {
          console.error('Error cargando contactos desde BD:', err);
          
          setData({ rows: csvData, columns });
        }

        // Señal para Header: upload exitoso, re-habilitar navegación
        localStorage.setItem('dataUploaded', Date.now().toString());

        // vamos al reporte pero pasa los datos para el reporte
        navigate('/reporte', { state: { result: data, columns, fileName } });
      } else {
        setUploadResult(null);
        setMessage(` Error: ${data.error || 'No se pudo cargar el archivo.'}`);
      }
    } catch (err) {
      setMessage('Error de red o servidor.');
      console.error('Error de upload:', err);
    }

    setLoading(false);
    setProgress(100);
    if (onNext) onNext();
  };

  return (
    <div className="csv-upload-container">
      <Header title="Carga de datos" />

      <div className="csv-upload-content">
        <div className="csv-upload-layout">
          <div className="requirements-section">
            <h3>Requisitos de archivo</h3>
            <ul className="requirements-list">
              {requisitos.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          <div className="upload-area">
            <div
              className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="file-input"
                id="csvInput"
                ref={fileRef}
              />
              <label htmlFor="csvInput" className={`file-label ${isDragOver ? 'drag-over' : ''}`}>
                {isDragOver ? ' Suelte el archivo aquí' : ' Suelte el archivo aquí o seleccione archivo'}
              </label>

              {fileName && <div className="file-name">Archivo seleccionado: {fileName}</div>}

              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>

              {message && <div className="upload-message">{message}</div>}
            </div>

            <div className="button-container">
              <button
                disabled={!csvData.length || loading}
                className="upload-button"
                onClick={handleUpload}
              >
                {loading ? 'Procesando...' : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>

        {csvData.length > 0 && (
          <div className="preview-section">
            <h4>Vista Previa </h4>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>{columns.map((col) => (<th key={col}>{col}</th>))}</tr>
                </thead>
                <tbody>
                  {csvData.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((col) => (<td key={col}>{row[col]}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}
