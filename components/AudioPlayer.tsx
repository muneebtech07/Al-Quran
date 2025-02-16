import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import useSettingsStore from '../store/useSettingsStore';

interface AudioPlayerProps {
  isMinimized?: boolean;
  onExpand?: () => void;
}

export default function AudioPlayer({ isMinimized = true, onExpand }: AudioPlayerProps) {
  const { playbackSpeed, loopEnabled, updateSettings } = useSettingsStore();

  return (
    <View style={[styles.container, isMinimized ? styles.minimized : styles.expanded]}>
      {isMinimized ? (
        <TouchableOpacity style={styles.miniPlayer} onPress={onExpand}>
          <FontAwesome5 name="play" size={16} color="#2E7D32" />
          <Text style={styles.miniText}>Now Playing: Al-Fatihah</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.fullPlayer}>
          <Text style={styles.title}>Al-Fatihah</Text>
          <View style={styles.controls}>
            <TouchableOpacity>
              <FontAwesome5 name="step-backward" size={24} color="#2E7D32" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <FontAwesome5 name="play" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <FontAwesome5 name="step-forward" size={24} color="#2E7D32" />
            </TouchableOpacity>
          </View>
          <View style={styles.settings}>
            <TouchableOpacity
              style={styles.setting}
              onPress={() => updateSettings({ loopEnabled: !loopEnabled })}>
              <FontAwesome5
                name="redo"
                size={20}
                color={loopEnabled ? '#2E7D32' : '#666'}
              />
              <Text style={styles.settingText}>Loop</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.setting}
              onPress={() => updateSettings({ playbackSpeed: playbackSpeed === 1 ? 1.5 : 1 })}>
              <Text style={[styles.speedText, { color: playbackSpeed === 1 ? '#666' : '#2E7D32' }]}>
                {playbackSpeed}x
              </Text>
              <Text style={styles.settingText}>Speed</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  minimized: {
    height: 50,
  },
  expanded: {
    height: 200,
  },
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 10,
  },
  miniText: {
    fontSize: 16,
    color: '#333',
  },
  fullPlayer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginBottom: 20,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settings: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  setting: {
    alignItems: 'center',
  },
  settingText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  speedText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
