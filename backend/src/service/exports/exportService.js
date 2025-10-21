const Export = require('../../model/export');
const path = require('path');
const fs = require('fs').promises;

exports.add = async ({ fileName, format, status = 'pending', url, sizeMB = 0, requestedBy = 'admin', filters = {}, resultCount = 0 }) => {
  const exportItem = new Export({
    fileName,
    format,
    status,
    url,
    sizeMB,
    requestedBy,
    filters,
    resultCount
  });
  
  const savedItem = await exportItem.save();
  
  // Convertir el resultado para compatibilidad con el frontend
  return {
    id: savedItem._id.toString(),
    fileName: savedItem.fileName,
    format: savedItem.format,
    status: savedItem.status,
    url: savedItem.url,
    createdAt: savedItem.createdAt.toISOString(),
    sizeMB: savedItem.sizeMB,
    expiresAt: savedItem.expiresAt.toISOString(),
    requestedBy: savedItem.requestedBy,
    filters: savedItem.filters,
    resultCount: savedItem.resultCount
  };
};

exports.list = async (q = {}) => {
  let query = {};
  
  // Filtros: status, format (type), requestedBy, from, to
  if (q.status) {
    const statuses = String(q.status).split(',').map((s) => s.trim().toLowerCase());
    query.status = { $in: statuses };
  }
  
  if (q.type) {
    const formats = String(q.type).split(',').map((s) => s.trim().toLowerCase());
    // Mapear 'excel' a 'xlsx' para compatibilidad
    const mappedFormats = formats.map(f => f === 'excel' ? 'xlsx' : f);
    query.format = { $in: mappedFormats };
  }
  
  if (q.requestedBy) {
    const requestedByList = String(q.requestedBy).split(',').map((s) => s.trim().toLowerCase());
    query.requestedBy = { $in: requestedByList };
  }
  
  if (q.from || q.to) {
    query.createdAt = {};
    if (q.from) {
      query.createdAt.$gte = new Date(q.from);
    }
    if (q.to) {
      query.createdAt.$lte = new Date(q.to);
    }
  }
  
  const exportItems = await Export.find(query).sort({ createdAt: -1 }).lean();
  
  // Convertir los resultados para compatibilidad con el frontend
  const items = exportItems.map(item => ({
    id: item._id.toString(),
    name: item.fileName ? item.fileName.replace(/\.[^/.]+$/, "") : 'Export', // nombre sin extensión
    fileName: item.fileName,
    type: item.format === 'xlsx' ? 'excel' : item.format, // mapear xlsx a excel para el frontend
    format: item.format,
    status: item.status,
    url: item.url,
    createdAt: item.createdAt.toISOString(),
    sizeMB: item.sizeMB || 0,
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    requestedBy: item.requestedBy || 'admin',
    filters: item.filters || {},
    resultCount: item.resultCount || 0
  }));
  
  return { items };
};

exports.remove = async (id) => {
  try {
    const exportItem = await Export.findById(id);
    if (exportItem) {
      // Intentar eliminar el archivo físico si existe
      try {
        const filePath = path.join(process.cwd(), 'public', exportItem.url);
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('Could not delete physical file:', fileError.message);
      }
    }
    
    const result = await Export.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error('Error removing export item:', error);
    return false;
  }
};

exports.updateStatus = async (id, status) => {
  try {
    const result = await Export.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return !!result;
  } catch (error) {
    console.error('Error updating export status:', error);
    return false;
  }
};

exports.findById = async (id) => {
  try {
    const exportItem = await Export.findById(id).lean();
    if (!exportItem) return null;
    
    return {
      id: exportItem._id.toString(),
      fileName: exportItem.fileName,
      format: exportItem.format,
      status: exportItem.status,
      url: exportItem.url,
      createdAt: exportItem.createdAt.toISOString(),
      sizeMB: exportItem.sizeMB,
      expiresAt: exportItem.expiresAt.toISOString(),
      requestedBy: exportItem.requestedBy,
      filters: exportItem.filters,
      resultCount: exportItem.resultCount
    };
  } catch (error) {
    console.error('Error finding export by id:', error);
    return null;
  }
};