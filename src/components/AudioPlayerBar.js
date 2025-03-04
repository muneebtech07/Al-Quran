import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Modal,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setPlaying, 
  setCurrentTime, 
  setPlaybackRate 
} from '../store/slices/audioPlayerSlice';
import { useTheme } from '../contexts/ThemeContext';
import { formatTime } from '../utils/timeFormatter';
import { BlurView } from 'expo-blur';
import { useAudioManager } from '../hooks/useAudioManager';
import analytics from '../utils/analytics';
import { AnalyticsEvents } from '../utils/analytics';

const { width } = Dimensions.get('window');

const AudioPlayerBar = ({ surahData }) => {
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const { 
    playing, 
    currentSurah, 
    currentAyah, 
    currentTime, 
    duration,
    playbackRate,
    qari,
    repeat
  } = useSelector(state => state.audioPlayer);
  
  const audioManager = useAudioManager();
  const [expanded, setExpanded] = useState(false);
  const [visualizerData, setVisualizerData] = useState([...Array(20)].map(() => Math.random() * 50));
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const visualizerInterval = useRef(null);
  
  useEffect(() => {
    if (playing) {
      // Start visualizer animation when playing
      visualizerInterval.current = setInterval(() => {
        setVisualizerData([...Array(20)].map(() => Math.random() * 50));
      }, 150);
    } else if (visualizerInterval.current) {
      clearInterval(visualizerInterval.current);
    }
    
    return () => {
      if (visualizerInterval.current) {
        clearInterval(visualizerInterval.current);
      }
    };
  }, [playing]);
  
  useEffect(() => {
    // Animation for expanding/collapsing player
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: expanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: expanded ? 1 : 0.95,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [expanded]);
  
  // Return null if no surah is being played
  if (!currentSurah) return null;
  
  const currentSurahName = surahData?.find(s => s.id === currentSurah)?.name?.transliteration?.en || `Surah ${currentSurah}`;
  const currentSurahArabic = surahData?.find(s => s.id === currentSurah)?.name?.short || '';
  
  const handlePlayPause = () => {
    const newState = !playing;
    audioManager.playPause();
    dispatch(setPlaying(newState));
    
    analytics.logEvent(
      newState ? AnalyticsEvents.SURAH_PLAYED : 'surah_paused',
      { surah_id: currentSurah, ayah: currentAyah }
    );
  };
  
  const handleSeek = (value) => {
    audioManager.seekTo(value);
    dispatch(setCurrentTime(value));
  };
  
  const handlePrevious = () => {
    audioManager.playPreviousAyah();
  };
  
  const handleNext = () => {
    audioManager.playNextAyah();
  };
  
  const setSpeed = (rate) => {
    audioManager.setPlaybackRate(rate);
    dispatch(setPlaybackRate(rate));
    setShowSpeedOptions(false);
  };
  
  // Transform values for animated components
  const playerHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 300]
  });
  
  const playerOpacity = slideAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0.8, 1]
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        {
          backgroundColor: isDark ? colors.card : 'rgba(255, 255, 255, 0.95)',
          height: playerHeight,
          transform: [{ scale: scaleAnim }],
          borderColor: colors.border,
        }
      ]}
    >
      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Mini Player (always visible) */}
      <TouchableOpacity 
        style={styles.miniPlayer}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.9}
      >
        <View style={styles.leftControls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Ionicons 
              name={playing ? 'pause' : 'play'} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, { color: colors.text }]} numberOfLines={1}>
            {currentSurahName} {currentAyah ? `· Ayah ${currentAyah}` : ''}
          </Text>
          <Text style={[styles.surahArabic, { color: colors.arabic }]}>
            {currentSurahArabic}
          </Text>
        </View>
        
        <View style={styles.rightControls}>
          <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      
      {/* Expanded Player */}
      <Animated.View 
        style={[
          styles.expandedPlayer,
          { 
            opacity: playerOpacity,
            backgroundColor: 'transparent',
          }
        ]}
      >
        <View style={styles.visualizer}>
          {visualizerData.map((value, index) => (
            <Animated.View
              key={`viz-${index}`}
              style={[
                styles.visualizerBar,
                {
                  height: playing ? value : 5,
                  backgroundColor: colors.primary,
                  opacity: playing ? 0.7 + (value / 100) : 0.3,
                }
              ]}
            />
          ))}
        </View>
        
        <View style={styles.expandedControls}>
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime(currentTime)}
            </Text>
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime(duration)}
            </Text>
          </View>
          
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onValueChange={handleSeek}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={isDark ? '#555555' : '#DDDDDD'}
            thumbTintColor={colors.primary}
          />
          
          <View style={styles.mainControls}>
            <TouchableOpacity style={styles.controlButton} onPress={handlePrevious}>
              <Ionicons name="play-skip-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mainPlayButton} onPress={handlePlayPause}>
              <Ionicons 
                name={playing ? 'pause' : 'play'} 
                size={32} 
                color={'#FFFFFF'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
              <Ionicons name="play-skip-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.additionalControls}>
            <TouchableOpacity 
              style={styles.additionalButton} 
              onPress={() => setShowSpeedOptions(true)}
            >
              <Ionicons name="speedometer-outline" size={20} color={colors.text} />
              <Text style={[styles.additionalButtonText, { color: colors.text }]}>
                {playbackRate}x
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.additionalButton}>
              <Ionicons name="repeat-outline" size={20} color={
                repeat.enabled ? colors.primary : colors.text
              } />
              <Text style={[
                styles.additionalButtonText, 
                { 
                  color: repeat.enabled ? colors.primary : colors.text 
                }
              ]}>
                {repeat.enabled ? `${repeat.count}x` : 'Repeat'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      {/* Playback Rate Modal */}
      <Modal
        visible={showSpeedOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSpeedOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSpeedOptions(false)}
        >
          <View style={[
            styles.speedOptionsContainer, 
            { backgroundColor: isDark ? colors.card : '#FFFFFF' }
          ]}>
            <Text style={[styles.speedTitle, { color: colors.text }]}>
              Playback Speed
            </Text>
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <TouchableOpacity
                key={`rate-${rate}`}
                style={[
                  styles.speedOption,
                  playbackRate === rate && { backgroundColor: colors.primary + '30' }
                ]}
                onPress={() => setSpeed(rate)}
              >
                <Text style={[
                  styles.speedOptionText, 
                  { color: playbackRate === rate ? colors.primary : colors.text }
                ]}>
                  {rate}x
                </Text>
                {playbackRate === rate && (
                  <Ionicons name="checkmark" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    zIndex: 100,
  },
  miniPlayer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahInfo: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: 'center',
  },
  surahName: {
    fontSize: 14,
    fontWeight: '500',
  },
  surahArabic: {
    fontSize: 12,
    opacity: 0.8,
    fontFamily: 'Amiri-Regular',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  expandedPlayer: {
    marginTop: 60,
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
  },
  visualizer: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 60,
  },
  visualizerBar: {
    width: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  expandedControls: {
    width: width - 60,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  mainPlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  additionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
  },
  additionalButtonText: {
    fontSize: 12,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedOptionsContainer: {
    width: width * 0.8,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  speedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  speedOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 4,
  },
  speedOptionText: {
    fontSize: 16,
  },
});

export default AudioPlayerBar;