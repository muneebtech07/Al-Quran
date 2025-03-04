import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import thunk from 'redux-thunk';
import notesReducer from './slices/notesSlice';
import audioPlayerReducer from './slices/audioPlayerSlice';
import settingsReducer from './slices/settingsSlice';
import bookmarksReducer from './slices/bookmarksSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['notes', 'bookmarks', 'settings'], // Don't persist audio player state
};

// Combine reducers
const rootReducer = combineReducers({
  notes: notesReducer,
  audioPlayer: audioPlayerReducer,
  settings: settingsReducer,
  bookmarks: bookmarksReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(thunk),
});

// Create persistor
export const persistor = persistStore(store);