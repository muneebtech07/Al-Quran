import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: []
};

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action) => {
      const { surahId, ayahNumber, timestamp } = action.payload;
      
      // Check for duplicate before adding
      const exists = state.items.some(
        bookmark => bookmark.surahId === surahId && bookmark.ayahNumber === ayahNumber
      );
      
      if (!exists) {
        state.items.push({
          id: `${surahId}_${ayahNumber}`,
          surahId,
          ayahNumber,
          timestamp
        });
      }
    },
    removeBookmark: (state, action) => {
      const { id } = action.payload;
      state.items = state.items.filter(bookmark => bookmark.id !== id);
    },
    clearBookmarks: (state) => {
      state.items = [];
    }
  }
});

export const { addBookmark, removeBookmark, clearBookmarks } = bookmarksSlice.actions;
export default bookmarksSlice.reducer;