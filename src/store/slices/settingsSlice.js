import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  fontSize: 'medium',
  translation: 'en.asad',
  arabicTextType: 'uthmani',
  showArabicText: true,
  showTranslation: true,
  showTransliteration: false,
  tajweedColors: false,
  autoPlayNext: false,
  vibration: true,
  appLanguage: 'en',
  lastRead: {
    surahId: 1,
    ayahNumber: 1,
    timestamp: Date.now()
  },
  notifications: {
    enabled: false,
    prayerReminders: false,
    dailyReminder: false,
    dailyReminderTime: '08:00'
  },
  prayerSettings: {
    calculationMethod: 2, // 2 = ISNA
    adjustments: {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0
    }
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    setTranslation: (state, action) => {
      state.translation = action.payload;
    },
    setArabicTextType: (state, action) => {
      state.arabicTextType = action.payload;
    },
    toggleArabicText: (state) => {
      state.showArabicText = !state.showArabicText;
    },
    toggleTranslation: (state) => {
      state.showTranslation = !state.showTranslation;
    },
    toggleTransliteration: (state) => {
      state.showTransliteration = !state.showTransliteration;
    },
    toggleTajweedColors: (state) => {
      state.tajweedColors = !state.tajweedColors;
    },
    toggleAutoPlayNext: (state) => {
      state.autoPlayNext = !state.autoPlayNext;
    },
    toggleVibration: (state) => {
      state.vibration = !state.vibration;
    },
    setAppLanguage: (state, action) => {
      state.appLanguage = action.payload;
    },
    updateLastRead: (state, action) => {
      state.lastRead = {
        surahId: action.payload.surahId,
        ayahNumber: action.payload.ayahNumber,
        timestamp: Date.now()
      };
    },
    updateNotificationSettings: (state, action) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload
      };
    },
    updatePrayerSettings: (state, action) => {
      state.prayerSettings = {
        ...state.prayerSettings,
        ...action.payload
      };
    }
  }
});

export const {
  setTheme,
  setFontSize,
  setTranslation,
  setArabicTextType,
  toggleArabicText,
  toggleTranslation,
  toggleTransliteration,
  toggleTajweedColors,
  toggleAutoPlayNext,
  toggleVibration,
  setAppLanguage,
  updateLastRead,
  updateNotificationSettings,
  updatePrayerSettings
} = settingsSlice.actions;

export default settingsSlice.reducer;