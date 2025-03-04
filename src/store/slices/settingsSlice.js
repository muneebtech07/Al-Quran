import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'system', // 'light', 'dark', 'system'
  fontSize: 'medium', // 'small', 'medium', 'large', 'xlarge'
  translation: 'en.sahih', // default English translation
  arabicTextType: 'uthmani', // 'uthmani' or 'indopak' or 'simple'
  showArabicText: true,
  showTranslation: true,
  showTransliteration: false,
  scrollBehavior: 'smooth',
  quranFont: 'Scheherazade-Regular',
  appLanguage: 'en', // app interface language
  lastRead: null, // { surahId: 1, ayahNumber: 1 }
  preTajweedColors: true, // colorize tajweed rules
  autoPlayNext: false, // automatically play next surah 
  vibration: true, // use vibration feedback
  notificationSettings: {
    reminders: true,
    prayerTimesNotification: true,
    dailyQuoteNotification: false,
    notificationSound: 'default',
  },
  prayerSettings: {
    calculationMethod: 'muslimWorldLeague',
    madhab: 'shafi',
    adjustments: {
      fajr: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    },
    showSunrise: true,
    showMidnight: false,
  },
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
    setScrollBehavior: (state, action) => {
      state.scrollBehavior = action.payload;
    },
    setQuranFont: (state, action) => {
      state.quranFont = action.payload;
    },
    setAppLanguage: (state, action) => {
      state.appLanguage = action.payload;
    },
    updateLastRead: (state, action) => {
      state.lastRead = action.payload;
    },
    toggleTajweedColors: (state) => {
      state.preTajweedColors = !state.preTajweedColors;
    },
    toggleAutoPlayNext: (state) => {
      state.autoPlayNext = !state.autoPlayNext;
    },
    toggleVibration: (state) => {
      state.vibration = !state.vibration;
    },
    updateNotificationSettings: (state, action) => {
      state.notificationSettings = {
        ...state.notificationSettings,
        ...action.payload
      };
    },
    updatePrayerSettings: (state, action) => {
      state.prayerSettings = {
        ...state.prayerSettings,
        ...action.payload
      };
    },
  },
});

export const {
  setTheme,
  setFontSize,
  setTranslation,
  setArabicTextType,
  toggleArabicText,
  toggleTranslation,
  toggleTransliteration,
  setScrollBehavior,
  setQuranFont,
  setAppLanguage,
  updateLastRead,
  toggleTajweedColors,
  toggleAutoPlayNext,
  toggleVibration,
  updateNotificationSettings,
  updatePrayerSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;