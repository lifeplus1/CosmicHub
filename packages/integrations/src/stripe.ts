/**
 * Stripe Integration Service for CosmicHub
 * Handles Stripe Checkout sessions, subscription management, and Firebase integration
 */

import { loadStripe, type Stripe, type StripeError } from '@stripe/stripe-js';

// Firebase will be injected by the consuming app to avoid dependency issues
// Minimal surface types for injected Firebase services to avoid `any`
interface FirestoreDocSnapshot<T = unknown> {
  exists(): boolean;
  data(): T & Record<string, unknown>;
}

interface FirestoreDocRef {
  id?: string;
  // opaque
  _type?: 'docRef';
}

interface FirebaseAuthUser {
  uid: string;
  getIdToken(): Promise<string>;
}

interface FirebaseAuth { currentUser: FirebaseAuthUser | null; }

interface FirebaseServices {
  getFirestore: () => unknown;
  doc: (db: unknown, collection: string, id: string) => FirestoreDocRef;
  setDoc: (ref: FirestoreDocRef, data: unknown, options?: { merge?: boolean }) => Promise<void>;
  getDoc: (ref: FirestoreDocRef) => Promise<FirestoreDocSnapshot<{ subscription?: SubscriptionData }>>;
  getAuth: () => FirebaseAuth;
}

let firebaseServices: FirebaseServices | null = null;

export const initializeFirebaseServices = (services: FirebaseServices): void => {
  firebaseServices = services;
};

// Type-safe environment access
const getEnvVar = (key: string, fallback = ''): string => {
  // Attempt to read from process-like env (SSR/build). Avoid direct `process` reference to satisfy no-undef.
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process;
  const valFromProcess = proc?.env?.[key];
  if (typeof valFromProcess === 'string' && valFromProcess.length > 0) {
    return valFromProcess;
  }

  // Vite style import.meta.env
  const meta = (import.meta as unknown as { env?: Record<string, string | undefined> });
  const valFromMeta = meta.env?.[key];
  if (typeof valFromMeta === 'string' && valFromMeta.length > 0) {
    return valFromMeta;
  }
  return fallback;
};

export interface StripeSession {
  id: string;
  url: string;
}

export interface StripeCheckoutParams {
  tier: 'premium' | 'elite';
  userId: string;
  isAnnual: boolean;
  successUrl: string;
  cancelUrl: string;
  feature?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionData {
  tier: 'free' | 'premium' | 'elite';
  isAnnual: boolean;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  updatedAt: Date;
}

export interface StripeConfig {
  publicKey: string;
  checkoutEndpoint: string;
  portalEndpoint: string;
}

/**
 * Stripe Service - Singleton pattern for efficient initialization
 */
export class StripeService {
  private static instance: StripeService | null = null;
  private stripe: Stripe | null = null;
  private initializationPromise: Promise<void> | null = null;
  private isInitializing = false;

  private constructor(private config: StripeConfig) {}

  public static getInstance(config?: StripeConfig): StripeService {
    if (StripeService.instance === null) {
      if (!config) {
        throw new Error('StripeService config required for first initialization');
      }
      StripeService.instance = new StripeService(config);
    }
    return StripeService.instance;
  }

  /**
   * Initialize Stripe with lazy loading and error handling
   */
  private async initializeStripe(): Promise<void> {
    // If already initialized OR currently initializing, return existing promise (or resolved void)
    if (this.stripe !== null || this.isInitializing) {
      return this.initializationPromise ?? Promise.resolve();
    }

    this.isInitializing = true;
    this.initializationPromise = this.performInitialization();

    try {
      await this.initializationPromise;
    } finally {
      this.isInitializing = false;
    }
  }

  private async performInitialization(): Promise<void> {
  if (this.config.publicKey === undefined || this.config.publicKey === null || this.config.publicKey === '') {
      throw new Error('Stripe public key not configured');
    }

    try {
      this.stripe = await loadStripe(this.config.publicKey);
      if (!this.stripe) {
        throw new Error('Failed to initialize Stripe');
      }
    } catch (error) {
      console.error('Stripe initialization failed:', error);
      throw new Error('Stripe SDK failed to load');
    }
  }

