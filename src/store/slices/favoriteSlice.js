import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favorites: [], // [{surahNumber: 1, ayahNumber: 1, timestamp: Date.now()}]
};

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      const { surahNumber, ayahNumber } = action.payload;
      // Check if favorite already exists
      const exists = state.favorites.some(
        favorite => favorite.surahNumber === surahNumber && favorite.ayahNumber === ayahNumber
      );
      
      if (!exists) {
        state.favorites.push({
          surahNumber,
          ayahNumber,
          timestamp: Date.now(),
        });
      }
    },
    removeFavorite: (state, action) => {
      const { surahNumber, ayahNumber } = action.payload;
      state.favorites = state.favorites.filter(
        favorite => !(favorite.surahNumber === surahNumber && favorite.ayahNumber === ayahNumber)
      );
    },
    clearAllFavorites: (state) => {
      state.favorites = [];
    },
  },
});

export const { addFavorite, removeFavorite, clearAllFavorites } = favoriteSlice.actions;

export default favoriteSlice.reducer;