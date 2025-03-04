import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    'Amiri-Regular': require('../assets/fonts/Amiri-Regular.ttf'),
    'Amiri-Bold': require('../assets/fonts/Amiri-Bold.ttf'),
    'Scheherazade-Regular': require('../assets/fonts/Scheherazade-Regular.ttf'),
    'Scheherazade-Bold': require('../assets/fonts/Scheherazade-Bold.ttf'),
    // Add any other fonts you need here
  });
};