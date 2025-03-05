import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: []
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action) => {
      const { surahId, ayahNumber, text, timestamp } = action.payload;
      state.items.push({
        id: `${surahId}_${ayahNumber}_${timestamp}`,
        surahId,
        ayahNumber,
        text,
        timestamp
      });
    },
    updateNote: (state, action) => {
      const { id, text } = action.payload;
      const noteIndex = state.items.findIndex(note => note.id === id);
      
      if (noteIndex !== -1) {
        state.items[noteIndex].text = text;
        state.items[noteIndex].lastModified = Date.now();
      }
    },
    deleteNote: (state, action) => {
      const { id } = action.payload;
      state.items = state.items.filter(note => note.id !== id);
    },
    clearAllNotes: (state) => {
      state.items = [];
    }
  }
});

export const { addNote, updateNote, deleteNote, clearAllNotes } = notesSlice.actions;

export default notesSlice.reducer;