import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function AstrologyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Astrology Charts</Text>
        <Text style={styles.subtitle}>
          Generate and explore detailed astrological insights
        </Text>

        <View style={styles.chartTypes}>
          <TouchableOpacity style={styles.chartCard}>
            <Text style={styles.chartTitle}>🌙 Birth Chart</Text>
            <Text style={styles.chartDescription}>
              Generate your complete natal chart with planetary positions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chartCard}>
            <Text style={styles.chartTitle}>💕 Synastry Analysis</Text>
            <Text style={styles.chartDescription}>
              Explore compatibility between two birth charts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chartCard}>
            <Text style={styles.chartTitle}>🔮 Transit Forecast</Text>
            <Text style={styles.chartDescription}>
              See current planetary transits and their effects
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chartCard}>
            <Text style={styles.chartTitle}>📊 Chart Library</Text>
            <Text style={styles.chartDescription}>
              Access your saved charts and interpretations
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Chart Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Western & Vedic systems</Text>
            <Text style={styles.featureItem}>• Multiple house systems</Text>
            <Text style={styles.featureItem}>• Aspect calculations</Text>
            <Text style={styles.featureItem}>• AI interpretations</Text>
            <Text style={styles.featureItem}>• High-resolution charts</Text>
          </View>
        </View>

        <Link href="/" asChild>
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
  chartTypes: {
    gap: 16,
    marginBottom: 30,
  },
  chartCard: {
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4a4a6a',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  chartDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  features: {
    backgroundColor: '#0f3460',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#16537e',
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
