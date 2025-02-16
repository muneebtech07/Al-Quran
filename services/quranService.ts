import axios from 'axios';
import { Surah, Tafseer, TafseerText } from '../types/quran';

const API_BASE_URL = 'https://api.alquran.cloud/v1';
const TAFSEER_API_URL = 'https://api.quran.com/api/v4';

const handleApiError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw new Error(`${context}: ${error.response.data.message || 'Server error'}`);
    } else if (error.request) {
      throw new Error(`${context}: No response from server. Please check your internet connection.`);
    }
  }
  throw new Error(`${context}: An unexpected error occurred`);
};

export async function getSurah(surahId: number): Promise<Surah> {
  try {
    const [arabicResponse, translationResponse, transliterationResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/surah/${surahId}`),
      axios.get(`${API_BASE_URL}/surah/${surahId}/en.sahih`),
      axios.get(`${API_BASE_URL}/surah/${surahId}/en.transliteration`)
    ]);

    const surah = arabicResponse.data.data;
    const translation = translationResponse.data.data;
    const transliteration = transliterationResponse.data.data;

    return {
      id: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      numberOfAyahs: surah.numberOfAyahs,
      revelationType: surah.revelationType,
      verses: surah.ayahs.map((ayah: any, index: number) => ({
        id: ayah.numberInSurah,
        text: ayah.text,
        translation: translation.ayahs[index].text,
        transliteration: transliteration.ayahs[index].text,
        audio: `https://verses.quran.com/AbdulBaset/Murattal/mp3/${surah.number.toString().padStart(3, '0')}${ayah.numberInSurah.toString().padStart(3, '0')}.mp3`
      }))
    };
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch surah');
  }
}

export async function getTafseers(): Promise<Tafseer[]> {
  try {
    const response = await axios.get(`${TAFSEER_API_URL}/resources/tafsirs`);
    return response.data.tafsirs.map((tafsir: any) => ({
      id: tafsir.id,
      name: tafsir.name,
      language: tafsir.language_name,
      author: tafsir.author_name
    }));
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch tafseers');
  }
}

export async function getTafseerText(tafsirId: string, surahId: number, verseId: number): Promise<TafseerText> {
  try {
    const response = await axios.get(
      `${TAFSEER_API_URL}/tafsirs/${tafsirId}/verses/${surahId}:${verseId}`
    );
    return {
      verseId,
      text: response.data.tafsir.text
    };
  } catch (error) {
    throw handleApiError(error, 'Failed to fetch tafseer text');
  }
}
