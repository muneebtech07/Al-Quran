import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure storage utility that uses SecureStore on iOS/Android
 * and falls back to AsyncStorage on web
 */
export const secureStorage = {
  setItem: async (key, value) => {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (Platform.OS === 'web') {
        // Web doesn't have SecureStore
        await AsyncStorage.setItem(key, stringValue);
      } else {
        await SecureStore.setItemAsync(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error('Error storing secure data', error);
      return false;
    }
  },
  
  getItem: async (key) => {
    try {
      let result;
      if (Platform.OS === 'web') {
        result = await AsyncStorage.getItem(key);
      } else {
        result = await SecureStore.getItemAsync(key);
      }
      
      // Try to parse JSON
      if (result) {
        try {
          return JSON.parse(result);
        } catch (e) {
          // Not JSON, return as is
          return result;
        }
      }
      return null;
    } catch (error) {
      console.error('Error retrieving secure data', error);
      return null;
    }
  },
  
  removeItem: async (key) => {
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