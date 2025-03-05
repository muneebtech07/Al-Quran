import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setPlayback,
  setCurrentTrack,
  setReciter,
  setPlaybackSpeed,
  setRepeatSettings
} from '../store/slices/audioPlayerSlice';
import Slider from '@react-native-community/slider';
import i18n from '../localization/i18n';

const AudioPlayerScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const soundRef = useRef(null);
  
  // MODIFICATION: Add safety check for audioState to prevent "audioState is not defined" error
  const audioState = useSelector(state => state.audioPlayer);
  const isPlaying = audioState?.isPlaying || false;
  const currentTrack = {
    id: audioState?.currentSurah ? `${audioState.currentSurah}_${audioState.currentAyah}` : null,
    surahId: audioState?.currentSurah,
    ayahNumber: audioState?.currentAyah,
    title: audioState?.currentSurah ? `Surah ${audioState.currentSurah}` : null,
    verseNumber: audioState?.currentAyah,
    reciter: audioState?.reciterId,
    audioUrl: audioState?.currentSurah && audioState?.currentAyah ? 
      `https://verses.quran.com/${audioState.reciterId}/${audioState.currentSurah}_${audioState.currentAyah}.mp3` : null
  };
  
  // MODIFICATION: Add these state variables since they're not in your original slice
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [reciterImage, setReciterImage] = useState(null);
  
  // Format time helper function
  const formatTime = (milliseconds) => {
    if (!milliseconds) return '00:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Load and play audio
  const loadAudio = async () => {
    if (!currentTrack?.audioUrl) return;
    
    try {
      setLoading(true);
      
      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      
      // Load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: currentTrack.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      
      soundRef.current = sound;
      
      // Set audio mode
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      
      // MODIFICATION: Update to use your action
      dispatch(setPlayback(true));
      setLoading(false);
    } catch (error) {
      console.error('Error loading audio:', error);
      setLoading(false);
    }
  };
  
  // Playback status update handler
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      // MODIFICATION: Use local state since these aren't in your redux store
      setPlaybackPosition(status.positionMillis);
      setDuration(status.durationMillis);
      
      if (status.didJustFinish) {
        dispatch(setPlayback(false));
        setPlaybackPosition(0);
      }
    }
  };
  
  // Play/pause toggle handler
  const handlePlayPause = async () => {
    if (!soundRef.current) {
      await loadAudio();
      return;
    }
    
    if (isPlaying) {
      await soundRef.current.pauseAsync();
      dispatch(setPlayback(false));
    } else {
      await soundRef.current.playAsync();
      dispatch(setPlayback(true));
    }
  };
  
  // Seek handler
  const handleSeek = async (value) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(value);
      setPlaybackPosition(value);
    }
  };
  
  // Skip functions
  const skipForward = async () => {
    if (soundRef.current) {
      const newPosition = Math.min(playbackPosition + 10000, duration);
      await soundRef.current.setPositionAsync(newPosition);
      setPlaybackPosition(newPosition);
    }
  };
  
  const skipBackward = async () => {
    if (soundRef.current) {
      const newPosition = Math.max(playbackPosition - 10000, 0);
      await soundRef.current.setPositionAsync(newPosition);
      setPlaybackPosition(newPosition);
    }
  };
  
  // Load initial audio
  useEffect(() => {
    // Only load if there's no sound already loaded or if the track changes
    if (route.params?.surahId && route.params?.ayahNumber) {
      // MODIFICATION: Adapt to your state structure
      dispatch(setCurrentTrack({
        surahId: route.params.surahId,
        ayahNumber: route.params.ayahNumber
      }));
    }
  }, [route.params, dispatch]);
  
  // Load audio when currentTrack changes
  useEffect(() => {
    if (currentTrack?.audioUrl) {
      loadAudio();
    }
  }, [currentTrack?.audioUrl]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  
  // Render placeholder if no track
  if (!currentTrack?.surahId) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.noTrackText, { color: colors.text }]}>
          {i18n.t('audio.noTrack')}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {i18n.t('audio.player')}
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {reciterImage ? (
            <Image source={{ uri: reciterImage }} style={styles.reciterImage} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.card }]}>
              <Ionicons name="mic-outline" size={60} color={colors.primary} />
            </View>
          )}
        </View>
        
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, { color: colors.text }]}>
            {currentTrack.title || i18n.t('surah.verse')} {currentTrack.verseNumber}
          </Text>
          <Text style={[styles.reciterName, { color: colors.textSecondary }]}>
            {currentTrack.reciter || 'Unknown Reciter'}
          </Text>
        </View>
        
        <View style={styles.controls}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={playbackPosition}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatTime(playbackPosition)}
            </Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>
              {formatTime(duration)}
            </Text>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity onPress={skipBackward} style={styles.controlButton}>
              <Ionicons name="play-back" size={30} color={colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handlePlayPause} style={styles.playPauseButton}>
              {loading ? (
                <ActivityIndicator color={colors.background} size="large" />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={30} 
                  color={colors.background} 
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={skipForward} style={styles.controlButton}>
              <Ionicons name="play-forward" size={30} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  imageContainer: {
    width: 240,
    height: 240,
    marginBottom: 40,
  },
  reciterImage: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  reciterName: {
    fontSize: 16,
  },
  controls: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    padding: 20,
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#009688',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  noTrackText: {
    textAlign: 'center',
    marginTop: 200,
    fontSize: 18,
  }
});

export default AudioPlayerScreen;