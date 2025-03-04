import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { fetchPrayerTimes } from '../services/api';
import i18n from '../localization/i18n';

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const loadPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      const times = await fetchPrayerTimes(location.coords.latitude, location.coords.longitude);
      const today = new Date().getDate();
      setPrayerTimes(times[today - 1].timings);
    } catch (err) {
      console.error('Failed to fetch prayer times:', err);
      setError('Failed to load prayer times. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading prayer times...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={50} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>{i18n.t('home.welcomeMessage')}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('SurahDetail', { surahId: 1, surahName: 'Al-Fatihah' })}
      >
        <View style={styles.cardContent}>
          <Ionicons name="book-outline" size={24} color={colors.primary} />
          <View style={styles.cardTextContainer}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{i18n.t('home.lastRead')}</Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]}>Surah Al-Fatihah</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </View>
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('home.dailyVerse')}</Text>
        </View>
        <View style={styles.quoteContainer}>
          <Text style={[styles.arabicText, { color: colors.arabic }]}>
            إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى
          </Text>
          <Text style={[styles.translationText, { color: colors.text }]}>
            "Indeed, actions are but by intentions, and each person will have only what they intended."
          </Text>
          <Text style={[styles.verseReference, { color: colors.muted }]}>
            - Hadith
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('Prayer')}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{i18n.t('home.prayerTimes')}</Text>
        </View>
        <View style={styles.prayerTimesContainer}>
          <View style={styles.prayerTime}>
            <Text style={[styles.prayerName, { color: colors.text }]}>Fajr</Text>
            <Text style={[styles.prayerTimeText, { color: colors.primary }]}>
              {formatTime(prayerTimes.Fajr)}
            </Text>
          </View>
          <View style={styles.prayerTime}>
            <Text style={[styles.prayerName, { color: colors.text }]}>Dhuhr</Text>
            <Text style={[styles.prayerTimeText, { color: colors.primary }]}>
              {formatTime(prayerTimes.Dhuhr)}
            </Text>
          </View>
          <View style={styles.prayerTime}>
            <Text style={[styles.prayerName, { color: colors.text }]}>Asr</Text>
            <Text style={[styles.prayerTimeText, { color: colors.primary }]}>
              {formatTime(prayerTimes.Asr)}
            </Text>
          </View>
          <View style={styles.prayerTime}>
            <Text style={[styles.prayerName, { color: colors.text }]}>Maghrib</Text>
            <Text style={[styles.prayerTimeText, { color: colors.primary }]}>
              {formatTime(prayerTimes.Maghrib)}
            </Text>
          </View>
          <View style={styles.prayerTime}>
            <Text style={[styles.prayerName, { color: colors.text }]}>Isha</Text>
            <Text style={[styles.prayerTimeText, { color: colors.primary }]}>
              {formatTime(prayerTimes.Isha)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    margin: 15,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 5,
  },
  cardHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  quoteContainer: {
    padding: 10,
  },
  arabicText: {
    fontFamily: 'Scheherazade-Regular',
    fontSize: 30,
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 20,
  },
  translationText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  verseReference: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  prayerTimesContainer: {
    padding: 10,
  },
  prayerTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  prayerName: {
    fontSize: 16,
  },
  prayerTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
});

export default HomeScreen;