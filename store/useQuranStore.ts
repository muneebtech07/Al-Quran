import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Bookmark {
  surahId: number;
  verseId: number;
  timestamp: number;
}

interface QuranState {
  lastRead: {
    surahId: number;
    verseId: number;
    timestamp: number;
  } | null;
  bookmarks: Bookmark[];
  settings: {
    fontSize: 'small' | 'medium' | 'large';
    translation: string;
    reciter: string;
    theme: 'light' | 'dark' | 'system';
  };
  setLastRead: (surahId: number, verseId: number) => void;
  addBookmark: (surahId: number, verseId: number) => void;
  removeBookmark: (surahId: number, verseId: number) => void;
  updateSettings: (settings: Partial<QuranState['settings']>) => void;
}

const useQuranStore = create<QuranState>()(
  persist(
    (set) => ({
      lastRead: null,
      bookmarks: [],
      settings: {
        fontSize: 'medium',
        translation: 'en',
        reciter: 'mishary-rashid-alafasy',
        theme: 'system',
      },
      setLastRead: (surahId, verseId) =>
        set({
          lastRead: {
            surahId,
            verseId,
            timestamp: Date.now(),
          },
        }),
      addBookmark: (surahId, verseId) =>
        set((state) => ({
          bookmarks: [
            ...state.bookmarks,
            {
              surahId,
              verseId,
              timestamp: Date.now(),
            },
          ],
        })),
      removeBookmark: (surahId, verseId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter(
            (b) => b.surahId !== surahId || b.verseId !== verseId
          ),
        })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),
    }),
    {
      name: 'quran-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useQuranStore;
