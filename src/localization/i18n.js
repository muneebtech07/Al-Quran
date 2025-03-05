import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import { useSelector } from 'react-redux';

// Import translations
import en from './translations/en';
import ar from './translations/ar';
import ur from './translations/ur';

// Create i18n instance
const i18n = new I18n({
  en,
  ar,
  ur
});

// Set the locale from device by default
const deviceLocale = getLocales()[0]?.languageCode || 'en';
i18n.locale = deviceLocale;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Function to set locale programmatically
export const setLocale = (locale) => {
  i18n.locale = locale;
};

// Function to get current locale
export const getCurrentLocale = () => i18n.locale;

export default i18n;