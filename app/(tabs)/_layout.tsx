import { Tabs } from 'expo-router';
    import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
    import { useColorScheme, View } from 'react-native';
    import AudioPlayer from '../../components/AudioPlayer';

    export default function TabLayout() {
      const colorScheme = useColorScheme();
      const activeColor = '#2E7D32';
      const inactiveColor = colorScheme === 'dark' ? '#666' : '#999';
      const bgColor = colorScheme === 'dark' ? '#121212' : '#fff';

      return (
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: bgColor,
                borderTopWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
                height: 60,
                paddingBottom: 8,
              },
              tabBarActiveTintColor: activeColor,
              tabBarInactiveTintColor: inactiveColor,
            }}>
            <Tabs.Screen
              name="index"
              options={{
                title: 'Home',
                tabBarIcon: ({ size, color }) => (
                  <Ionicons name="home" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="quran"
              options={{
                title: 'Quran',
                tabBarIcon: ({ size, color }) => (
                  <FontAwesome5 name="quran" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="prayer"
              options={{
                title: 'Prayer',
                tabBarIcon: ({ size, color }) => (
                  <FontAwesome5 name="mosque" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="settings"
              options={{
                title: 'Settings',
                tabBarIcon: ({ size, color }) => (
                  <Ionicons name="settings-outline" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
          <AudioPlayer isMinimized />
        </View>
      );
    }
