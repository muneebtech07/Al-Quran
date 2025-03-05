/**
 * Platform helper utilities to safely handle platform-specific code
 */
import { Platform } from 'react-native';

// Safe implementation of Platform.select that won't crash on web
export const platformSelect = (options) => {
  if (!options) return undefined;
  
  // Ensure Platform.select is available and a function
  if (Platform && typeof Platform.select === 'function') {
    return Platform.select(options);
  }
  
  // Fallback implementation for web or when Platform.select isn't available
  if (options.web && Platform.OS === 'web') return options.web;
  if (options.native && (Platform.OS === 'ios' || Platform.OS === 'android')) return options.native;
  if (options[Platform.OS]) return options[Platform.OS];
  if (options.default) return options.default;
  
  return undefined;
};

// Safe check for platform type
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';