import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';

export default function HealWaveScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>HealWave Frequencies</Text>
        <Text style={styles.subtitle}>
          Binaural beats and healing frequencies for meditation and wellness
        </Text>

        <View style={styles.frequencyTypes}>
          <TouchableOpacity style={styles.frequencyCard}>
            <Text style={styles.frequencyTitle}>🧘 Meditation</Text>
            <Text style={styles.frequencyDescription}>
              Deep relaxation and mindfulness frequencies (4-8 Hz)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.frequencyCard}>
            <Text style={styles.frequencyTitle}>💤 Sleep</Text>
            <Text style={styles.frequencyDescription}>
              Delta waves for deep restorative sleep (0.5-4 Hz)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.frequencyCard}>
            <Text style={styles.frequencyTitle}>⚡ Focus</Text>
            <Text style={styles.frequencyDescription}>
              Beta waves for enhanced concentration (13-30 Hz)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.frequencyCard}>
            <Text style={styles.frequencyTitle}>🌟 Creativity</Text>
            <Text style={styles.frequencyDescription}>
              Alpha waves for creative flow states (8-13 Hz)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.frequencyCard}>
            <Text style={styles.frequencyTitle}>🎯 Lucid Dreams</Text>
            <Text style={styles.frequencyDescription}>
              Gamma waves for heightened awareness (30-100 Hz)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Audio Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>
              • High-quality binaural beats
            </Text>
            <Text style={styles.featureItem}>• Background soundscapes</Text>
            <Text style={styles.featureItem}>• Timer and session tracking</Text>
            <Text style={styles.featureItem}>• Custom frequency mixing</Text>
            <Text style={styles.featureItem}>• Offline playback support</Text>
          </View>
        </View>

        <Link href='/' asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000014',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 30,
    lineHeight: 24,
  },
  frequencyTypes: {
    gap: 16,
    marginBottom: 30,
  },
  frequencyCard: {
    padding: 20,
    backgroundColor: '#0f3460',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#16537e',
  },
  frequencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  frequencyDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  features: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4a4a6a',
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  backButton: {
    padding: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