  /**
   * Create Stripe Checkout session for subscription upgrade
   */
  public async createCheckoutSession({
    tier,
    userId,
    isAnnual,
    successUrl,
    cancelUrl,
    feature,
    metadata = {}
  }: StripeCheckoutParams): Promise<StripeSession> {
    await this.initializeStripe();
    
  if (this.stripe === null) {
      throw new Error('Stripe not properly initialized');
    }

    // Validate user authentication
    const auth = firebaseServices?.getAuth();
        if (!auth?.currentUser || auth.currentUser.uid !== userId) {
      throw new Error('User authentication required for checkout');
    }

    try {
      const checkoutData = {
        tier,
        userId,
        isAnnual,
        successUrl,
        cancelUrl,
        feature,
        metadata: {
          ...metadata,
          feature: feature ?? '',
          billingCycle: isAnnual ? 'annual' : 'monthly',
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(this.config.checkoutEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
            const errorData = (await response
              .json()
              .catch(() => ({ error: 'Unknown error' }))) as { error?: string };
            throw new Error(`Checkout session creation failed: ${errorData.error ?? response.statusText}`);
      }

          const checkoutJson = (await response.json()) as unknown;
          const { sessionId, url } = (typeof checkoutJson === 'object' && checkoutJson && 'sessionId' in checkoutJson)
            ? (checkoutJson as { sessionId?: string; url?: string })
            : { sessionId: undefined, url: undefined };
      
  if (typeof sessionId !== 'string' || sessionId.length === 0) {
        throw new Error('Invalid response: missing sessionId');
      }

      // If URL is provided, use it directly; otherwise redirect via Stripe
  if (typeof url === 'string' && url.length > 0) {
        // Direct redirect to Stripe Checkout
        window.location.href = url;
        return { id: sessionId, url };
      } else {
        // Use Stripe.js to redirect
        const { error } = await this.stripe.redirectToCheckout({ sessionId });
            if (error !== null && error !== undefined) {
          throw new Error(`Stripe redirect failed: ${error.message}`);
        }
        return { id: sessionId, url: '' };
      }
    } catch (error) {
          console.error('Stripe checkout error:', error);
      
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Checkout session creation failed. Please try again.');
      }
    }
  }

  /**
   * Update user subscription data in Firestore
   */
  public async updateUserSubscription(
    userId: string, 
    tier: 'premium' | 'elite', 
    isAnnual: boolean,
    additionalData: Partial<SubscriptionData> = {}
  ): Promise<void> {
  if (firebaseServices === null) {
      throw new Error('Firebase services not initialized');
    }

    try {
      const db = firebaseServices.getFirestore();
      const userRef = firebaseServices.doc(db, 'users', userId);
      
      const subscriptionData: Partial<SubscriptionData> = {
        tier,
        isAnnual,
        status: 'active',
        updatedAt: new Date(),
        ...additionalData
      };

      await firebaseServices.setDoc(userRef, { subscription: subscriptionData }, { merge: true });
      
          console.log(`Subscription updated for user ${userId}: ${tier} (${isAnnual ? 'annual' : 'monthly'})`);
    } catch (error) {
          console.error('Failed to update user subscription:', error);
      throw new Error('Subscription update failed');
    }
  }

  /**
   * Get user subscription data from Firestore
   */
  public async getUserSubscription(userId: string): Promise<SubscriptionData | null> {
    if (firebaseServices === null) {
      console.warn('Firebase services not initialized');
      return null;
    }

    try {
      const db = firebaseServices.getFirestore();
      const userRef = firebaseServices.doc(db, 'users', userId);
      const userDoc = await firebaseServices.getDoc(userRef);
      
  if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      const subscriptionCandidate = (userData as { subscription?: unknown }).subscription;
      if (
        subscriptionCandidate &&
        typeof subscriptionCandidate === 'object' &&
        'tier' in subscriptionCandidate &&
        (subscriptionCandidate as { tier?: unknown }).tier !== undefined
      ) {
        return subscriptionCandidate as SubscriptionData; // best-effort narrowing
      }
      return null;
    } catch (error) {
          console.error('Failed to get user subscription:', error);
      return null;
    }
  }

  /**
   * Create customer portal session for subscription management
   */
  public async createPortalSession(returnUrl: string): Promise<{ url: string }> {
    const auth = firebaseServices?.getAuth();
  if (!auth?.currentUser) {
      throw new Error('User authentication required for portal access');
    }

    try {
      const response = await fetch(this.config.portalEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ returnUrl }),
      });

      if (!response.ok) {
        const errorData = (await response
          .json()
          .catch(() => ({ error: 'Unknown error' }))) as { error?: string };
        throw new Error(`Portal session creation failed: ${errorData.error ?? response.statusText}`);
      }

