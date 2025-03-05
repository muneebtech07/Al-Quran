import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPlaying: false,
  currentSurah: null,
  currentAyah: null,
  reciterId: 'ar.alafasy', // Default to Mishary Rashid Alafasy
  playbackSpeed: 1,
  repeat: {
    enabled: false,
    count: 1,
    range: {
      start: null,
      end: null
    }
  },
  queue: [],
  history: []
};

const audioPlayerSlice = createSlice({
  name: 'audioPlayer',
  initialState,
  reducers: {
    setPlayback: (state, action) => {
      state.isPlaying = action.payload;
    },
    setCurrentTrack: (state, action) => {
      const { surahId, ayahNumber } = action.payload;
      state.currentSurah = surahId;
      state.currentAyah = ayahNumber;
      
      // Add to history
      if (surahId && ayahNumber) {
        const historyItem = {
          surahId,
          ayahNumber,
          timestamp: Date.now()
        };
        
        // Add to history, avoiding duplicates
        if (state.history.length === 0 || 
            state.history[0].surahId !== surahId || 
            state.history[0].ayahNumber !== ayahNumber) {
          state.history = [historyItem, ...state.history.slice(0, 9)]; // Keep last 10 items
        }
      }
    },
    setReciter: (state, action) => {
      state.reciterId = action.payload;
    },
    setPlaybackSpeed: (state, action) => {
      state.playbackSpeed = action.payload;
    },
    setRepeatSettings: (state, action) => {
      state.repeat = {
        ...state.repeat,
        ...action.payload
      };
    },
    addToQueue: (state, action) => {
      const { surahId, ayahNumber } = action.payload;
      state.queue.push({ surahId, ayahNumber });
    },
    removeFromQueue: (state, action) => {
      const index = action.payload;
      state.queue = state.queue.filter((_, i) => i !== index);
    },
    clearQueue: (state) => {
      state.queue = [];
    },
    clearHistory: (state) => {
      state.history = [];
    }
  }
});

export const {
  setPlayback,
  setCurrentTrack,
  setReciter,
  setPlaybackSpeed,
  setRepeatSettings,
  addToQueue,
  removeFromQueue,
  clearQueue,
  clearHistory
} = audioPlayerSlice.actions;

export default audioPlayerSlice.reducer;