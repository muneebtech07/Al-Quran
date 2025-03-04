import * as Analytics from 'expo-firebase-analytics';
import config from '../config';

export const AnalyticsEvents = {
  SURAH_OPENED: 'surah_opened',
  AYAH_PLAYED: 'ayah_played',
  SURAH_PLAYED: 'surah_played',
  BOOKMARK_ADDED: 'bookmark_added',
  FAVORITE_ADDED: 'favorite_added',
  SEARCH_PERFORMED: 'search_performed',
  QIBLA_FINDER_USED: 'qibla_finder_used',
  TRANSLATION_CHANGED: 'translation_changed',
  THEME_CHANGED: 'theme_changed',
  APP_ERROR: 'app_error',
  USER_LOGGED_IN: 'user_logged_in',
};

class AnalyticsService {
  constructor() {
    this.enabled = config.ENABLE_ANALYTICS;
    this.userProperties = {};
  }

  initialize(userId = null) {
    if (!this.enabled) return;
    
    if (userId) {
      Analytics.setUserId(userId);
      this.setUserProperty('user_id', userId);
    }
    
    // Set initial app open event with session params
    this.logEvent(AnalyticsEvents.APP_OPENED, {
      timestamp: new Date().toISOString(),
      session_id: `session_${Date.now()}`
    });
  }

  setUserProperty(name, value) {
    if (!this.enabled) return;
    this.userProperties[name] = value;
    Analytics.setUserProperty(name, String(value));
  }

  setCurrentScreen(screenName) {
    if (!this.enabled) return;
    Analytics.setCurrentScreen(screenName);
  }

  logEvent(eventName, params = {}) {
    if (!this.enabled) return;
    
    // Add standard params to all events
    const enhancedParams = {
      ...params,
      timestamp: new Date().toISOString(),
      ...this.userProperties
    };
    
    Analytics.logEvent(eventName, enhancedParams);
  }

  logError(error, additionalInfo = {}) {
    if (!this.enabled) return;
    
    this.logEvent(AnalyticsEvents.APP_ERROR, {
      error_message: error.message || 'Unknown error',
      error_stack: error.stack,
      ...additionalInfo
    });
  }
}

export default new AnalyticsService();