      const portalJson: unknown = await response.json();
      if (
        typeof portalJson === 'object' &&
        portalJson !== null &&
        'url' in portalJson &&
        typeof (portalJson as { url?: unknown }).url === 'string'
      ) {
        return { url: (portalJson as { url: string }).url };
      }
      throw new Error('Invalid portal session response');
    } catch (error) {
      console.error('Portal session error:', error);
      throw new Error('Failed to access customer portal');
    }
  }

  /**
   * Validate Stripe configuration
   */
  public static validateConfig(config: Partial<StripeConfig>): StripeConfig {
  if (config.publicKey === undefined || config.publicKey === null || config.publicKey.trim() === '') {
      console.warn('Stripe public key not configured. Stripe functionality will be disabled.');
      throw new Error('Stripe public key is required');
    }

    // Check if it's a placeholder key
  if (config.publicKey.includes('1234567890') || config.publicKey === 'your_stripe_publishable_key_here') {
      console.warn('Using placeholder Stripe key. Please configure real Stripe keys for production.');
    }

    const defaultCheckoutEndpoint = `${getEnvVar('VITE_API_URL', 'http://localhost:8000')}/api/stripe/create-checkout-session`;
    const defaultPortalEndpoint = `${getEnvVar('VITE_API_URL', 'http://localhost:8000')}/api/stripe/create-portal-session`;

    return {
      publicKey: config.publicKey,
  checkoutEndpoint: config.checkoutEndpoint ?? defaultCheckoutEndpoint,
  portalEndpoint: config.portalEndpoint ?? defaultPortalEndpoint
    };
  }

  /**
   * Handle post-checkout success
   */
  public async handleCheckoutSuccess(sessionId: string): Promise<boolean> {
    try {
      const auth = firebaseServices?.getAuth();
  if (!auth?.currentUser) {
        console.error('No authenticated user found');
        return false;
      }

      // Verify the session and update subscription status
      const response = await fetch(`${getEnvVar('VITE_API_URL', 'http://localhost:8000')}/api/stripe/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({ sessionId }),
      });

          if (!response.ok) {
            console.error('Session verification failed');
            return false;
          }

          const verificationJson: unknown = await response.json();
          const subscription = (typeof verificationJson === 'object' && verificationJson !== null && 'subscription' in verificationJson)
            ? (verificationJson as { subscription?: unknown }).subscription
            : undefined;
      
          if (
            subscription &&
            typeof subscription === 'object' &&
            'tier' in subscription &&
            ((subscription as { tier?: unknown }).tier === 'premium' || (subscription as { tier?: unknown }).tier === 'elite')
          ) {
            const tierVal = (subscription as { tier: 'premium' | 'elite' }).tier;
            const isAnnual = (subscription as { isAnnual?: unknown }).isAnnual === true;
            await this.updateUserSubscription(
              auth.currentUser.uid,
              tierVal,
              isAnnual,
              subscription as Partial<SubscriptionData>
            );
            return true;
          }

      return false;
    } catch (error) {
      console.error('Checkout success handling failed:', error);
      return false;
    }
  }

  /**
   * Get current Stripe instance (for advanced usage)
   */
  public async getStripeInstance(): Promise<Stripe | null> {
    await this.initializeStripe();
    return this.stripe;
  }
}

/**
 * Create and configure the default Stripe service instance
 */
let defaultStripeService: StripeService | null = null;

export const createStripeService = (config?: Partial<StripeConfig>): StripeService => {
  try {
    const stripeConfig = StripeService.validateConfig({
      publicKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', ''),
      ...config
    });

    return StripeService.getInstance(stripeConfig);
  } catch (error) {
    console.error('Failed to create Stripe service:', error);
    throw error;
  }
};

/**
 * Get the default configured Stripe service (safe initialization)
 */
export const getStripeService = (): StripeService | null => {
  if (!defaultStripeService) {
    try {
      defaultStripeService = createStripeService();
    } catch (error) {
      console.warn('Stripe service not available:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
  return defaultStripeService;
};

/**
 * Convenient alias for the default service (null-safe)
 */
export const stripeService = getStripeService();

/**
 * Utility functions
 */
export const formatPrice = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const calculateAnnualDiscount = (monthlyPrice: number, discountPercent = 20): number => {
  const annualPrice = monthlyPrice * 12;
  const discountAmount = annualPrice * (discountPercent / 100);
  return annualPrice - discountAmount;
};

// Export types for convenience
export type { StripeError };
