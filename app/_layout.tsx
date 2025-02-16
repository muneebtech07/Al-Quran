import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from '../components/SplashScreen';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) {
      try {
        window.frameworkReady?.();
      } catch (e) {
        console.error("Error in frameworkReady:", e);
      }
    }
  }, [isReady]);

  if (!isReady) {
    return <SplashScreen onFinish={() => setIsReady(true)} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}