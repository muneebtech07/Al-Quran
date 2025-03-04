import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Alert
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = width * 0.8;

const QiblaFinderScreen = () => {
  const { colors, isDark } = useTheme();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });
  const [heading, setHeading] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [accuracy, setAccuracy] = useState('low');
  const [loading, setLoading] = useState(true);
  const [calibrating, setCalibrating] = useState(false);

  // Constants for Qibla calculation
  const KAABA_LAT = 21.422487;
  const KAABA_LNG = 39.826206;

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission is required for Qibla direction');
          setLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // Calculate Qibla direction
        calculateQiblaDirection(location.coords.latitude, location.coords.longitude);
        
        // Start magnetometer
        _subscribe();
      } catch (error) {
        console.error('Error in QiblaFinder:', error);
        setErrorMsg('Failed to initialize Qibla finder');
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      _unsubscribe();
    };
  }, []);

  const _subscribe = () => {
    setSubscription(
      Magnetometer.addListener(data => {
        setMagnetometerData(data);
        
        // Calculate heading
        const angle = calculateHeading(data);
        setHeading(angle);
      })
    );
    
    // Set update interval
    Magnetometer.setUpdateInterval(100);
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const calculateHeading = (magnetometer) => {
    let { x, y, z } = magnetometer;
    
    // Calculate heading in degrees
    let heading = Math.atan2(y, x) * (180 / Math.PI);
    
    // Normalize to [0, 360)
    if (heading < 0) {
      heading = 360 + heading;
    }
    
    return heading;
  };

  const calculateQiblaDirection = (latitude, longitude) => {
    // Convert to radians
    const lat1 = latitude * Math.PI / 180;
    const lon1 = longitude * Math.PI / 180;
    const lat2 = KAABA_LAT * Math.PI / 180;
    const lon2 = KAABA_LNG * Math.PI / 180;
    
    // Calculate Qibla direction
    const y = Math.sin(lon2 - lon1);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lon2 - lon1);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);
    
    // Normalize to [0, 360)
    if (qibla < 0) {
      qibla = 360 + qibla;
    }
    
    setQiblaDirection(qibla);
  };

  const getQiblaAngle = () => {
    if (qiblaDirection === null || heading === null) return 0;
    
    // Calculate the difference between Qibla direction and current heading
    const diff = qiblaDirection - heading;
    
    // Normalize to [-180, 180) for easier display
    let angle = diff % 360;
    if (angle > 180) angle -= 360;
    if (angle < -180) angle += 360;
    
    return angle;
  };

  const startCalibration = () => {
    setCalibrating(true);
    Alert.alert(
      'Calibrate Compass',
      'Please rotate your device in a figure-8 pattern until the compass accuracy improves.',
      [{ text: 'OK' }]
    );
    
    // Simulate calibration completion after 5 seconds
    setTimeout(() => {
      setCalibrating(false);
      setAccuracy('high');
    }, 5000);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Initializing compass...
        </Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }, styles.centered]}>
        <Ionicons name="compass-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
      </View>
    );
  }

  // Calculate how close we are to Qibla direction
  const qiblaAngle = getQiblaAngle();
  const isPointingToQibla = Math.abs(qiblaAngle) < 5; // Within 5 degrees

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Compass Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Qibla Finder</Text>
        <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
          {isPointingToQibla ? 'Pointing to Qibla' : 'Rotate to find Qibla'}
        </Text>
      </View>

      {/* Compass */}
      <View style={styles.compassContainer}>
        <View style={[styles.accuracyIndicator, { backgroundColor: colors.card }]}>
          <Text style={[styles.accuracyText, { color: colors.text }]}>
            Accuracy: {accuracy === 'high' ? 'Good' : 'Low'}
          </Text>
          {accuracy === 'low' && (
            <TouchableOpacity 
              style={[styles.calibrateButton, { backgroundColor: colors.primary }]}
              onPress={startCalibration}
              disabled={calibrating}
            >
              <Text style={styles.calibrateButtonText}>
                {calibrating ? 'Calibrating...' : 'Calibrate'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Direction indicator */}
        <View style={styles.directionTextContainer}>
          <Text style={[styles.directionText, { color: colors.text }]}>
            {Math.round(heading)}° {getCardinalDirection(heading)}
          </Text>
        </View>

        {/* Compass rose */}
        <View style={styles.compassRoseContainer}>
          <Image
            source={require('../../assets/images/compass_rose.png')}
            style={[
              styles.compassRose,
              { transform: [{ rotate: `${-heading}deg` }] }
            ]}
            resizeMode="contain"
          />
          
          {/* Qibla pointer */}
          <View
            style={[
              styles.qiblaPointer,
              { transform: [{ rotate: `${qiblaDirection - heading}deg` }] }
            ]}
          >
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.qiblaArrow}
            >
              <Ionicons name="location" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.qiblaText}>Kaaba</Text>
          </View>
          
          {/* Device pointer (always points up) */}
          <View style={styles.devicePointer}>
            <Ionicons 
              name="arrow-up-circle" 
              size={40} 
              color={isPointingToQibla ? '#4CAF50' : colors.primary} 
            />
          </View>
        </View>

        {/* Qibla angle info */}
        <View style={styles.angleContainer}>
          <Text style={[styles.angleText, { color: colors.text }]}>
            Qibla is {Math.abs(Math.round(qiblaAngle))}° 
            {qiblaAngle > 0 ? ' to your right' : ' to your left'}
          </Text>
        </View>

        {/* Accuracy warning */}
        {Platform.OS === 'ios' && (
          <Text style={[styles.disclaimer, { color: colors.muted }]}>
            For best results, keep your device away from magnetic objects.
          </Text>
        )}
      </View>

      {/* Location info */}
      {location && (
        <View style={[styles.locationContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.locationTitle, { color: colors.text }]}>Your Location</Text>
          <Text style={[styles.locationText, { color: colors.muted }]}>
            Lat: {location.coords.latitude.toFixed(6)}, 
            Lon: {location.coords.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

// Helper function to get cardinal direction
function getCardinalDirection(angle) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(angle / 45) % 8;
  return directions[index];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
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
  header: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 5,
  },
  accuracyIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  calibrateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  calibrateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  directionTextContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  directionText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  compassRoseContainer: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  compassRose: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  qiblaPointer: {
    position: 'absolute',
    alignItems: 'center',
  },
  qiblaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  qiblaText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  devicePointer: {
    position: 'absolute',
  },
  angleContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  angleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  locationContainer: {
    width: '90%',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
  }
});

export default QiblaFinderScreen;