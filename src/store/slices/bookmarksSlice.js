import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  collections: []
};

const bookmarksSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action) => {
      const { surahId, ayahNumber, collectionId = 'default', timestamp = Date.now() } = action.payload;
      
      // Check if bookmark already exists
      const exists = state.items.some(
        bookmark => bookmark.surahId === surahId && 
                   bookmark.ayahNumber === ayahNumber &&
                   bookmark.collectionId === collectionId
      );
      
      if (!exists) {
        state.items.push({
          id: `bookmark-${timestamp}`,
          surahId,
          ayahNumber,
          collectionId,
          timestamp
        });
      }
    },
    removeBookmark: (state, action) => {
      const { id } = action.payload;
      state.items = state.items.filter(bookmark => bookmark.id !== id);
    },
    createCollection: (state, action) => {
      const { name, color = '#4CAF50' } = action.payload;
      const id = `collection-${Date.now()}`;
      
      state.collections.push({
        id,
        name,
        color,
        timestamp: Date.now()
      });
      
      return id;
    },
    updateCollection: (state, action) => {
      const { id, name, color } = action.payload;
      const collectionIndex = state.collections.findIndex(c => c.id === id);
      
      if (collectionIndex !== -1) {
        state.collections[collectionIndex] = {
          ...state.collections[collectionIndex],
          name: name ?? state.collections[collectionIndex].name,
          color: color ?? state.collections[collectionIndex].color,
          lastUpdated: Date.now()
        };
      }
    },
    deleteCollection: (state, action) => {
      const { id } = action.payload;
      
      // Remove all bookmarks in this collection
      state.items = state.items.filter(bookmark => bookmark.collectionId !== id);
      
      // Remove the collection itself
      state.collections = state.collections.filter(collection => collection.id !== id);
    },
  },
});

export const { 
  addBookmark, 
  removeBookmark, 
  createCollection, 
  updateCollection, 
  deleteCollection 
} = bookmarksSlice.actions;

export default bookmarksSlice.reducer;