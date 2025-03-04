import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';

// Define color palettes
const lightColors = {
  primary: '#075E54',
  secondary: '#128C7E',
  background: '#FFFFFF',
  card: '#F7F7F7',
  text: '#262626',
  arabic: '#000000',
  border: '#E0E0E0',
  notification: '#FF3B30',
  accent: '#25D366',
  muted: '#8A8A8A',
  subtle: '#F0F0F0',
  error: '#FF3B30',
  success: '#4CD964',
};

const darkColors = {
  primary: '#128C7E',
  secondary: '#075E54',
  background: '#121212',
  card: '#1E1E1E',
  text: '#FFFFFF',
  arabic: '#E0E0E0',
  border: '#2C2C2C',
  notification: '#FF453A',
  accent: '#25D366',
  muted: '#8A8A8A',
  subtle: '#272727',
  error: '#FF453A',
  success: '#30D158',
};

// Create the theme context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Get the device's color scheme
  const deviceColorScheme = useColorScheme();
  
  // Get user preferences from Redux
  const { theme: userTheme } = useSelector(state => state.settings);
  
  // Determine the active theme
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Set the theme based on user preference or device setting
    if (userTheme === 'system') {
      setIsDark(deviceColorScheme === 'dark');
    } else {
      setIsDark(userTheme === 'dark');
    }
  }, [userTheme, deviceColorScheme]);
  
  // Set the colors based on the active theme
  const colors = isDark ? darkColors : lightColors;
  
  return (
    <ThemeContext.Provider value={{ isDark, colors, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};