/**
 * Background Processor
 * 
 * Based on Grok Response 1: Service Worker integration for uninterrupted sessions
 */

export class BackgroundProcessor {
  private isEnabled = false;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.checkServiceWorkerSupport();
  }

  /**
   * Initialize background processing
   */
  async initialize(): Promise<void> {
    if (!this.isServiceWorkerSupported()) {
      console.warn('Service Worker not supported - background processing disabled');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/audio-worker.js');
      this.isEnabled = true;
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleWorkerMessage);
      
    } catch (error) {
      console.error('Failed to register service worker:', error);
    }
  }

  /**
   * Request background audio session
   */
  requestBackgroundSession(sessionConfig: unknown): void {
    if (!this.isEnabled || !this.registration) {
      console.warn('Background processing not available');
      return;
    }

    // Send session config to service worker
    this.postMessage({
      type: 'START_BACKGROUND_SESSION',
      config: sessionConfig,
    });
  }

  /**
   * Stop background session
   */
  stopBackgroundSession(): void {
    if (!this.isEnabled) return;

    this.postMessage({
      type: 'STOP_BACKGROUND_SESSION',
    });
  }

  /**
   * Check if background processing is available
   */
  isAvailable(): boolean {
    return this.isEnabled;
  }

  private isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  private checkServiceWorkerSupport(): void {
    if (!this.isServiceWorkerSupported()) {
      console.warn('Service Workers not supported in this browser');
    }
  }

  private postMessage(message: unknown): void {
    if (!this.registration?.active) return;

    this.registration.active.postMessage(message);
  }

  private handleWorkerMessage = (event: MessageEvent): void => {
    const { type, data } = event.data as { type: string; data: unknown };

    switch (type) {
      case 'BACKGROUND_SESSION_STARTED':
        console.log('Background session started:', data);
        break;
      
      case 'BACKGROUND_SESSION_STOPPED':
        console.log('Background session stopped:', data);
        break;
      
      case 'BACKGROUND_ERROR':
        console.error('Background processing error:', data);
        break;
      
      default:
        console.log('Unknown worker message:', type, data);
    }
  }

  /**
   * Cleanup background processor
   */
  dispose(): void {
    if (this.registration) {
      navigator.serviceWorker.removeEventListener('message', this.handleWorkerMessage);
    }
    this.isEnabled = false;
  }
}
