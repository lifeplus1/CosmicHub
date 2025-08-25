/**
import { devConsole } from '../config/devConsole';
 * Advanced PWA Performance Enhancements for HealWave
 * Builds on existing CosmicHub performance optimizations
 */

// Simple logger for PWA performance monitoring using shared devConsole pattern
// Local lightweight proxy (avoids cross-app import during early init)
 
 

class PWALogger {
  static log(message: string, ...args: unknown[]): void {
    devConsole.log?.(message, ...args);
  }
  static warn(message: string, ...args: unknown[]): void {
    devConsole.warn?.(message, ...args);
  }
  static error(message: string, ...args: unknown[]): void {
    devConsole.error(message, ...args);
  }
}

// Core PWA Performance Classes for HealWave
export class CriticalResourceManager {
  private static readonly CRITICAL_RESOURCES: string[] = [
    '/src/main.tsx',
    '/src/index.css',
    '/src/styles/index.css',
  ];

  private static readonly FONT_RESOURCES: string[] = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  ];

  static async preloadCriticalResources(): Promise<void> {
    PWALogger.log('⚡ Preloading critical resources for HealWave...');

    const preloadPromises = this.CRITICAL_RESOURCES.map(resource => {
      return new Promise<void>(resolve => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        if (resource.endsWith('.tsx') || resource.endsWith('.js')) {
          link.crossOrigin = 'anonymous';
        }

        link.onload = () => {
          PWALogger.log(`✅ Preloaded: ${resource}`);
          resolve();
        };
        link.onerror = () => {
          PWALogger.warn(`⚠️ Failed to preload: ${resource}`);
          resolve(); // Don't block on failed preloads
        };

        document.head.appendChild(link);
      });
    });

    await Promise.allSettled(preloadPromises);
    PWALogger.log('🎯 Critical resource preloading complete');
  }
}

interface NetworkInformationLike {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
}
export class ConnectionAwareLoader {
  private static readonly connection: NetworkInformationLike | undefined =
    (navigator as unknown as { connection?: NetworkInformationLike })
      .connection ??
    (navigator as unknown as { mozConnection?: NetworkInformationLike })
      .mozConnection ??
    (navigator as unknown as { webkitConnection?: NetworkInformationLike })
      .webkitConnection;

  static getConnectionInfo(): {
    effectiveType: string;
    downlink: number;
    saveData: boolean;
  } {
    if (!this.connection) {
      return {
        effectiveType: '4g',
        downlink: 10,
        saveData: false,
      };
    }

    return {
      effectiveType: this.connection.effectiveType ?? '4g',
      downlink: this.connection.downlink ?? 10,
      saveData: this.connection.saveData ?? false,
    };
  }

  static shouldOptimizeForSlowConnection(): boolean {
    const info = this.getConnectionInfo();
    return (
      info.effectiveType === 'slow-2g' ||
      info.effectiveType === '2g' ||
      info.downlink < 1.5 ||
      info.saveData
    );
  }
}

export class PWAPerformanceMonitor {
  private static metrics: Map<string, number> = new Map();

  static startTiming(label: string): void {
    this.metrics.set(`${label}_start`, performance.now());
  }

  static endTiming(label: string): number {
    const startTime = this.metrics.get(`${label}_start`);
    if (startTime === undefined) {
      PWALogger.warn(`No start time found for ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.set(label, duration);
    PWALogger.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// HealWave-specific performance optimizations
export class AudioPerformanceOptimizer {
  private static audioContext: AudioContext | null = null;

  static initializeAudioContext(): void {
    if (this.audioContext !== null) return;
    try {
      const ctor =
        (
          window as unknown as {
            AudioContext?: typeof AudioContext;
            webkitAudioContext?: typeof AudioContext;
          }
        ).AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (ctor) {
        this.audioContext = new ctor();
        PWALogger.log('🎵 Audio context initialized for HealWave');
      } else {
        PWALogger.warn('⚠️ AudioContext API not available');
      }
    } catch (error) {
      PWALogger.warn('⚠️ Audio context initialization failed:', error);
    }
  }

  static optimizeForAudioPlayback(): void {
    // Reduce background processing during audio playback
    document.addEventListener(
      'play',
      () => {
        PWALogger.log('🎧 Audio playback started - optimizing performance');
        // Reduce non-critical processing
        document.documentElement.style.setProperty('--reduce-animations', '1');
      },
      true
    );

    document.addEventListener(
      'pause',
      () => {
        PWALogger.log(
          '⏸️ Audio playback paused - restoring normal performance'
        );
        document.documentElement.style.setProperty('--reduce-animations', '0');
      },
      true
    );
  }

  static preloadAudioAssets(): void {
    // Preload critical audio files if needed
    const criticalAudioFiles: string[] = [
      // Add your critical audio file paths here
      // '/audio/critical-frequency.mp3'
    ];

    criticalAudioFiles.forEach(audioFile => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = audioFile;
      link.as = 'audio';
      document.head.appendChild(link);
    });
  }
}

// Initialize HealWave-specific performance enhancements
export function initializeHealWavePerformance(): void {
  PWALogger.log('🎧 Initializing HealWave PWA performance enhancements...');

  try {
    // Initialize audio optimizations
    AudioPerformanceOptimizer.initializeAudioContext();
    AudioPerformanceOptimizer.optimizeForAudioPlayback();
    AudioPerformanceOptimizer.preloadAudioAssets();

    PWALogger.log('✅ HealWave PWA performance enhancements initialized');
  } catch (error) {
    PWALogger.error(
      '❌ Failed to initialize HealWave performance enhancements:',
      error
    );
  }
}

// Auto-initialize when imported
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeHealWavePerformance();
  });
} else {
  initializeHealWavePerformance();
}
