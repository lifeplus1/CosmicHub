import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BiometricAuthOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  hasHardware: boolean;
  securityLevel: LocalAuthentication.SecurityLevel | null;
}

export interface BiometricPreferences {
  enabled: boolean;
  autoLockTimeout: number; // minutes
  requireForAppLaunch: boolean;
  requireForSensitiveData: boolean;
  requireForPayments: boolean;
  allowFallbackToPasscode: boolean;
}

class BiometricAuthService {
  private preferences: BiometricPreferences = {
    enabled: true,
    autoLockTimeout: 5,
    requireForAppLaunch: false,
    requireForSensitiveData: true,
    requireForPayments: true,
    allowFallbackToPasscode: true,
  };

  private isAuthenticated = false;
  private lastAuthTime: number | null = null;
  private lockTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Initialize biometric authentication service
   */
  async initialize(): Promise<boolean> {
    try {
      // Load saved preferences
      await this.loadPreferences();

      // Check if biometric authentication is available
      const capabilities = await this.getCapabilities();

      if (!capabilities.isAvailable) {
        console.log('Biometric authentication not available on this device');
        this.preferences.enabled = false;
        return false;
      }

      console.log('Biometric authentication service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize biometric authentication:', error);
      return false;
    }
  }

  /**
   * Get biometric authentication capabilities
   */
  async getCapabilities(): Promise<BiometricCapabilities> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

