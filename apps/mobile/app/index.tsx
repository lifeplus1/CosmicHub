import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to CosmicHub</Text>
        <Text style={styles.subtitle}>
          Your comprehensive astrology and spiritual guidance platform
        </Text>

        <View style={styles.appGrid}>
          <Link href='/astrology' asChild>
            <TouchableOpacity style={[styles.appCard, styles.astrologyCard]}>
              <Text style={styles.appCardTitle}>🌟 Astrology</Text>
              <Text style={styles.appCardDescription}>
                Generate detailed birth charts, synastry analysis, and cosmic
                insights
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href='/healwave' asChild>
            <TouchableOpacity style={[styles.appCard, styles.healwaveCard]}>
              <Text style={styles.appCardTitle}>🎵 HealWave</Text>
              <Text style={styles.appCardDescription}>
                Binaural beats and healing frequencies for meditation and
                wellness
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>
              • Multi-system chart calculations
            </Text>
            <Text style={styles.featureItem}>• AI-powered interpretations</Text>
            <Text style={styles.featureItem}>
              • Synastry compatibility analysis
            </Text>
            <Text style={styles.featureItem}>• Healing frequency library</Text>
            <Text style={styles.featureItem}>• Cloud synchronization</Text>
          </View>
        </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  appGrid: {
    width: '100%',
    gap: 20,
    marginBottom: 40,
  },
  appCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  astrologyCard: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#4a4a6a',
  },
  healwaveCard: {
    backgroundColor: '#0f3460',
    borderWidth: 1,
    borderColor: '#16537e',
  },
  appCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  appCardDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  features: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4a4a6a',
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
});
