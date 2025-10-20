import { create } from 'zustand';

export const useSessionData = create((set) => ({
  rows: [],
  columns: [],
  setData: ({ rows, columns }) => set({ rows, columns }),
  clear: () => set({ rows: [], columns: [] })
}));
