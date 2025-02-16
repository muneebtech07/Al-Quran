import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { format } from 'date-fns';
import useQuranStore from '../store/useQuranStore';
import { calculatePrayerTimes, formatRemainingTime } from '../utils/prayerTimes';
import { Coordinates } from 'adhan';

const HomeScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const lastRead = useQuranStore((state) => state.lastRead);

  const bgColor = isDark ? '#121212' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const cardBg = isDark ? '#1E1E1E' : '#F5F5F5';

  // Hardcoded coordinates for New York, for now
  const newYorkCoordinates: Coordinates = new Coordinates(40.7128, -74.0060);
  const prayerTimes = calculatePrayerTimes(newYorkCoordinates);

  const QuickAccessCard = ({ icon, title, route }) => (
    <TouchableOpacity
      style={[styles.quickAccessCard, { backgroundColor: cardBg }]}
      onPress={() => router.push(route)}>
      <FontAwesome5 name={icon} size={24} color="#2E7D32" />
      <Text style={[styles.quickAccessTitle, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}>
        <Text style={styles.appTitle}>Al-Quran</Text>
        <Text style={styles.date}>{format(new Date(), 'MMMM d, yyyy')}</Text>

        <View style={styles.prayerInfo}>
          <Text style={styles.prayerTitle}>
            Next Prayer: {prayerTimes.nextPrayer?.name || 'N/A'}
          </Text>
          <Text style={styles.prayerTime}>
            {prayerTimes.nextPrayer?.time || 'N/A'}
          </Text>
          <Text style={styles.countdown}>
            {prayerTimes.nextPrayer?.name ? formatRemainingTime(prayerTimes.remainingTime || 0) + ' remaining' : 'Prayer times not available'}
          </Text>
        </View>
      </LinearGradient>

      {lastRead && (
        <View style={styles.lastRead}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Last Read</Text>
          <TouchableOpacity
            style={[styles.lastReadCard, { backgroundColor: cardBg }]}
            onPress={() => router.push(`/quran/${lastRead.surahId}?verseId=${lastRead.verseId}`)}>
            <View style={styles.lastReadInfo}>
              <Text style={[styles.surahName, { color: textColor }]}>
                Surah {lastRead.surahId}
              </Text>
              <Text style={styles.ayahInfo}>
                Verse {lastRead.verseId}
              </Text>
            </View>
            <FontAwesome5 name="play" size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.quickAccess}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <QuickAccessCard icon="book" title="Juz Index" route="/juz" />
          <QuickAccessCard icon="mosque" title="Surah Index" route="/quran/quran" />
          <QuickAccessCard icon="file-alt" title="Go to Page" route="/page" />
          <QuickAccessCard icon="bookmark" title="Bookmarks" route="/bookmarks" />
        </View>
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
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  prayerInfo: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
  },
  prayerTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  prayerTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  countdown: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  lastRead: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  lastReadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
  },
  lastReadInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  ayahInfo: {
    fontSize: 14,
    color: '#666',
  },
  quickAccess: {
    padding: 20,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  quickAccessCard: {
    width: '47%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAccessTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;