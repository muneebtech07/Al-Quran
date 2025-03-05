import axios from 'axios';

// Create API instance with production base URL
const api = axios.create({
  baseURL: 'https://api.quran.com/api/v4', // Production API endpoint
  timeout: 10000,
});

// Fetch surahs list
export const fetchSurahs = async () => {
  try {
    const response = await api.get('/chapters');
    return response.data.chapters;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw error;
  }
};

// Fetch verses for a specific surah
export const fetchVerses = async (surahId, page = 1, perPage = 20) => {
  try {
    const response = await api.get(`/verses/by_chapter/${surahId}`, {
      params: {
        language: 'en',
        words: true,
        translations: '20', // Sahih International translation
        page,
        per_page: perPage,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching verses for surah ${surahId}:`, error);
    throw error;
  }
};

// Fetch audio recitations for a verse
export const fetchAudioForVerse = async (verseKey) => {
  try {
    const response = await api.get('/recitations/7/by_ayah/' + verseKey); // Mishary Rashid Alafasy
    return response.data;
  } catch (error) {
    console.error(`Error fetching audio for verse ${verseKey}:`, error);
    throw error;
  }
};

// Fetch prayer times
export const fetchPrayerTimes = async (latitude, longitude, date = new Date()) => {
  try {
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    const response = await axios.get('https://api.aladhan.com/v1/timings/' + formattedDate, {
      params: {
        latitude,
        longitude,
        method: 2, // Islamic Society of North America
      },
    });
    
    return response.data.data.timings;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

// Search the Quran
export const searchQuran = async (query, page = 1, perPage = 20) => {
  try {
    const response = await api.get('/search', {
      params: {
        q: query,
        language: 'en',
        page,
        per_page: perPage,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching Quran for "${query}":`, error);
    throw error;
  }
};

export default api;