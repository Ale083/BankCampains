const History = require('../../model/history');

exports.add = async ({ name = 'Consulta', type = 'kpi', filters = {}, resultCount = 0, notes = '', description = '' }) => {
  const historyItem = new History({
    name,
    type,
    description: description || notes,
    filtersIncluded: Object.keys(filters),
    resultsCount: resultCount,
    status: 'success',
    filters,
    sizeMB: 0,
    notes,
    requestedBy: 'admin',
  });
  
  const savedItem = await historyItem.save();
  
  
  return {
    id: savedItem._id.toString(),
    name: savedItem.name,
    type: savedItem.type,
    status: savedItem.status,
    createdAt: savedItem.createdAt.toISOString(),
    filters: savedItem.filters,
    resultCount: savedItem.resultsCount,
    sizeMB: savedItem.sizeMB,
    expiresAt: savedItem.expiresAt.toISOString(),
    notes: savedItem.notes,
    requestedBy: savedItem.requestedBy,
  };
};

exports.list = async (q = {}) => {
  let query = {};
  

  if (q.status) {
    const statuses = String(q.status).split(',').map((s) => s.trim().toLowerCase());
    query.status = { $in: statuses };
  }
  
  if (q.type) {
    const types = String(q.type).split(',').map((s) => s.trim().toLowerCase());
    query.type = { $in: types };
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
  
  const historyItems = await History.find(query).sort({ createdAt: -1 }).lean();
  
  
  const items = historyItems.map(item => ({
    id: item._id.toString(),
    name: item.name,
    type: item.type,
    status: item.status || 'success',
    createdAt: item.createdAt.toISOString(),
    filters: item.filters || {},
    resultCount: item.resultsCount || item.resultCount || 0,
    sizeMB: item.sizeMB || 0,
    expiresAt: item.expiresAt ? item.expiresAt.toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    notes: item.notes || item.description || '',
    requestedBy: item.requestedBy || 'admin',
  }));
  
  return { items };
};

exports.remove = async (id) => {
  try {
    const result = await History.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error('Error removing history item:', error);
    return false;
  }
};

exports.retry = async (ids = []) => {
  const created = [];
  
  for (const id of ids) {
    try {
      const src = await History.findById(id);
      if (!src) continue;
      
      const newItem = await exports.add({
        name: `Retry ${src.name}`,
        type: src.type,
        filters: src.filters,
        resultCount: src.resultsCount,
        notes: src.notes,
        description: src.description,
      });
      created.push(newItem);
    } catch (error) {
      console.error('Error retrying history item:', error);
    }
  }
  
  return { created };
};
