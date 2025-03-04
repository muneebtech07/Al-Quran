import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Cache mechanism to reduce API calls
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Determine if we're in development
const isDev = __DEV__;

// For development environment, we can use mock data if API calls fail
import mockSurahs from './mockData/surahs.json';
import mockSurah1 from './mockData/surah1.json';

// Create base API instances with CORS handling
export const quranAPI = axios.create({
  baseURL: 'https://api.alquran.cloud/v1',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // Add CORS headers for web platform
    'Access-Control-Allow-Origin': '*',
  }
});

export const prayerTimesAPI = axios.create({
  baseURL: 'https://api.aladhan.com/v1',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    // Add CORS headers for web platform
    'Access-Control-Allow-Origin': '*',
  }
});

// Helper function for caching
const getWithCache = async (key, fetcher, fallbackData = null) => {
  // Try to get from memory cache first
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  // Try to get from persistent storage
  try {
    const storedData = await SecureStore.getItemAsync(key);
    if (storedData) {
      const { data, timestamp } = JSON.parse(storedData);
      if (Date.now() - timestamp < CACHE_DURATION) {
        // Update memory cache
        cache.set(key, { data, timestamp });
        return data;
      }
    }
  } catch (error) {
    console.log('Cache read error:', error);
  }
  
  // If not in cache or expired, fetch fresh data
  try {
    const data = await fetcher();
    
    // Store in memory cache
    cache.set(key, { data, timestamp: Date.now() });
    
    // Store in persistent cache
    try {
      await SecureStore.setItemAsync(
        key,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (error) {
      console.log('Cache write error:', error);
    }
    
    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    
    // If in development mode and fallback data is provided, use it
    if (isDev && fallbackData) {
      console.warn('Using fallback data in development mode');
      return fallbackData;
    }
    
    throw error;
  }
};

// Quran API endpoints
export const fetchSurahs = async () => {
  const cacheKey = 'surahs_list';
  
  return getWithCache(cacheKey, async () => {
    try {
      // For web platform, use CORS proxy in development
      const corsProxy = Platform.OS === 'web' && isDev ? 'https://cors-anywhere.herokuapp.com/' : '';
      
      const response = await quranAPI.get(`${corsProxy}/surah`);
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response format');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching surahs:', error);
      
      // In development, return mock data
      if (isDev) {
        console.warn('Using mock Surahs data');
        return mockSurahs;
      }
      
      throw error;
    }
  }, mockSurahs);
};

export const fetchSurahByNumber = async (surahNumber) => {
  const cacheKey = `surah_${surahNumber}`;
  
  // For first surah, we have mock data ready
  const mockData = surahNumber === 1 ? mockSurah1 : null;
  
  return getWithCache(cacheKey, async () => {
    try {
      // For web platform, use CORS proxy in development
      const corsProxy = Platform.OS === 'web' && isDev ? 'https://cors-anywhere.herokuapp.com/' : '';
      
      const response = await quranAPI.get(`${corsProxy}/surah/${surahNumber}`);
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response format');
      }
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching surah ${surahNumber}:`, error);
      
      // In development, return mock data if available
      if (isDev && mockData) {
        console.warn('Using mock Surah data');
        return mockData;
      }
      
      throw error;
    }
  }, mockData);
};

export const fetchSurahWithTranslation = async (surahNumber, translationCode = 'en.asad') => {
  const cacheKey = `surah_${surahNumber}_trans_${translationCode}`;
  
  return getWithCache(cacheKey, async () => {
    try {
      // For web platform, use CORS proxy in development
      const corsProxy = Platform.OS === 'web' && isDev ? 'https://cors-anywhere.herokuapp.com/' : '';
      
      const [arabicResponse, translationResponse] = await Promise.all([
        quranAPI.get(`${corsProxy}/surah/${surahNumber}/ar.alafasy`),
        quranAPI.get(`${corsProxy}/surah/${surahNumber}/${translationCode}`)
      ]);
      
      // Validate responses
      if (!arabicResponse.data?.data?.ayahs || !translationResponse.data?.data?.ayahs) {
        throw new Error('Invalid API response format');
      }
      
      // Combine Arabic and translation
      const arabicVerses = arabicResponse.data.data.ayahs;
      const translationVerses = translationResponse.data.data.ayahs;
      
      const combinedVerses = arabicVerses.map((arabicVerse, index) => ({
        ...arabicVerse,
        translation: translationVerses[index].text
      }));
      
      return {
        ...arabicResponse.data.data,
        ayahs: combinedVerses
      };
    } catch (error) {
      console.error(`Error fetching surah ${surahNumber} with translation:`, error);
      
      // Use basic mock data in development if needed
      if (isDev && surahNumber === 1) {
        // Create a simplified mock with translations
        const mockWithTranslation = {
          ...mockSurah1,
          ayahs: mockSurah1.ayahs.map(ayah => ({
            ...ayah,
            translation: `Translation for verse ${ayah.numberInSurah}`
          }))
        };
        return mockWithTranslation;
      }
      
      // If CORS error, provide user-friendly message
      if (error.message.includes('CORS')) {
        throw new Error('Cross-origin request blocked. Please try using a different network or the mobile app.');
      }
      
      throw error;
    }
  });
};

// Provide similar implementations for the rest of the methods...

export const searchQuran = async (query, translationCode = 'en.asad') => {
  // Don't cache search results
  try {
    // For web platform, use CORS proxy in development
    const corsProxy = Platform.OS === 'web' && isDev ? 'https://cors-anywhere.herokuapp.com/' : '';
    
    const response = await quranAPI.get(`${corsProxy}/search/${query}/${translationCode}`);
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid search response format');
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Error searching Quran for "${query}":`, error);
    
    // Mock search results for development
    if (isDev) {
      return {
        count: 2,
        matches: [
          {
            number: 1,
            text: `Mock search result for "${query}" 1`,
            surah: { number: 1, name: "Al-Fatihah", englishName: "The Opening" },
            numberInSurah: 1
          },
          {
            number: 2,
            text: `Mock search result for "${query}" 2`,
            surah: { number: 2, name: "Al-Baqarah", englishName: "The Cow" },
            numberInSurah: 1
          }
        ]
      };
    }
    
    // If CORS error, provide user-friendly message
    if (error.message.includes('CORS')) {
      throw new Error('Cross-origin request blocked. Please try using a different network or the mobile app.');
    }
    
    throw error;
  }
};

// Rest of API methods...