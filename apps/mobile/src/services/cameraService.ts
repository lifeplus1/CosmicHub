import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CameraCapabilities {
  hasCamera: boolean;
  hasFrontCamera: boolean;
  hasBackCamera: boolean;
}

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  exif?: Record<string, unknown>;
}

export interface CameraPreferences {
  preferredQuality: 'low' | 'medium' | 'high';
  includeBase64: boolean;
  includeExif: boolean;
  autoSaveToGallery: boolean;
  watermarkEnabled: boolean;
}

export interface CameraRef {
  takePictureAsync: (options: {
    quality: number;
    base64: boolean;
    exif: boolean;
  }) => Promise<{
    uri: string;
    width: number;
    height: number;
    base64?: string;
    exif?: Record<string, unknown>;
  }>;
}

export class CameraService {
  private preferences: CameraPreferences = {
    preferredQuality: 'high',
    includeBase64: false,
    includeExif: false,
    autoSaveToGallery: true,
    watermarkEnabled: true,
  };

  constructor() {
    void this.loadPreferences();
  }

  /**
   * Initialize camera permissions (simplified)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Camera permissions would typically be handled by the Camera component
      // For now, we assume permissions are handled at the component level
      console.log('Camera permissions should be handled by Camera component');

      // Request media library permissions for saving photos
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();

      if (mediaLibraryStatus.status !== MediaLibrary.PermissionStatus.GRANTED) {
        console.warn('Media library permission not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to request camera permissions:', error);
      return false;
    }
  }

  /**
   * Get camera capabilities
   */
  getCameraCapabilities(): CameraCapabilities {
    // Simplified capability detection for mobile devices
    // In a real implementation, this would check actual device capabilities
    return {
      hasCamera: true, // Assume modern devices have cameras
      hasFrontCamera: true,
      hasBackCamera: true,
    };
  }

  /**
   * Simplified photo taking - would be called from a Camera component
   */
  async takePhoto(cameraRef: CameraRef): Promise<PhotoResult | null> {
    if (!cameraRef) {
      console.error('Camera reference not available');
      return null;
    }

    try {
      const options = {
        quality:
          this.preferences.preferredQuality === 'high'
            ? 1
            : this.preferences.preferredQuality === 'medium'
              ? 0.7
              : 0.3,
        base64: this.preferences.includeBase64,
        exif: this.preferences.includeExif,
      };

      // This would be called from the actual Camera component
      const photo = await cameraRef.takePictureAsync(options);

      return {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        base64: photo.base64,
        exif: photo.exif,
      };
    } catch (error) {
      console.error('Failed to take photo:', error);
      return null;
    }
  }

  /**
   * Save photo to device gallery
   */
  async saveToGallery(
    photoUri: string,
    albumName: string = 'CosmicHub'
  ): Promise<boolean> {
    try {
      // Create asset from photo
      const asset = await MediaLibrary.createAssetAsync(photoUri);

      // Try to find or create album
      let album = await MediaLibrary.getAlbumAsync(albumName);
      if (!album) {
        album = await MediaLibrary.createAlbumAsync(
          albumName,
          undefined,
          false
        );
      }

      // Add asset to album
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      console.log('Photo saved to gallery');
      return true;
    } catch (error) {
      console.error('Failed to save photo to gallery:', error);
      return false;
    }
  }

  /**
   * Share photo using native sharing
   */
  async sharePhoto(photoUri: string, message?: string): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Sharing is not available on this device');
        return false;
      }

      await Sharing.shareAsync(photoUri, {
        mimeType: 'image/jpeg',
        dialogTitle: message ?? 'Share your astrological chart',
      });

      return true;
    } catch (error) {
      console.error('Failed to share photo:', error);
      return false;
    }
  }

  /**
   * Add watermark to photo (simplified)
   */
  addWatermark(
    photoUri: string,
    watermarkText: string
  ): Promise<string | null> {
    try {
      // In a real implementation, this would use a library like react-native-image-editor
      // For now, just return the original URI
      console.log(`Adding watermark "${watermarkText}" to photo`);
      return Promise.resolve(photoUri);
    } catch (error) {
      console.error('Failed to add watermark:', error);
      return Promise.resolve(null);
    }
  }

  /**
   * Get camera permission status (simplified)
   */
  getCameraPermissionStatus(): Promise<string> {
    try {
      // Camera permissions would be checked by the Camera component
      // Return a placeholder status
      return Promise.resolve('granted');
    } catch (error) {
      console.error('Failed to get camera permission status:', error);
      return Promise.resolve('denied');
    }
  }

  /**
   * Update camera preferences
   */
  async updatePreferences(
    newPreferences: Partial<CameraPreferences>
  ): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    await this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): CameraPreferences {
    return { ...this.preferences };
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('camera_preferences');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<CameraPreferences>;
        this.preferences = { ...this.preferences, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load camera preferences:', error);
    }
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'camera_preferences',
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Failed to save camera preferences:', error);
    }
  }
}

// Export singleton instance
export const cameraService = new CameraService();
