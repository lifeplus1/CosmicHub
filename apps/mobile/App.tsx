import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { mobileIntegrationService, MobileFeatureStatus } from './src/services/mobileIntegrationService';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [featureStatus, setFeatureStatus] = useState<MobileFeatureStatus>({
    notifications: false,
    location: false,
    biometrics: false,
    widgets: false,
    camera: false,
  });

  useEffect(() => {
    void initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize mobile services
      const status = await mobileIntegrationService.initialize();
      setFeatureStatus(status);

      // Handle app launch authentication if biometrics are available
      const authSuccess = await mobileIntegrationService.handleAppLaunch();
      
      if (!authSuccess) {
        Alert.alert(
          'Authentication Required',
          'Please authenticate to continue using CosmicHub',
          [{ text: 'OK', onPress: () => void initializeApp() }]
        );
        return;
      }

      // Check if user needs to complete mobile onboarding
      const hasCompletedOnboarding = await mobileIntegrationService.hasCompletedMobileOnboarding();
      if (!hasCompletedOnboarding) {
        // Show onboarding screens here
        console.log('User needs to complete mobile onboarding');
      }

      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert(
        'Initialization Error',
        'Failed to initialize CosmicHub mobile features. Some functionality may be limited.',
        [{ text: 'Continue', onPress: () => setIsReady(true) }]
      );
    }
  };

  const getStatusIcon = (enabled: boolean) => enabled ? '✅' : '❌';

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🌟 Initializing CosmicHub</Text>
        <Text style={styles.subtitle}>Setting up your cosmic mobile experience...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌟 CosmicHub Mobile</Text>
      <Text style={styles.subtitle}>MOB-002: Mobile-Specific Features</Text>
      
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>📱 Mobile Features Status</Text>
        
        <View style={styles.featureRow}>
          <Text style={styles.featureText}>
            {getStatusIcon(featureStatus.notifications)} Push Notifications
          </Text>
        </View>
        
        <View style={styles.featureRow}>
          <Text style={styles.featureText}>
            {getStatusIcon(featureStatus.location)} Location Services
          </Text>
        </View>
        
        <View style={styles.featureRow}>
          <Text style={styles.featureText}>
            {getStatusIcon(featureStatus.biometrics)} Biometric Authentication
          </Text>
        </View>
        
        <View style={styles.featureRow}>
          <Text style={styles.featureText}>
            {getStatusIcon(featureStatus.widgets)} Widgets
          </Text>
        </View>
        
        <View style={styles.featureRow}>
          <Text style={styles.featureText}>
            {getStatusIcon(featureStatus.camera)} Camera & Sharing
          </Text>
        </View>
      </View>

      <View style={styles.implementedContainer}>
        <Text style={styles.sectionTitle}>🚀 Implemented Features</Text>
        
        <Text style={styles.implementedText}>
          • 🔔 Push notifications for transits and daily insights
        </Text>
        <Text style={styles.implementedText}>
          • 📍 Location-based cosmic notifications
        </Text>
        <Text style={styles.implementedText}>
          • 🔒 Face ID / Touch ID authentication
        </Text>
        <Text style={styles.implementedText}>
          • 📱 Home screen widgets (daily horoscope, transits, moon)
        </Text>
        <Text style={styles.implementedText}>
          • 📷 Chart sharing with camera integration
        </Text>
        <Text style={styles.implementedText}>
          • 🔄 Background app refresh for live data
        </Text>
        <Text style={styles.implementedText}>
          • ⚙️ Comprehensive mobile preferences
        </Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000014',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4a90e2',
    marginBottom: 30,
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  featureRow: {
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'left',
  },
  implementedContainer: {
    backgroundColor: '#1a2e1a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  implementedText: {
    fontSize: 14,
    color: '#90ee90',
    marginBottom: 8,
    lineHeight: 20,
  },
});
