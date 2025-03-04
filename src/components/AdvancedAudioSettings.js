import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import {
  setPlaybackRate,
  setRepeatSettings,
  setSleepTimer,
  toggleAutoScroll,
  setAudioQuality,
} from '../store/slices/audioPlayerSlice';
import Slider from '@react-native-community/slider';
import { minutesToMilliseconds, formatTimeRemaining } from '../utils/timeFormatter';

const AdvancedAudioSettings = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const { 
    playbackRate, 
    repeat, 
    sleepTimer, 
    autoScroll,
    audioQuality
  } = useSelector(state => state.audioPlayer);
  
  const [sleepMinutes, setSleepMinutes] = useState(15);

  useEffect(() => {
    // Update timer countdown every minute if enabled
    let interval;
    if (sleepTimer.enabled) {
      interval = setInterval(() => {
        dispatch(decrementSleepTimer());
      }, 60000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sleepTimer.enabled, dispatch]);

  const handlePlaybackRateChange = (rate) => {
    dispatch(setPlaybackRate(parseFloat(rate.toFixed(2))));
  };

  const handleRepeatCountChange = (count) => {
    dispatch(setRepeatSettings({ count: Math.round(count) }));
  };

  const toggleRepeatMode = () => {
    dispatch(setRepeatSettings({ enabled: !repeat.enabled }));
  };

  const setRepeatType = (type) => {
    dispatch(setRepeatSettings({ type }));
  };

  const handleSleepTimerChange = (minutes) => {
    setSleepMinutes(Math.round(minutes));
  };

  const toggleSleepTimer = () => {
    if (sleepTimer.enabled) {
      dispatch(setSleepTimer({ enabled: false }));
    } else {
      dispatch(setSleepTimer({
        enabled: true,