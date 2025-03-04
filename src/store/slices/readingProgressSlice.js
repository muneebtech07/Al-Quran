import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastRead: null, // {surahNumber: 1, ayahNumber: 1, timestamp: Date.now()}
  readHistory: [], // [{surahNumber: 1, ayahNumber: 1, timestamp: Date.now()}]
};

const readingProgressSlice = createSlice({
  name: 'readingProgress',
  initialState,
  reducers: {
    updateLastRead: (state, action) => {
      const { surahNumber, ayahNumber } = action.payload;
      state.lastRead = {
        surahNumber,
        ayahNumber,
        timestamp: Date.now(),
      };
      
      // Add to history, keeping only the last 20 entries
      state.readHistory.unshift({
        surahNumber,
        ayahNumber,
        timestamp: Date.now(),
      });
      
      if (state.readHistory.length > 20) {
        state.readHistory = state.readHistory.slice(0, 20);
      }
    },
    clearReadingHistory: (state) => {
      state.readHistory = [];
    },
  },
});

export const { updateLastRead, clearReadingHistory } = readingProgressSlice.actions;

export default readingProgressSlice.reducer;