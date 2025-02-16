import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  theme: 'light' | 'dark' | 'system';
  script: 'uthmani' | 'indopak';
  showTajweed: boolean;
  fontSize: 'small' | 'medium' | 'large';
  translation: string;
  reciter: string;
  playbackSpeed: number;
  loopEnabled: boolean;
  updateSettings: (settings: Partial<SettingsState>) => void;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      script: 'uthmani',
      showTajweed: true,
      fontSize: 'medium',
      translation: 'en',
      reciter: 'mishary-rashid-alafasy',
      playbackSpeed: 1,
      loopEnabled: false,
      updateSettings: (newSettings) =>
        set((state) => ({
          ...state,
          ...newSettings,
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSettingsStore;
