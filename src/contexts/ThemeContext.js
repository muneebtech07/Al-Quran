import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

// Define theme colors
const lightTheme = {
  primary: '#4CAF50',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#121212',
  muted: '#6B6B6B',
  border: '#E0E0E0',
  notification: '#FF9500',
  error: '#FF3B30',
  arabic: '#000000',
  isDark: false
};

const darkTheme = {
  primary: '#66BB6A',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  muted: '#A0A0A0',
  border: '#2C2C2C',
  notification: '#FF9F0A',
  error: '#FF453A',
  arabic: '#E0E0E0',
  isDark: true
};

// Create context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get system theme
  const colorScheme = useColorScheme();
  
  // Get user preference from settings
  const themePreference = useSelector(state => state.settings?.theme);
  
  // State to hold current theme
  const [colors, setColors] = useState(lightTheme);
  
  useEffect(() => {
    // Determine which theme to use
    if (themePreference === 'system') {
      // Follow system setting
      setColors(colorScheme === 'dark' ? darkTheme : lightTheme);
    } else {
      // Use user preference
      setColors(themePreference === 'dark' ? darkTheme : lightTheme);
    }
  }, [themePreference, colorScheme]);

  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;