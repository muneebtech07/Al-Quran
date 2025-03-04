import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from './translations/en';
import ar from './translations/ar';
import ur from './translations/ur';

const translations = {
  en,
  ar,
  ur,
};

const i18n = new I18n(translations);

// Set the locale based on device settings or user preference
export const initializeLocalization = async () => {
  try {
    // Try to get stored locale
    const storedLocale = await AsyncStorage.getItem('userLocale');
    
    if (storedLocale) {
      // Use user's preferred locale
      i18n.locale = storedLocale;
    } else {
      // Use device locale, fallback to English
      const deviceLocale = Localization.locale.split('-')[0];
      i18n.locale = translations[deviceLocale] ? deviceLocale : 'en';
    }
  } catch (error) {
    console.error('Failed to initialize localization:', error);
    i18n.locale = 'en';
  }
  
  i18n.enableFallback = true;
  i18n.defaultLocale = 'en';
};

// Set a new locale
export const setLocale = async (locale) => {
  try {
    await AsyncStorage.setItem('userLocale', locale);
    i18n.locale = locale;
  } catch (error) {
    console.error('Failed to set locale:', error);
  }
};

export default i18n;