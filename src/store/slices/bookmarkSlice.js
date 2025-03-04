import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookmarks: [], // [{surahNumber: 1, ayahNumber: 1, timestamp: Date.now(), note: ''}]
};

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action) => {
      const { surahNumber, ayahNumber, note = '' } = action.payload;
      // Check if bookmark already exists
      const exists = state.bookmarks.some(
        bookmark => bookmark.surahNumber === surahNumber && bookmark.ayahNumber === ayahNumber
      );
      
      if (!exists) {
        state.bookmarks.push({
          surahNumber,
          ayahNumber,
          note,
          timestamp: Date.now(),
        });
      }
    },
    removeBookmark: (state, action) => {
      const { surahNumber, ayahNumber } = action.payload;
      state.bookmarks = state.bookmarks.filter(
        bookmark => !(bookmark.surahNumber === surahNumber && bookmark.ayahNumber === ayahNumber)
      );
    },
    updateBookmarkNote: (state, action) => {
      const { surahNumber, ayahNumber, note } = action.payload;
      const bookmark = state.bookmarks.find(
        bookmark => bookmark.surahNumber === surahNumber && bookmark.ayahNumber === ayahNumber
      );
      if (bookmark) {
        bookmark.note = note;
      }
    },
    clearAllBookmarks: (state) => {
      state.bookmarks = [];
    },
  },
});

export const { addBookmark, removeBookmark, updateBookmarkNote, clearAllBookmarks } = bookmarkSlice.actions;

export default bookmarkSlice.reducer;