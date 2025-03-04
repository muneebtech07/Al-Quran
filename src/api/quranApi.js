import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.quran.com/api/v4';
const AUDIO_CDN = 'https://audio.qurancdn.com';

const quranApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache directory for audio files
const AUDIO_CACHE_DIR = `${FileSystem.cacheDirectory}audio/`;

// Ensure audio cache directory exists
(async () => {
  const dirInfo = await FileSystem.getInfoAsync(AUDIO_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(AUDIO_CACHE_DIR, { intermediates: true });
  }
})();

export const fetchSurahList = async () => {
  try {
    const cachedData = await AsyncStorage.getItem('surahList');
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const response = await quranApi.get('/chapters?language=en');
    await AsyncStorage.setItem('surahList', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error fetching surah list:', error);
    throw error;
  }
};

export const fetchSurahInfo = async (surahNumber) => {
  try {
    const cacheKey = `surahInfo_${surahNumber}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const response = await quranApi.get(`/chapters/${surahNumber}?language=en`);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(`Error fetching surah ${surahNumber} info:`, error);
    throw error;
  }
};

export const fetchAyahs = async (surahNumber, translationSource = 'en.sahih') => {
  try {
    const cacheKey = `ayahs_${surahNumber}_${translationSource}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const response = await quranApi.get('/quran/verses/by_chapter', {
      params: {
        chapter_number: surahNumber,
        translations: translationSource,
        fields: 'text_uthmani,text_indopak',
        word_fields: 'text_uthmani,text_indopak,translation',
        words: true,
        page: 1,
        per_page: 1000, // Get all ayahs in one request
      },
    });
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(`Error fetching ayahs for surah ${surahNumber}:`, error);
    throw error;
  }
};

export const fetchTafsir = async (surahNumber, ayahNumber, tafsirSource = 'en.tafisr-ibn-kathir') => {
  try {
    const cacheKey = `tafsir_${surahNumber}_${ayahNumber}_${tafsirSource}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const response = await quranApi.get('/tafsirs/by_ayah', {
      params: {
        verse_key: `${surahNumber}:${ayahNumber}`,
        tafsirs: tafsirSource,
      },
    });
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(`Error fetching tafsir for ${surahNumber}:${ayahNumber}:`, error);
    throw error;
  }
};

export const fetchTranslations = async () => {
  try {
    const cachedData = await AsyncStorage.getItem('translations');
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const response = await quranApi.get('/resources/translations');
    await AsyncStorage.setItem('translations', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error fetching translations:', error);
    throw error;
  }
};

export const fetchTafsirs = async () => {
  try {
    const cachedData = await AsyncStorage.getItem('tafsirs');
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const response = await quranApi.get('/resources/tafsirs');
    await AsyncStorage.setItem('tafsirs', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error fetching tafsirs:', error);
    throw error;
  }
};

export const fetchReciters = async () => {
  try {
    const cachedData = await AsyncStorage.getItem('reciters');
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    const response = await quranApi.get('/resources/recitations');
    await AsyncStorage.setItem('reciters', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error('Error fetching reciters:', error);
    throw error;
  }
};

export const fetchAudioForSurah = async (reciterId, surahNumber) => {
  try {
    // First check if the audio file info is cached
    const audioInfoKey = `audio_info_${reciterId}_${surahNumber}`;
    const cachedAudioInfo = await AsyncStorage.getItem(audioInfoKey);
    
    if (cachedAudioInfo) {
      return JSON.parse(cachedAudioInfo);
    }
    
    // Fetch audio info from API
    const response = await quranApi.get('/recitations', {
      params: {
        reciter_id: reciterId,
        chapter_number: surahNumber,
      },
    });
    
    await AsyncStorage.setItem(audioInfoKey, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(`Error fetching audio for surah ${surahNumber}:`, error);
    throw error;
  }
};

export const getAudioFileUrl = (reciterId, surahNumber) => {
  return `${AUDIO_CDN}/${reciterId}/${surahNumber.toString().padStart(3, '0')}.mp3`;
};

export const downloadAudioFile = async (reciterId, surahNumber) => {
  const url = getAudioFileUrl(reciterId, surahNumber);
  const fileName = `${reciterId}_${surahNumber}.mp3`;
  const fileUri = `${AUDIO_CACHE_DIR}${fileName}`;
  
  try {
    // Check if file already exists in cache
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      return fileUri;
    }
    
    // Download file
    const downloadResult = await FileSystem.downloadAsync(url, fileUri);
    if (downloadResult.status === 200) {
      return fileUri;
    } else {
      throw new Error('Failed to download audio file');
    }
  } catch (error) {
    console.error('Error downloading audio file:', error);
    throw error;
  }
};

export const searchQuran = async (query, limit = 20) => {
  try {
    if (!query || query.trim().length < 2) return { results: [] };
    
    const response = await quranApi.get('/search', {
      params: {
        q: query,
        size: limit,
        language: 'en',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching Quran:', error);
    throw error;
  }
};

export default quranApi;