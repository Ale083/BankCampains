import { create } from 'zustand';   

export const useFilters = create((set) => ({
  datasetId: null,
  filter: {},
  setDataset: (id) => set({ datasetId: id || null }),
  setFilter:  (f)  => set({ filter: f || {} }),
}));
