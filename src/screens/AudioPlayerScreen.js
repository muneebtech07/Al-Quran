import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { 
  setPlayingState,
  setCurrentAudio,
  setCurrentSurah, 
  setCurrentAyah,
  updatePlaybackPosition,
  setDuration,
  setPlaybackRate,
  setLoadingState,
  setLoadedState,
  setError,
  setRepeatMode,
  setQari,
  setSleepTimer,
  resetPlayer
} from '../store/slices/audioPlayerSlice';
import { fetchRecitersList, fetchSurahByNumber, getAudioUrl } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

const AudioPlayerScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const audioPlayer = useSelector(state => state.audioPlayer);
  const { fontSize } = useSelector(state => state.settings);
  
  const {
    isPlaying,
    currentAudio,
    currentSurah,
    currentAyah,
    playbackPosition,
    duration,
    playbackRate,
    isLoading,
    isLoaded,
    error,
    repeatMode,
    qari,
    sleepTimerMinutes,
    sleepTimerEndTime
  } = audioPlayer;

  const sound = useRef(null);
  const [surahData, setSurahData] = useState(null);
  const [reciters, setReciters] = useState([]);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const timerRef = useRef(null);

  // Initialize with passed parameters or use stored state
  useEffect(() => {
    const initPlayer = async () => {
      try {
        // Get available reciters
        const recitersList = await fetchRecitersList();
        setReciters(recitersList);
        
        // Initialize from route params if provided
        if (route.params?.surahId) {
          const surahId = route.params.surahId;
          const ayahNumber = route.params.ayahNumber || 1;
          
          const surah = await fetchSurahByNumber(surahId);
          setSurahData(surah);
          
          dispatch(setCurrentSurah(surahId));
          dispatch(setCurrentAyah(ayahNumber));
          
          // Load audio if we weren't already playing this
          if (currentSurah !== surahId || currentAyah !== ayahNumber) {
            loadAudio(surahId, ayahNumber);
          }
        } else if (currentSurah && currentAyah) {
          // Resume previous session
          const surah = await fetchSurahByNumber(currentSurah);
          setSurahData(surah);
        } else {
          // Default to first surah
          const surah = await fetchSurahByNumber(1);
          setSurahData(surah);
          dispatch(setCurrentSurah(1));
          dispatch(setCurrentAyah(1));
          loadAudio(1, 1);
        }
        
        // Setup audio mode for background play
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false
        });
      } catch (error) {
        console.error('Error initializing player:', error);
        dispatch(setError('Failed to initialize audio player'));
      }
    };
    
    initPlayer();
    
    // Set up timer for updating playback position
    const positionTimer = setInterval(() => {
      if (sound.current && isPlaying) {
        updatePosition();
      }
    }, 1000);
    
    // Set up sleep timer checker
    const sleepTimerChecker = setInterval(() => {
      if (sleepTimerEndTime && Date.now() >= sleepTimerEndTime) {
        handlePlayPause();
        dispatch(setSleepTimer(0));
      }
    }, 1000);
    
    return () => {
      clearInterval(positionTimer);
      clearInterval(sleepTimerChecker);
      
      // Clean up audio
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const loadAudio = async (surahId, ayahNumber) => {
    try {
      // Unload previous audio
      if (sound.current) {
        await sound.current.unloadAsync();
      }
      
      dispatch(setLoadingState(true));
      dispatch(setLoadedState(false));
      dispatch(setError(null));
      
      // Find current reciter or use default
      let reciterId = 'ar.alafasy';  // Default
      if (qari && reciters.length > 0) {
        const selectedReciter = reciters.find(r => r.name === qari);
        if (selectedReciter) {
          reciterId = selectedReciter.identifier;
        }
      }
      
      // Get audio URL
      const audioUrl = getAudioUrl(reciterId, surahId, ayahNumber);
      
      // Load audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, rate: playbackRate },
        onPlaybackStatusUpdate
      );
      
      sound.current = newSound;
      dispatch(setCurrentAudio(audioUrl));
      dispatch(setCurrentSurah(surahId));
      dispatch(setCurrentAyah(ayahNumber));
      dispatch(setLoadedState(true));
      dispatch(setLoadingState(false));
    } catch (error) {
      console.error('Error loading audio:', error);
      dispatch(setError('Failed to load audio'));
      dispatch(setLoadingState(false));
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      dispatch(updatePlaybackPosition(status.positionMillis));
      dispatch(setDuration(status.durationMillis));
      
      // Handle playback completion
      if (status.didJustFinish && !status.isLooping) {
        handlePlaybackFinished();
      }
    } else if (status.error) {
      console.error('Playback error:', status.error);
      dispatch(setError(`Playback error: ${status.error}`));
    }
  };

  const updatePosition = async () => {
    if (sound.current) {
      const status = await sound.current.getStatusAsync();
      if (status.isLoaded) {
        dispatch(updatePlaybackPosition(status.positionMillis));
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound.current) return;
    
    try {
      if (isPlaying) {
        await sound.current.pauseAsync();
      } else {
        await sound.current.playAsync();
      }
      dispatch(setPlayingState(!isPlaying));
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleSeek = async (value) => {
    if (!sound.current) return;
    
    try {
      await sound.current.setPositionAsync(value);
      dispatch(updatePlaybackPosition(value));
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const handlePlaybackFinished = () => {
    // Handle different repeat modes
    if (repeatMode === 'ayah') {
      // Repeat the same ayah
      handleSeek(0);
      sound.current.playAsync();
    } else if (repeatMode === 'surah') {
      // If it's the last ayah, go back to first ayah
      if (currentAyah >= surahData.numberOfAyahs) {
        loadAudio(currentSurah, 1)
          .then(() => sound.current.playAsync());
      } else {
        // Otherwise go to next ayah
        loadAudio(currentSurah, currentAyah + 1)
          .then(() => sound.current.playAsync());
      }
    } else {
      // Go to next ayah or surah
      handleNext();
    }
  };

  const handlePrevious = async () => {
    if (!surahData) return;
    
    try {
      if (currentAyah > 1) {
        // Go to previous ayah in current surah
        await loadAudio(currentSurah, currentAyah - 1);
      } else if (currentSurah > 1) {
        // Go to last ayah of previous surah
        const prevSurah = await fetchSurahByNumber(currentSurah - 1);
        await loadAudio(currentSurah - 1, prevSurah.numberOfAyahs);
        setSurahData(prevSurah);
      }
      
      if (isPlaying) {
        await sound.current.playAsync();
      }
    } catch (error) {
      console.error('Error navigating to previous:', error);
    }
  };

  const handleNext = async () => {
    if (!surahData) return;
    
    try {
      if (currentAyah < surahData.numberOfAyahs) {
        // Go to next ayah in current surah
        await loadAudio(currentSurah, currentAyah + 1);
      } else if (currentSurah < 114) {
        // Go to first ayah of next surah
        const nextSurah = await fetchSurahByNumber(currentSurah + 1);
        await loadAudio(currentSurah + 1, 1);
        setSurahData(nextSurah);
      }
      
      if (isPlaying) {
        await sound.current.playAsync();
      }
    } catch (error) {
      console.error('Error navigating to next:', error);
    }
  };

  const handleRepeatModeChange = () => {
    const modes = ['none', 'ayah', 'surah'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    dispatch(setRepeatMode(modes[nextIndex]));
  };

  const handlePlaybackRateChange = async (rate) => {
    if (!sound.current) return;
    
    try {
      await sound.current.setRateAsync(rate, true);
      dispatch(setPlaybackRate(rate));
      setShowSpeedModal(false);
    } catch (error) {
      console.error('Error changing playback rate:', error);
    }
  };

  const handleReciterChange = (selectedReciter) => {
    dispatch(setQari(selectedReciter.name));
    setShowReciterModal(false);
    
    // Reload the current audio with new reciter
    loadAudio(currentSurah, currentAyah);
  };

  const handleSleepTimerSet = (minutes) => {
    dispatch(setSleepTimer(minutes));
    setShowSleepTimerModal(false);
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '00:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getAyahText = () => {
    if (!surahData || !surahData.ayahs || !currentAyah) return '';
    
    const ayah = surahData.ayahs.find(a => a.numberInSurah === currentAyah);
    return ayah ? ayah.text : '';
  };

  // Dynamically adjust font size based on user preference
  const getFontSize = () => {
    switch(fontSize) {
      case 'small': return 20;
      case 'large': return 28;
      case 'xlarge': return 32;
      case 'medium':
      default: return 24;
    }
  };

  const renderRateButton = (rate) => {
    const isSelected = playbackRate === rate;
    return (
      <TouchableOpacity
        style={[
          styles.rateButton,
          isSelected && { backgroundColor: colors.primary }
        ]}
        onPress={() => handlePlaybackRateChange(rate)}
      >
        <Text style={[
          styles.rateButtonText,
          { color: isSelected ? '#fff' : colors.text }
        ]}>
          {rate}x
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSleepTimerButton = (minutes, label) => {
    const isSelected = sleepTimerMinutes === minutes;
    return (
      <TouchableOpacity
        style={[
          styles.timerButton,
          isSelected && { backgroundColor: colors.primary }
        ]}
        onPress={() => handleSleepTimerSet(minutes)}
      >
        <Text style={[
          styles.timerButtonText,
          { color: isSelected ? '#fff' : colors.text }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cover Art and Surah Info */}
      <LinearGradient
        colors={
          isDark 
            ? [colors.card, colors.primary + '40'] 
            : [colors.primary + '10', colors.primary + '30']
        }
        style={styles.header}
      >
        <View style={styles.coverArtContainer}>
          <View style={[styles.coverArt, { backgroundColor: colors.card }]}>
            <Text style={[styles.coverArtText, { color: colors.primary }]}>
              {currentSurah || '-'}
            </Text>
          </View>
        </View>
        
        <View style={styles.surahInfoContainer}>
          <Text style={[styles.surahName, { color: colors.text }]}>
            {surahData ? surahData.name : 'Loading...'}
          </Text>
          <Text style={[styles.ayahInfo, { color: colors.muted }]}>
            {surahData ? `Ayah ${currentAyah} of ${surahData.numberOfAyahs}` : ''}
          </Text>
          <Text style={[styles.reciterName, { color: colors.text }]}>
            {qari || 'Default Reciter'}
          </Text>
        </View>
      </LinearGradient>

      {/* Arabic Text */}
      <ScrollView style={styles.arabicTextContainer}>
        <Text style={[
          styles.arabicText, 
          { color: colors.text, fontSize: getFontSize() },
        ]}>
          {getAyahText()}
        </Text>
      </ScrollView>

      {/* Playback Controls */}
      <View style={styles.controlsContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text style={[styles.timeText, { color: colors.muted }]}>
            {formatTime(playbackPosition)}
          </Text>
          <Slider
            style={styles.progressBar}
            minimumValue={0}
            maximumValue={duration || 1}
            value={playbackPosition || 0}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          <Text style={[styles.timeText, { color: colors.muted }]}>
            {formatTime(duration)}
          </Text>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={30} color={colors.text} />
          </TouchableOpacity>
          
          {isLoading ? (
            <View style={styles.playPauseButtonContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <TouchableOpacity 
              onPress={handlePlayPause} 
              style={[
                styles.playPauseButtonContainer, 
                { backgroundColor: colors.primary }
              ]}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={34} 
                color="#fff" 
                style={isPlaying ? styles.pauseIcon : styles.playIcon} 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={30} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Additional Controls */}
        <View style={styles.additionalControls}>
          <TouchableOpacity 
            onPress={handleRepeatModeChange} 
            style={styles.additionalControlButton}
          >
            <Ionicons 
              name={repeatMode === 'none' ? "repeat" : repeatMode === 'ayah' ? "repeat-outline" : "sync"} 
              size={22} 
              color={repeatMode === 'none' ? colors.muted : colors.primary} 
            />
            <Text style={[
              styles.additionalControlText, 
              { color: repeatMode === 'none' ? colors.muted : colors.primary }
            ]}>
              {repeatMode === 'none' ? 'Repeat' : repeatMode === 'ayah' ? 'Repeat Ayah' : 'Repeat Surah'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowSpeedModal(true)} 
            style={styles.additionalControlButton}
          >
            <Ionicons name="speedometer-outline" size={22} color={colors.text} />
            <Text style={[styles.additionalControlText, { color: colors.text }]}>
              {playbackRate}x
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowReciterModal(true)} 
            style={styles.additionalControlButton}
          >
            <Ionicons name="person-outline" size={22} color={colors.text} />
            <Text style={[styles.additionalControlText, { color: colors.text }]}>
              Reciter
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowSleepTimerModal(true)} 
            style={styles.additionalControlButton}
          >
            <Ionicons 
              name="time-outline" 
              size={22} 
              color={sleepTimerEndTime ? colors.primary : colors.text} 
            />
            <Text style={[
              styles.additionalControlText, 
              { color: sleepTimerEndTime ? colors.primary : colors.text }
            ]}>
              {sleepTimerEndTime ? `${sleepTimerMinutes}m` : 'Timer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      )}

      {/* Playback Speed Modal */}
      <Modal
        visible={showSpeedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSpeedModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpeedModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Playback Speed
            </Text>
            <View style={styles.rateButtonsContainer}>
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(rate => renderRateButton(rate))}
            </View>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowSpeedModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reciters Modal */}
      <Modal
        visible={showReciterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReciterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowReciterModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card, height: '70%' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Reciter
            </Text>
            
            <FlatList
              data={reciters}
              keyExtractor={(item) => item.identifier}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.reciterItem,
                    { borderBottomColor: colors.border },
                    qari === item.name && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => handleReciterChange(item)}
                >
                  <Text style={[
                    styles.reciterItemText, 
                    { color: colors.text },
                    qari === item.name && { fontWeight: 'bold', color: colors.primary }
                  ]}>
                    {item.name}
                  </Text>
                  {qari === item.name && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.recitersList}
            />
            
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowReciterModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sleep Timer Modal */}
      <Modal
        visible={showSleepTimerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSleepTimerModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSleepTimerModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Sleep Timer
            </Text>
            <View style={styles.timerButtonsContainer}>
              {renderSleepTimerButton(0, 'Off')}
              {renderSleepTimerButton(5, '5 min')}
              {renderSleepTimerButton(15, '15 min')}
              {renderSleepTimerButton(30, '30 min')}
              {renderSleepTimerButton(60, '1 hour')}
              {renderSleepTimerButton(120, '2 hours')}
            </View>
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowSleepTimerModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
  coverArtContainer: {
    marginBottom: 20,
  },
  coverArt: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  coverArtText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  surahInfoContainer: {
    alignItems: 'center',
  },
  surahName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ayahInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  reciterName: {
    fontSize: 14,
  },
  arabicTextContainer: {
    flex: 1,
    padding: 20,
  },
  arabicText: {
    fontFamily: 'Scheherazade-Regular',
    textAlign: 'center',
    lineHeight: 50,
  },
  controlsContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeText: {
    fontSize: 12,
    width: 45,
  },
  progressBar: {
    flex: 1,
    height: 40,
    marginHorizontal: 5,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    padding: 10,
  },
  playPauseButtonContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 25,
  },
  playIcon: {
    marginLeft: 5, // Adjust for visual centering
  },
  pauseIcon: {
    // Centered by default
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  additionalControlButton: {
    alignItems: 'center',
  },
  additionalControlText: {
    fontSize: 12,
    marginTop: 5,
  },
  errorContainer: {
    padding: 10,
    margin: 20,
    borderRadius: 5,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  rateButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rateButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  rateButtonText: {
    fontSize: 16,
  },
  modalCloseButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recitersList: {
    width: '100%',
    maxHeight: 400,
  },
  reciterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  reciterItemText: {
    fontSize: 16,
  },
  timerButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timerButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  timerButtonText: {
    fontSize: 16,
  }
});

export default AudioPlayerScreen;