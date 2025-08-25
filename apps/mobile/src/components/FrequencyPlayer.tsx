import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { logger } from '@cosmichub/config';

interface Props {
  frequencyType: 'meditation' | 'sleep' | 'focus' | 'creativity' | 'lucid';
  frequency: number;
  duration?: number;
}

export function FrequencyPlayer({ frequencyType, frequency, duration = 600 }: Props) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);

  const frequencyInfo = {
    meditation: { name: 'Deep Meditation', color: '#4a90e2', emoji: '🧘' },
    sleep: { name: 'Restorative Sleep', color: '#5856d6', emoji: '💤' },
    focus: { name: 'Enhanced Focus', color: '#ff9500', emoji: '⚡' },
    creativity: { name: 'Creative Flow', color: '#32d74b', emoji: '🌟' },
    lucid: { name: 'Lucid Dreams', color: '#af52de', emoji: '🎯' },
  };

  const info = frequencyInfo[frequencyType];

  useEffect(() => {
    return sound
      ? () => {
          void sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playPauseAudio = async (): Promise<void> => {
    if (sound === null || sound === undefined) {
      setIsLoading(true);
      try {
        // In a real app, you'd load the actual binaural beat audio files
        const audioSource = { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' } as const;
        const { sound: newSound } = await Audio.Sound.createAsync(
          audioSource,
          { shouldPlay: true, volume }
        );
        setSound(newSound);
        setIsPlaying(true);
      } catch (error) {
        logger.error('Error loading audio:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setPosition(0);
    }
  };

  const onVolumeChange = async (value: number) => {
    setVolume(value);
    if (sound) {
      await sound.setVolumeAsync(value);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Safe wrapper functions for button handlers
  const handlePlayPause = (): void => {
    void playPauseAudio();
  };

  const handleStop = (): void => {
    void stopAudio();
  };

  const handleVolumeChange = (value: number): void => {
    void onVolumeChange(value);
  };

  return (
    <View style={[styles.container, { borderColor: info.color }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{info.emoji}</Text>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{info.name}</Text>
          <Text style={styles.frequency}>{frequency} Hz Binaural Beat</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: info.color }]}
          onPress={handlePlayPause}
          disabled={isLoading}
        >
          <Text style={styles.playButtonText}>
            {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
          <Text style={styles.stopButtonText}>⏹️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(position / duration) * 100}%`, backgroundColor: info.color }
            ]} 
          />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.volumeSection}>
        <Text style={styles.volumeLabel}>🔊</Text>
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={handleVolumeChange}
          minimumTrackTintColor={info.color}
          maximumTrackTintColor="#333"
          thumbTintColor={info.color}
        />
        <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
      </View>

      <Text style={styles.description}>
        This frequency is designed to induce {info.name.toLowerCase()} states through 
        carefully calibrated binaural beats. Use headphones for the best experience.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    margin: 10,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  frequency: {
    fontSize: 14,
    color: '#ccc',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 20,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
  },
  stopButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: 20,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#ccc',
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  volumeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  volumeLabel: {
    fontSize: 16,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  volumeText: {
    fontSize: 12,
    color: '#ccc',
    minWidth: 35,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
