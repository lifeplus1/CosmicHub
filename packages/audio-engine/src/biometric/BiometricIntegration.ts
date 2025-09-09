/**
 * Biometric Integration
 * 
 * Based on Grok Response 1: Heart rate variability responsive frequency adjustments
 */

import { BiometricData } from '../types';
import { AUDIO_CONSTANTS } from '../constants';

export class BiometricIntegration extends EventTarget {
  private isConnected = false;
  private currentData: BiometricData | null = null;
  private updateInterval: number | null = null;

  constructor() {
    super();
  }

  /**
   * Connect to biometric devices (stub implementation)
   */
  connect(): void {
    // In a real implementation, this would connect to:
    // - Web Bluetooth for fitness trackers
    // - WebRTC for camera-based heart rate detection
    // - Native app bridges for iOS HealthKit/Android Health
    
    this.isConnected = true;
    this.startMonitoring();
    
    this.emit('connected', { timestamp: Date.now() });
  }

  /**
   * Disconnect from biometric devices
   */
  disconnect(): void {
    this.stopMonitoring();
    this.isConnected = false;
    this.currentData = null;
    
    this.emit('disconnected', { timestamp: Date.now() });
  }

  /**
   * Get current biometric data
   */
  getCurrentData(): BiometricData | null {
    return this.currentData;
  }

  /**
   * Manually update biometric data (for testing or manual input)
   */
  updateData(data: Partial<BiometricData>): void {
    this.currentData = {
      ...this.currentData,
      ...data,
      timestamp: Date.now(),
    } as BiometricData;

    this.emit('dataUpdate', this.currentData);
  }

  /**
   * Get recommended frequency adjustment based on biometric data
   */
  getFrequencyRecommendation(baseFrequency: number): number {
    if (!this.currentData) return baseFrequency;

    let adjustment = 1;

    // Heart rate based adjustment
    if (this.currentData.heartRate) {
      if (this.currentData.heartRate > 90) {
        // High heart rate - recommend calming frequencies
        adjustment *= 0.95; // Slightly lower frequency
      } else if (this.currentData.heartRate < 60) {
        // Low heart rate - recommend energizing frequencies
        adjustment *= 1.05; // Slightly higher frequency
      }
    }

    // Stress level based adjustment
    if (this.currentData.stressLevel) {
      if (this.currentData.stressLevel > 70) {
        // High stress - recommend very calming frequencies
        adjustment *= 0.9;
      } else if (this.currentData.stressLevel > 50) {
        // Moderate stress - slightly calming
        adjustment *= 0.95;
      }
    }

    // HRV based adjustment
    if (this.currentData.hrv) {
      if (this.currentData.hrv < 20) {
        // Low HRV indicates stress - recommend calming
        adjustment *= 0.95;
      } else if (this.currentData.hrv > 50) {
        // High HRV indicates good recovery - can handle more stimulating frequencies
        adjustment *= 1.02;
      }
    }

    const adjustedFrequency = baseFrequency * adjustment;
    
    // Ensure frequency stays within valid range
    return Math.max(
      AUDIO_CONSTANTS.FREQUENCY.MIN,
      Math.min(AUDIO_CONSTANTS.FREQUENCY.MAX, adjustedFrequency)
    );
  }

  /**
   * Check if current biometric state suggests session should be modified
   */
  getSessionRecommendation(): {
    action: 'continue' | 'lower_intensity' | 'pause' | 'stop';
    reason: string;
  } {
    if (!this.currentData) {
      return { action: 'continue', reason: 'No biometric data available' };
    }

    // Check for high stress indicators
    if (this.currentData.stressLevel && this.currentData.stressLevel > 80) {
      return { 
        action: 'pause', 
        reason: 'High stress level detected, consider taking a break' 
      };
    }

    // Check for very high heart rate
    if (this.currentData.heartRate && this.currentData.heartRate > 120) {
      return { 
        action: 'lower_intensity', 
        reason: 'Elevated heart rate, reducing intensity recommended' 
      };
    }

    // Check for very low HRV (indicates fatigue/stress)
    if (this.currentData.hrv && this.currentData.hrv < 15) {
      return { 
        action: 'lower_intensity', 
        reason: 'Low heart rate variability, gentler session recommended' 
      };
    }

    return { action: 'continue', reason: 'Biometric indicators are within normal range' };
  }

  private startMonitoring(): void {
    if (this.updateInterval) return;

    this.updateInterval = window.setInterval(() => {
      // Simulate biometric data updates
      // In real implementation, this would read from connected devices
      this.simulateBiometricData();
    }, AUDIO_CONSTANTS.BIOMETRICS.UPDATE_INTERVAL);
  }

  private stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private simulateBiometricData(): void {
    // Simulate realistic biometric data for testing
    const simulatedData: BiometricData = {
      heartRate: 60 + Math.random() * 40, // 60-100 BPM
      hrv: 20 + Math.random() * 60, // 20-80 ms
      stressLevel: Math.random() * 100, // 0-100%
      breathingRate: 12 + Math.random() * 8, // 12-20 breaths/min
      timestamp: Date.now(),
    };

    this.updateData(simulatedData);
  }

  private emit(type: string, data: unknown): void {
    this.dispatchEvent(new CustomEvent(type, { detail: data }));
  }
}
