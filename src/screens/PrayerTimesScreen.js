import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { updatePrayerSettings } from '../store/slices/settingsSlice';
import { fetchPrayerTimes } from '../services/api';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PrayerTimesScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const prayerSettings = useSelector(state => state.settings.prayerSettings);
  
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  // Prayer names and icons
  const prayerInfo = {
    Fajr: { name: 'Fajr', icon: 'sunny-outline', color: '#FF7E67' },
    Dhuhr: { name: 'Dhuhr', icon: 'sunny', color: '#FFC947' },
    Asr: { name: 'Asr', icon: 'partly-sunny', color: '#FFA62B' },
    Maghrib: { name: 'Maghrib', icon: 'moon-outline', color: '#16697A' },
    Isha: { name: 'Isha', icon: 'moon', color: '#1A1A2E' },
    Sunrise: { name: 'Sunrise', icon: 'sunny-outline', color: '#FF9933' },
    Midnight: { name: 'Midnight', icon: 'moon', color: '#0F3057' },
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Fetch prayer times with the location
        const times = await fetchPrayerTimes(
          location.coords.latitude,
          location.coords.longitude,
          prayerSettings.calculationMethod === 'muslimWorldLeague' ? 3 : 2
        );
        
        // Get today's prayer times
        const today = new Date();
        const day = today.getDate();
        
        if (times && times[day - 1] && times[day - 1].timings) {
          const todayTimes = times[day - 1].timings;
          
          // Clean up the time strings (remove the timezone part)
          Object.keys(todayTimes).forEach(key => {
            todayTimes[key] = todayTimes[key].split(' ')[0];
          });
          
          setPrayerTimes(todayTimes);
          calculateNextPrayer(todayTimes);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
        setErrorMsg('Could not fetch prayer times. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
    
    // Update time remaining every minute
    const timer = setInterval(() => {
      setCurrentDate(new Date());
      if (prayerTimes && nextPrayer) {
        updateTimeRemaining();
      }
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [prayerSettings.calculationMethod]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (location) {
        const times = await fetchPrayerTimes(
          location.coords.latitude,
          location.coords.longitude,
          prayerSettings.calculationMethod === 'muslimWorldLeague' ? 3 : 2
        );
        
        const today = new Date();
        const day = today.getDate();
        
        if (times && times[day - 1] && times[day - 1].timings) {
          const todayTimes = times[day - 1].timings;
          
          // Clean up the time strings
          Object.keys(todayTimes).forEach(key => {
            todayTimes[key] = todayTimes[key].split(' ')[0];
          });
          
          setPrayerTimes(todayTimes);
          calculateNextPrayer(todayTimes);
        }
      }
    } catch (error) {
      console.error('Error refreshing prayer times:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const calculateNextPrayer = (times) => {
    const now = new Date();
    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    let nextPrayerName = null;
    let nextPrayerTime = null;
    
    for (const prayer of prayers) {
      if (!times[prayer]) continue;
      
      const [hours, minutes] = times[prayer].split(':').map(Number);
      const prayerTime = new Date(now);
      prayerTime.setHours(hours, minutes, 0, 0);
      
      if (prayerTime > now) {
        nextPrayerName = prayer;
        nextPrayerTime = prayerTime;
        break;
      }
    }
    
    // If no next prayer found for today, next prayer is Fajr tomorrow
    if (!nextPrayerName) {
      nextPrayerName = 'Fajr';
      const [hours, minutes] = times['Fajr'].split(':').map(Number);
      nextPrayerTime = new Date(now);
      nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
      nextPrayerTime.setHours(hours, minutes, 0, 0);
    }
    
    setNextPrayer({ name: nextPrayerName, time: nextPrayerTime });
    updateTimeRemaining(nextPrayerTime);
  };
  
  const updateTimeRemaining = (prayerTime = nextPrayer?.time) => {
    if (!prayerTime) return;
    
    const now = new Date();
    const diff = prayerTime - now;
    
    if (diff <= 0) {
      setTimeRemaining('Now');
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    setTimeRemaining(`${hours}h ${minutes}m`);
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  const getHijriDate = () => {
    // This is a simplified version - in a real app, you might want to use a library
    // or an API to get the accurate Hijri date
    return "14 Ramadan 1446";
  };
  
  const navigateToQibla = () => {
    navigation.navigate('QiblaFinder');
  };
  
  const openCalculationMethodSettings = () => {
    // For simplicity, we'll just toggle between two methods
    const newMethod = prayerSettings.calculationMethod === 'muslimWorldLeague' 
      ? 'hanafi' 
      : 'muslimWorldLeague';
      
    dispatch(updatePrayerSettings({ calculationMethod: newMethod }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Fetching prayer times...
        </Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRefresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header with date and settings */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <Text style={[styles.hijriDate, { color: colors.muted }]}>
            {getHijriDate()}
          </Text>
        </View>
        <TouchableOpacity onPress={openCalculationMethodSettings}>
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Next prayer card */}
      {nextPrayer && prayerTimes && (
        <LinearGradient
          colors={
            isDark 
              ? [colors.card, colors.primary + '80'] 
              : [colors.primary + '20', colors.primary + '50']
          }
          style={styles.nextPrayerCard}
        >
          <View style={styles.nextPrayerContent}>
            <Text style={[styles.nextPrayerLabel, { color: colors.text }]}>
              Next Prayer
            </Text>
            <Text style={[styles.nextPrayerName, { color: colors.text }]}>
              {nextPrayer.name}
            </Text>
            <Text style={[styles.nextPrayerTime, { color: colors.primary }]}>
              {formatTime(prayerTimes[nextPrayer.name])}
            </Text>
            <View style={styles.timeRemainingContainer}>
              <Ionicons name="time-outline" size={18} color={colors.muted} />
              <Text style={[styles.timeRemaining, { color: colors.muted }]}>
                {timeRemaining}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.qiblaButton, { backgroundColor: colors.primary }]}
            onPress={navigateToQibla}
          >
            <Ionicons name="navigate" size={24} color="#fff" />
            <Text style={styles.qiblaButtonText}>Qibla</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Prayer times list */}
      <View style={styles.prayerTimesContainer}>
        {prayerTimes && Object.entries(prayerTimes).map(([prayer, time]) => {
          // Skip prayers we don't want to show
          if (
            (prayer === 'Imsak' || prayer === 'Sunset' || prayer === 'Firstthird' || 
             prayer === 'Lastthird' || prayer === 'Midnight' && !prayerSettings.showMidnight) ||
            (prayer === 'Sunrise' && !prayerSettings.showSunrise)
          ) {
            return null;
          }

          const prayerData = prayerInfo[prayer] || { 
            name: prayer, 
            icon: 'time-outline',
            color: colors.primary 
          };

          const isNext = nextPrayer && nextPrayer.name === prayer;

          return (
            <View 
              key={prayer}
              style={[
                styles.prayerTimeItem, 
                { backgroundColor: colors.card },
                isNext && styles.nextPrayerItem
              ]}
            >
              <View style={[styles.prayerIconContainer, { backgroundColor: prayerData.color + '30' }]}>
                <Ionicons name={prayerData.icon} size={24} color={prayerData.color} />
              </View>
              <View style={styles.prayerNameContainer}>
                <Text style={[styles.prayerName, { color: colors.text }]}>
                  {prayerData.name}
                </Text>
              </View>
              <Text style={[styles.prayerTime, { color: isNext ? colors.primary : colors.text }]}>
                {formatTime(time)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Calculation method info */}
      <View style={[styles.calculationInfo, { backgroundColor: colors.card }]}>
        <Text style={[styles.calculationMethod, { color: colors.text }]}>
          Calculation Method: {prayerSettings.calculationMethod === 'muslimWorldLeague' 
            ? 'Muslim World League' 
            : 'Hanafi'}
        </Text>
        <Text style={[styles.locationText, { color: colors.muted }]}>
          {location ? 
            `Location: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 
            'Location: Unknown'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hijriDate: {
    fontSize: 14,
    marginTop: 4,
  },
  nextPrayerCard: {
    margin: 15,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPrayerContent: {
    flex: 1,
  },
  nextPrayerLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  nextPrayerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nextPrayerTime: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timeRemainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeRemaining: {
    fontSize: 14,
    marginLeft: 5,
  },
  qiblaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  qiblaButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  prayerTimesContainer: {
    paddingHorizontal: 15,
  },
  prayerTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  nextPrayerItem: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CD964',
  },
  prayerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  prayerNameContainer: {
    flex: 1,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  calculationInfo: {
    margin: 15,
    padding: 15,
    borderRadius: 8,
  },
  calculationMethod: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 12,
  }
});

export default PrayerTimesScreen;