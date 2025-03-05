import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';

// Import reducers
import settingsReducer from './slices/settingsSlice';
import bookmarksReducer from './slices/bookmarksSlice';
import notesReducer from './slices/notesSlice';
import audioPlayerReducer from './slices/audioPlayerSlice';

// Configure persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['settings', 'bookmarks', 'notes'] // audio player state doesn't need to be persisted
};

// Combine reducers
const rootReducer = combineReducers({
  settings: settingsReducer,
  bookmarks: bookmarksReducer,
  notes: notesReducer,
  audioPlayer: audioPlayerReducer
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false // Needed for Redux Persist
  }).concat(thunk)
});

// Create persistor
export const persistor = persistStore(store);