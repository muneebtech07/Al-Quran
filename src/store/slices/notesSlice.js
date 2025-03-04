import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: []
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action) => {
      const { surahId, ayahNumber, content, timestamp = Date.now() } = action.payload;
      state.items.push({
        id: `note-${timestamp}`,
        surahId,
        ayahNumber,
        content,
        timestamp
      });
    },
    updateNote: (state, action) => {
      const { id, content } = action.payload;
      const noteIndex = state.items.findIndex(note => note.id === id);
      if (noteIndex !== -1) {
        state.items[noteIndex].content = content;
        state.items[noteIndex].lastModified = Date.now();
      }
    },
    deleteNote: (state, action) => {
      const { id } = action.payload;
      state.items = state.items.filter(note => note.id !== id);
    }
  }
});

export const { addNote, updateNote, deleteNote } = notesSlice.actions;
export default notesSlice.reducer;