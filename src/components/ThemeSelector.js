import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useDispatch } from 'react-redux';
import { setTheme } from '../store/slices/settingsSlice';

const ThemeSelector = () => {
  const { theme, colors, isDark } = useTheme();
  const dispatch = useDispatch();

  // Animation values for selector highlight
  const lightPosition = React.useRef(new Animated.Value(theme === 'light' ? 1 : 0)).current;
  const darkPosition = React.useRef(new Animated.Value(theme === 'dark' ? 1 : 0)).current;
  const systemPosition = React.useRef(new Animated.Value(theme === 'system' ? 1 : 0)).current;

  const handleThemeChange = (newTheme) => {
    dispatch(setTheme(newTheme));

    // Animate position changes
    Animated.parallel([
      Animated.timing(lightPosition, {
        toValue: newTheme === 'light' ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(darkPosition, {
        toValue: newTheme === 'dark' ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(systemPosition, {
        toValue: newTheme === 'system' ? 1 : 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Interpolate animation values to get scales and opacities
  const lightScale = lightPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.1],
  });

  const darkScale = darkPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.1],
  });

  const systemScale = systemPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.1],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>App Theme</Text>
      
      <View style={styles.themeOptions}>
        {/* Light Theme Option */}
        <Animated.View 
          style={[
            styles.themeOptionContainer,
            {
              transform: [{ scale: lightScale }],
              backgroundColor: lightPosition.interpolate({
                inputRange: [0, 1],
                outputRange: [isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', colors.primary + '20'],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => handleThemeChange('light')}
          >
            <View style={[styles.themeIconContainer, { backgroundColor: '#F9F9F9' }]}>
              <Ionicons name="sunny" size={24} color="#FF9800" />
            </View>
            <Text style={[styles.themeText, { color: colors.text }]}>Light</Text>
            {theme === 'light' && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Dark Theme Option */}
        <Animated.View 
          style={[
            styles.themeOptionContainer,
            {
              transform: [{ scale: darkScale }],
              backgroundColor: darkPosition.interpolate({
                inputRange: [0, 1],
                outputRange: [isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', colors.primary + '20'],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => handleThemeChange('dark')}
          >
            <View style={[styles.themeIconContainer, { backgroundColor: '#1A1A1A' }]}>
              <Ionicons name="moon" size={24} color="#5C6BC0" />
            </View>
            <Text style={[styles.themeText, { color: colors.text }]}>Dark</Text>
            {theme === 'dark' && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* System Theme Option */}
        <Animated.View 
          style={[
            styles.themeOptionContainer,
            {
              transform: [{ scale: systemScale }],
              backgroundColor: systemPosition.interpolate({
                inputRange: [0, 1],
                outputRange: [isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', colors.primary + '20'],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.themeOption}
            onPress={() => handleThemeChange('system')}
          >
            <View style={[styles.themeIconContainer, { backgroundColor: '#E0F7FA' }]}>
              <Ionicons name="settings" size={24} color="#29B6F6" />
            </View>
            <Text style={[styles.themeText, { color: colors.text }]}>System</Text>
            {theme === 'system' && (
              <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <Text style={[styles.note, { color: colors.text }]}>
        {theme === 'system' ? 'Follows your device settings' : 
         theme === 'dark' ? 'Easier on the eyes in low light' : 
         'Classic light appearance'}
      </Text>

      <View style={styles.preview}>
        <View style={[
          styles.previewBox, 
          { 
            backgroundColor: theme === 'dark' ? '#121212' : '#FFFFFF',
            borderColor: colors.border
          }
        ]}>
          <Text style={[styles.previewTitle, { 
            color: theme === 'dark' ? '#FFFFFF' : '#000000' 
          }]}>
            Preview
          </Text>
          <View style={[styles.previewTextContainer, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#F5F5F5' }]}>
            <Text style={[styles.previewArabic, { 
              color: theme === 'dark' ? '#FFFFFF' : '#000000',
              fontFamily: 'Scheherazade-Regular'
            }]}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
          </View>
          <View style={[styles.previewButton, { backgroundColor: theme === 'dark' ? '#81C784' : '#4CAF50' }]}>
            <Text style={styles.previewButtonText}>Button</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOptionContainer: {
    borderRadius: 12,
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  themeOption: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  note: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 16,
  },
  preview: {
    marginTop: 20,
  },
  previewBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  previewTextContainer: {
    width: '100%',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  previewArabic: {
    fontSize: 18,
    textAlign: 'center',
  },
  previewButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  }
});

export default ThemeSelector;