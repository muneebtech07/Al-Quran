import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Switch,
  Platform,
  Alert
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { fetchPrayerTimes } from '../services/api';
import { useSelector, useDispatch } from 'react-redux';
import { updatePrayerSettings } from '../store/slices/settingsSlice';
import i18n from '../localization/i18n';

const PrayerTimesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const prayerSettings = useSelector(state => state.settings.prayerSettings);
  
  const [location, setLocation] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState(null);
  
  useEffect(() => {
    loadPrayerTimes();
  }, [prayerSettings.calculationMethod]);
  
  const loadPrayerTimes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is needed to calculate prayer times');
        setLoading(false);
        return;
      }
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Get prayer times for the month
      const times = await fetchPrayerTimes(
        location.coords.latitude,
        location.coords.longitude,
        prayerSettings.calculationMethod
      );
      
      setPrayerTimes(times);
      calculateNextPrayer(times);
    } catch (err) {
      console.error('Failed to load prayer times:', err);
      setError('Failed to load prayer times. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const calculateNextPrayer = (times) => {
    const now = new Date();
    const today = now.getDate() - 1; // API uses 1-indexed days, JS uses 0-indexed
    
    if (!times || !times[today]) return;
    
    const todayTimes = times[today].timings;
    const prayers = [
      { name: 'Fajr', time: new Date(`${times[today].date.readable} ${todayTimes.Fajr}`) },
      { name: 'Sunrise', time: new Date(`${times[today].date.readable} ${todayTimes.Sunrise}`) },
      { name: 'Dhuhr', time: new Date(`${times[today].date.readable} ${todayTimes.Dhuhr}`) },
      { name: 'Asr', time: new Date(`${times[today].date.readable} ${todayTimes.Asr}`) },
      { name: 'Maghrib', time: new Date(`${times[today].date.readable} ${todayTimes.Maghrib}`) },
      { name: 'Isha', time: new Date(`${times[today].date.readable} ${todayTimes.Isha}`) }
    ];
    
    // Find the next prayer
    const upcomingPrayers = prayers.filter(prayer => prayer.time > now);
    
    if (upcomingPrayers.length > 0) {
      setNextPrayer(upcomingPrayers[0]);
    } else {
      // All prayers for today are done, next is tomorrow's Fajr
      const tomorrowTimes = times[today + 1]?.timings;
      if (tomorrowTimes) {
        setNextPrayer({
          name: 'Fajr',
          time: new Date(`${times[today + 1].date.readable} ${tomorrowTimes.Fajr}`)
        });
      }
    }
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Extract hours and minutes from the time string (e.g. "04:30 (EET)")
    const timeParts = timeString.split(' ')[0].split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    
    return `${hours12}:${minutes} ${period}`;
  };
  
  const getTimeRemaining = (targetTime) => {
    if (!targetTime) return '';
    
    const now = new Date();
    const diff = targetTime - now;
    
    if (diff <= 0) return 'Now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };
  
  const handleCalculationMethodChange = () => {
    Alert.alert(
      'Calculation Method',
      'Choose the method to calculate prayer times',
      [
        { text: 'Muslim World League', onPress: () => updateMethod(1) },
        { text: 'Islamic Society of North America (ISNA)', onPress: () => updateMethod(2) },
        { text: 'Egyptian General Authority', onPress: () => updateMethod(3) },
        { text: 'Umm al-Qura University, Makkah', onPress: () => updateMethod(4) },
        { text: 'University of Islamic Sciences, Karachi', onPress: () => updateMethod(5) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  
  const updateMethod = (methodId) => {
    dispatch(updatePrayerSettings({ calculationMethod: methodId }));
  };
  
  const navigateToQibla = () => {
    navigation.navigate('QiblaFinder');
  };
  
  if (loading) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading prayer times...
        </Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={50} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadPrayerTimes}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Get today's prayer times
  const today = new Date().getDate() - 1;
  const todayTimes = prayerTimes[today]?.timings || {};
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Next Prayer Card */}
      {nextPrayer && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.nextPrayerHeader}>
            <Text style={[styles.nextPrayerTitle, { color: colors.text }]}>
              Next Prayer
            </Text>
            <Text style={[styles.timeRemaining, { color: colors.primary }]}>
              {getTimeRemaining(nextPrayer.time)}
            </Text>
          </View>
          
          <View style={styles.prayerHighlight}>
            <Text style={[styles.nextPrayerName, { color: colors.text }]}>
              {nextPrayer.name}
            </Text>
            <Text style={[styles.nextPrayerTime, { color: colors.primary }]}>
              {formatTime(nextPrayer.time.toTimeString())}
            </Text>
          </View>
        </View>
      )}
      
      {/* All Prayers Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Today's Prayer Times
          </Text>
          <Text style={[styles.date, { color: colors.muted }]}>
            {prayerTimes[today]?.date?.readable}
          </Text>
        </View>
        
        <View style={styles.prayerList}>
          <View style={styles.prayerItem}>
            <View style={styles.prayerNameContainer}>
              <Ionicons name="sunny-outline" size={22} color={colors.primary} />
              <Text style={[styles.prayerName, { color: colors.text }]}>Fajr</Text>
            </View>
            <Text style={[styles.prayerTime, { color: colors.primary }]}>
              {formatTime(todayTimes.Fajr)}
            </Text>
          </View>
          
          <View style={styles.prayerItem}>
            <View style={styles.prayerNameContainer}>
              <Ionicons name="sunny" size={22} color={colors.primary} />
              <Text style={[styles.prayerName, { color: colors.text }]}>Sunrise</Text>
            </View>
            <Text style={[styles.prayerTime, { color: colors.primary }]}>
              {formatTime(todayTimes.Sunrise)}
            </Text>
          </View>
          
          <View style={styles.prayerItem}>
            <View style={styles.prayerNameContainer}>
              <Ionicons name="sunny" size={22} color={colors.primary} />
              <Text style={[styles.prayerName, { color: colors.text }]}>Dhuhr</Text>
            </View>
            <Text style={[styles.prayerTime, { color: colors.primary }]}>
              {formatTime(todayTimes.Dhuhr)}
            </Text>
          </View>
          
          <View style={styles.prayerItem}>
            <View style={styles.prayerNameContainer}>
              <Ionicons name="partly-sunny" size={22} color={colors.primary} />
              <Text style={[styles.prayerName, { color: colors.text }]}>Asr</Text>
            </View>
            <Text style={[styles.prayerTime, { color: colors.primary }]}>
              {formatTime(todayTimes.Asr)}
            </Text>
          </View>
          
          <View style={styles.prayerItem}>
            <View style={styles.prayerNameContainer}>
              <Ionicons name="moon-outline" size={22} color={colors.primary} />
              <Text style={[styles.prayerName, { color: colors.text }]}>Maghrib</Text>
            </View>
            <Text style={[styles.prayerTime, { color: colors.primary }]}>
              {formatTime(todayTimes.Maghrib)}
            </Text>
          </View>
          
          <View style={styles.prayerItem}>
            <View style={styles.prayerNameContainer}>
              <Ionicons name="moon" size={22} color={colors.primary} />
              <Text style={[styles.prayerName, { color: colors.text }]}>Isha</Text>
            </View>
            <Text style={[styles.prayerTime, { color: colors.primary }]}>
              {formatTime(todayTimes.Isha)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Qibla Direction Card */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={navigateToQibla}
      >
        <View style={styles.qiblaCard}>
          <Ionicons name="compass-outline" size={30} color={colors.primary} />
          <Text style={[styles.qiblaText, { color: colors.text }]}>Find Qibla Direction</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.muted} />
        </View>
      </TouchableOpacity>
      
      {/* Settings Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Settings</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleCalculationMethodChange}
        >
          <View style={styles.settingText}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Calculation Method</Text>
            <Text style={[styles.settingValue, { color: colors.muted }]}>
              {prayerSettings.calculationMethod === 1 ? 'Muslim World League' :
               prayerSettings.calculationMethod === 2 ? 'ISNA' :
               prayerSettings.calculationMethod === 3 ? 'Egyptian' :
               prayerSettings.calculationMethod === 4 ? 'Umm al-Qura' :
               prayerSettings.calculationMethod === 5 ? 'Karachi' : 'Standard'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <View style={styles.settingText}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Show Notifications</Text>
          </View>
          <Switch
            value={useSelector(state => state.settings.notifications.prayerReminders)}
            onValueChange={(value) => 
              dispatch(updateNotificationSettings({ prayerReminders: value }))
            }
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  nextPrayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  nextPrayerTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeRemaining: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  prayerHighlight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nextPrayerName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nextPrayerTime: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardHeader: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    marginTop: 5,
  },
  prayerList: {
    marginTop: 5,
  },
  prayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  prayerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 16,
    marginLeft: 10,
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  qiblaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  qiblaText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default PrayerTimesScreen;