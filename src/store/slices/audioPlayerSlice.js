import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPlaying: false,
  currentAudio: null,
  currentSurah: null,
  currentAyah: null,
  playbackPosition: 0,
  duration: 0,
  playbackRate: 1.0,
  isLoading: false,
  isLoaded: false,
  error: null,
  repeatMode: 'none', // 'none', 'ayah', 'surah'
  qari: 'Mishary Rashid Alafasy', // default reciter
  sleepTimerMinutes: 0, // 0 means disabled
  sleepTimerEndTime: null
};

const audioPlayerSlice = createSlice({
  name: 'audioPlayer',
  initialState,
  reducers: {
    setPlayingState: (state, action) => {
      state.isPlaying = action.payload;
    },
    setCurrentAudio: (state, action) => {
      state.currentAudio = action.payload;
    },
    setCurrentSurah: (state, action) => {
      state.currentSurah = action.payload;
    },
    setCurrentAyah: (state, action) => {
      state.currentAyah = action.payload;
    },
    updatePlaybackPosition: (state, action) => {
      state.playbackPosition = action.payload;
    },
    setDuration: (state, action) => {
      state.duration = action.payload;
    },
    setPlaybackRate: (state, action) => {
      state.playbackRate = action.payload;
    },
    setLoadingState: (state, action) => {
      state.isLoading = action.payload;
    },
    setLoadedState: (state, action) => {
      state.isLoaded = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setRepeatMode: (state, action) => {
      state.repeatMode = action.payload;
    },
    setQari: (state, action) => {
      state.qari = action.payload;
    },
    setSleepTimer: (state, action) => {
      state.sleepTimerMinutes = action.payload;
      
      if (action.payload > 0) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + action.payload);
        state.sleepTimerEndTime = now.getTime();
      } else {
        state.sleepTimerEndTime = null;
      }
    },
    resetPlayer: (state) => {
      return {...initialState, qari: state.qari}; // Preserve selected qari
    }
  },
});

export const {
  setPlayingState,
  setCurrentAudio,
  setCurrentSurah,
  setCurrentAyah,
  updatePlaybackPosition,
  setDuration,
  setPlaybackRate,
  setLoadingState,
  setLoadedState,
  setError,
  setRepeatMode,
  setQari,
  setSleepTimer,
  resetPlayer
} = audioPlayerSlice.actions;

export default audioPlayerSlice.reducer;