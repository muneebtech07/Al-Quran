import React, { useEffect, useState } from 'react';
    import { View, StyleSheet, Animated, Text } from 'react-native'; // Import Text
    import { FontAwesome5 } from '@expo/vector-icons';
    import { useFonts, Amiri_700Bold } from '@expo-google-fonts/amiri';

    export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
      const [fontsLoaded, fontError] = useFonts({ // Capture fontError
        Amiri_700Bold,
      });

      const [loadingError, setLoadingError] = useState<Error | null>(null); // Add loadingError state
      const opacity = new Animated.Value(0);
      const scale = new Animated.Value(0.8);
      const rotate = new Animated.Value(0);

      useEffect(() => {
        if (fontsLoaded) {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(rotate, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]).start((result) => { // Add callback to start
            if (result.finished) {
              setTimeout(onFinish, 500);
            } else {
              setLoadingError(new Error("Animation interrupted")); // Handle animation interruption
            }
          });
        } else if (fontError) {
          setLoadingError(fontError); // Handle font loading error
        }
      }, [fontsLoaded, fontError]);

      const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });

      if (loadingError) {
        return ( // Render error message if font loading or animation fails
          <View style={styles.container}>
            <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
              Error loading app: {loadingError.message}
            </Text>
          </View>
        );
      }


      if (!fontsLoaded) return null;

      return (
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity,
                transform: [
                  { scale },
                  { rotate: spin }
                ]
              }
            ]}>
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <FontAwesome5
                  name="mosque"
                  size={80}
                  color="#fff"
                  style={styles.icon}
                />
              </View>
              <View style={styles.decorativeIcons}>
                <FontAwesome5
                  name="star"
                  size={24}
                  color="#fff"
                  style={[styles.star, styles.star1]}
                />
                <FontAwesome5
                  name="star"
                  size={20}
                  color="#fff"
                  style={[styles.star, styles.star2]}
                />
                <FontAwesome5
                  name="star"
                  size={16}
                  color="#fff"
                  style={[styles.star, styles.star3]}
                />
              </View>
            </View>
            <Animated.Text style={[styles.title, { opacity }]}>Al-Quran</Animated.Text>
          </Animated.View>
        </View>
      );
    }

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#2E7D32',
        justifyContent: 'center',
        alignItems: 'center',
      },
      content: {
        alignItems: 'center',
      },
      iconContainer: {
        position: 'relative',
        marginBottom: 30,
      },
      iconBackground: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      icon: {
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
      decorativeIcons: {
        position: 'absolute',
        width: '100%',
        height: '100%',
      },
      star: {
        position: 'absolute',
        opacity: 0.8,
      },
      star1: {
        top: 0,
        right: 20,
      },
      star2: {
        top: 40,
        right: 0,
      },
      star3: {
        top: 70,
        right: 30,
      },
      title: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 48,
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      },
    });
