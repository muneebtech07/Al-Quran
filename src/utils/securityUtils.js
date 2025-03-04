import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sensitive data should use SecureStore on native platforms
export const secureStorage = {
  async setItem(key, value) {
    try {
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (Platform.OS === 'web') {
        // Web fallback (less secure)
        await AsyncStorage.setItem(key, valueToStore);
      } else {
        await SecureStore.setItemAsync(key, valueToStore);
      }
      return true;
    } catch (error) {
      console.error('Error storing secure data', error);
      return false;
    }
  },
  
  async getItem(key) {
    try {
      let result;
      
      if (Platform.OS === 'web') {
        result = await AsyncStorage.getItem(key);
      } else {
        result = await SecureStore.getItemAsync(key);
      }
      
      if (!result) return null;
      
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    } catch (error) {
      console.error('Error retrieving secure data', error);
      return null;
    }
  },
  
  async removeItem(key) {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
      return true;
    } catch (error) {
      console.error('Error removing secure data', error);
      return false;
    }
  }
};

// Generate secure hash for sensitive operations
export const generateHash = async (input) => {
  try {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      input
    );
    return hash;
  } catch (error) {
    console.error('Error generating hash', error);
    return null;
  }
};

// Sanitize user input to prevent XSS attacks
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};