import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { calculatePrayerTimes, formatRemainingTime } from '../utils/prayerTimes';
import { Coordinates } from 'adhan';
import { format } from 'date-fns';

const PrayerScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [prayerError, setPrayerError] = useState<string | null>(null);

  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1E1E1E' : '#F5F5F5';

  // Hardcoded coordinates for New York, for now
  const newYorkCoordinates: Coordinates = new Coordinates(40.7128, -74.0060);
  let prayerTimes;
  try {
    prayerTimes = calculatePrayerTimes(newYorkCoordinates);
  } catch (error) {
    console.error("Error calculating prayer times:", error);
    setPrayerError("Failed to load prayer times.");
    prayerTimes = { // Provide default values in case of error
      prayers: [],
      nextPrayer: null,
      remainingTime: null,
    };
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}>
        <Text style={styles.title}>Prayer Times</Text>
        <Text style={styles.location}>New York, United States</Text>

        <View style={styles.nextPrayer}>
          {prayerError ? (
            <Text style={[styles.nextPrayerLabel, { color: 'red' }]}>{prayerError}</Text>
          ) : (
            <>
              <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
              <Text style={styles.nextPrayerName}>
                {prayerTimes.nextPrayer?.name || 'N/A'}
              </Text>
              <Text style={styles.nextPrayerTime}>
                {prayerTimes.nextPrayer?.time || 'N/A'}
              </Text>
              <Text style={styles.countdown}>
                {prayerTimes.nextPrayer?.name ? formatRemainingTime(prayerTimes.remainingTime || 0) + ' remaining' : 'Prayer times not available'}
              </Text>
            </>
          )}
        </View>
      </LinearGradient>

      <View style={styles.prayerList}>
        {prayerTimes.prayers.map((prayer, index) => (
          <View
            key={prayer.name}
            style={[
              styles.prayerCard,
              { backgroundColor: prayer.name === prayerTimes.nextPrayer?.name ? '#2E7D32' : cardBg }
            ]}>
            <View style={styles.prayerInfo}>
              <FontAwesome5
                name="mosque"
                size={20}
                color={prayer.name === prayerTimes.nextPrayer?.name ? '#fff' : '#2E7D32'}
              />
              <Text style={[
                styles.prayerName,
                { color: prayer.name === prayerTimes.nextPrayer?.name ? '#fff' : textColor }
              ]}>
                {prayer.name}
              </Text>
            </View>
            <Text style={[
              styles.prayerTime,
              { color: prayer.name === prayerTimes.nextPrayer?.name ? '#fff' : textColor }
            ]}>
              {prayer.time}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  nextPrayer: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    borderRadius: 15,
  },
  nextPrayerLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  nextPrayerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  nextPrayerTime: {
    fontSize: 20,
    color: '#fff',
    marginTop: 5,
  },
  countdown: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  prayerList: {
    padding: 20,
  },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PrayerScreen;