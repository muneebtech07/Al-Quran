import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import LottieView from 'lottie-react-native';

const SplashScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const lottieRef = useRef(null);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const fadeTextAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start animations in sequence
    Animated.sequence([
      // First fade in the Lottie animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // Then fade in the text after a delay
      Animated.timing(fadeTextAnim, {
        toValue: 1,
        duration: 600,
        delay: 1000,
        useNativeDriver: true,
      })
    ]).start();
    
    // Play Lottie animation
    if (lottieRef.current) {
      setTimeout(() => {
        lottieRef.current?.play();
      }, 100);
    }
    
    // Navigate to main app after animation completes
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 4000); // Allow enough time for the animation to complete
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />
      
      <Animated.View 
        style={[
          styles.content, 
          { opacity: fadeAnim }
        ]}
      >
        <LottieView
          ref={lottieRef}
          source={require('../assets/animations/quran-splash.json')}
          style={styles.lottieAnimation}
          autoPlay={false}
          loop={false}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.textContent,
          { opacity: fadeTextAnim }
        ]}
      >
        <Text style={[styles.title, { color: colors.primary }]}>
          Quran App
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Read, Listen, Connect
        </Text>
      </Animated.View>
      
      <Text style={[styles.footerText, { color: colors.muted }]}>
        © 2025 MuneebTech07
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  lottieAnimation: {
    width: 240,
    height: 240,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
  }
});

export default SplashScreen;