      return {
        isAvailable: hasHardware && isEnrolled,
        isEnrolled,
        supportedTypes,
        hasHardware,
        securityLevel,
      };
    } catch (error) {
      console.error('Error getting biometric capabilities:', error);
      return {
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
        hasHardware: false,
        securityLevel: null,
      };
    }
  }

  /**
   * Authenticate user using biometrics
   */
  async authenticate(
    options: BiometricAuthOptions = {}
  ): Promise<BiometricAuthResult> {
    try {
      if (!this.preferences.enabled) {
        return {
          success: false,
          error: 'Biometric authentication is disabled',
        };
      }

      const capabilities = await this.getCapabilities();
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      const authOptions: LocalAuthentication.LocalAuthenticationOptions = {
        promptMessage:
          options.promptMessage ?? 'Authenticate to access CosmicHub',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        fallbackLabel:
          options.fallbackLabel ??
          (this.preferences.allowFallbackToPasscode ? 'Use Passcode' : ''),
        disableDeviceFallback:
          options.disableDeviceFallback ??
          !this.preferences.allowFallbackToPasscode,
      };

      const result = await LocalAuthentication.authenticateAsync(authOptions);

      if (result.success) {
        this.isAuthenticated = true;
        this.lastAuthTime = Date.now();
        this.startAutoLockTimer();

        return { success: true };
      } else {
        const error = 'Biometric authentication failed';
        const warning = 'Please try again or use alternative authentication';

        return { success: false, error, warning };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown authentication error',
      };
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isCurrentlyAuthenticated(): boolean {
    if (!this.isAuthenticated || !this.lastAuthTime) {
      return false;
    }

    // Check if authentication has expired
    const timeoutMs = this.preferences.autoLockTimeout * 60 * 1000;
    const hasExpired = Date.now() - this.lastAuthTime > timeoutMs;

    if (hasExpired) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Authenticate for app launch
   */
  async authenticateForAppLaunch(): Promise<BiometricAuthResult> {
    if (
      !this.preferences.requireForAppLaunch ||
      this.isCurrentlyAuthenticated()
    ) {
      return { success: true };
    }

    return this.authenticate({
      promptMessage:
        'Welcome back! Authenticate to access your cosmic insights',
      cancelLabel: 'Exit App',
    });
  }

  /**
   * Authenticate for sensitive data access
   */
  async authenticateForSensitiveData(
    context: string
  ): Promise<BiometricAuthResult> {
    if (
      !this.preferences.requireForSensitiveData ||
      this.isCurrentlyAuthenticated()
    ) {
      return { success: true };
    }

    return this.authenticate({
      promptMessage: `Authenticate to ${context}`,
    });
  }

  /**
   * Authenticate for payment operations
   */
  async authenticateForPayment(amount?: string): Promise<BiometricAuthResult> {
    if (!this.preferences.requireForPayments) {
      return { success: true };
    }

    const promptMessage = amount
      ? `Authenticate to complete payment of ${amount}`
      : 'Authenticate to complete payment';

    return this.authenticate({
      promptMessage,
      disableDeviceFallback: true, // Always require biometrics for payments
    });
  }

  /**
   * Refresh authentication timer
   */
  refreshAuthentication(): void {
    if (this.isAuthenticated) {
      this.lastAuthTime = Date.now();
      this.startAutoLockTimer();
    }
  }

  /**
   * Logout and clear authentication state
   */
  logout(): void {
    this.isAuthenticated = false;
    this.lastAuthTime = null;
    this.clearAutoLockTimer();
  }

  /**
   * Start auto-lock timer
   */
  private startAutoLockTimer(): void {
    this.clearAutoLockTimer();

    const timeoutMs = this.preferences.autoLockTimeout * 60 * 1000;
    this.lockTimeout = setTimeout(() => {
      this.logout();
    }, timeoutMs);
  }

  /**
   * Clear auto-lock timer
   */
  private clearAutoLockTimer(): void {
    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout);
      this.lockTimeout = null;
    }
  }

  /**
   * Update biometric preferences
   */
  async updatePreferences(
    newPreferences: Partial<BiometricPreferences>
  ): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };

    // Apply changes
    if (!newPreferences.enabled) {
      this.logout();
    }

    // Save preferences
    await this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): BiometricPreferences {
    return { ...this.preferences };
  }

  /**
   * Check if biometric type is supported
   */
  async isBiometricTypeSupported(
    type: LocalAuthentication.AuthenticationType
  ): Promise<boolean> {
    const capabilities = await this.getCapabilities();
    return capabilities.supportedTypes.includes(type);
  }

  /**
   * Get user-friendly biometric type name
   */
  getBiometricTypeName(type: LocalAuthentication.AuthenticationType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris Recognition';
      default:
        return 'Biometric Authentication';
    }
  }

  /**
   * Get primary biometric type available on device
   */
  async getPrimaryBiometricType(): Promise<{
    type: LocalAuthentication.AuthenticationType | null;
    name: string;
  }> {
    const capabilities = await this.getCapabilities();

    if (capabilities.supportedTypes.length === 0) {
      return { type: null, name: 'None Available' };
    }

    // Prefer Face ID/Face Recognition, then Touch ID/Fingerprint, then others
    const preferredOrder = [
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      LocalAuthentication.AuthenticationType.FINGERPRINT,
      LocalAuthentication.AuthenticationType.IRIS,
    ];

    for (const type of preferredOrder) {
      if (capabilities.supportedTypes.includes(type)) {
        return {
          type,
          name: this.getBiometricTypeName(type),
        };
      }
    }

    // Fallback to first available type
    const firstType = capabilities.supportedTypes[0];
    return {
      type: firstType,
      name: this.getBiometricTypeName(firstType),
    };
  }

  /**
   * Show biometric setup prompt
   */
  async promptForBiometricSetup(): Promise<void> {
    const capabilities = await this.getCapabilities();

    if (!capabilities.hasHardware) {
      // Device doesn't support biometrics
      return;
    }

    if (!capabilities.isEnrolled) {
      // Show message to set up biometrics in Settings
      console.log('Please set up biometric authentication in device settings');
    }
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('biometric_preferences');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<BiometricPreferences>;
        this.preferences = { ...this.preferences, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load biometric preferences:', error);
    }
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'biometric_preferences',
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Failed to save biometric preferences:', error);
    }
  }
}

export const biometricAuthService = new BiometricAuthService();
