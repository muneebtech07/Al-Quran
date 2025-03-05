import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store/configureStore';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Localization from 'expo-localization';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import SurahListScreen from './src/screens/SurahListScreen';
import SurahDetailScreen from './src/screens/SurahDetailScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PrayerTimesScreen from './src/screens/PrayerTimesScreen';
import QiblaFinderScreen from './src/screens/QiblaFinderScreen';
import AudioPlayerScreen from './src/screens/AudioPlayerScreen';

// Set up navigation
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Surahs') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Bookmarks') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Surahs" 
        component={SurahListScreen}
        options={{ title: "Quran" }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

// Main app component
const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <NavigationContainer>
            <StatusBar translucent backgroundColor="transparent" />
            <Stack.Navigator initialRouteName="Splash">
              <Stack.Screen 
                name="Splash" 
                component={SplashScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Main" 
                component={MainTabs} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="SurahDetail" 
                component={SurahDetailScreen}
                options={({ route }) => ({ 
                  title: route.params?.surahName || "Surah"
                })}
              />
              <Stack.Screen 
                name="PrayerTimes" 
                component={PrayerTimesScreen}
                options={{ title: "Prayer Times" }}
              />
              <Stack.Screen 
                name="QiblaFinder" 
                component={QiblaFinderScreen}
                options={{ title: "Qibla Finder" }}
              />
              <Stack.Screen 
                name="AudioPlayer" 
                component={AudioPlayerScreen}
                options={{ title: "Audio Player" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;