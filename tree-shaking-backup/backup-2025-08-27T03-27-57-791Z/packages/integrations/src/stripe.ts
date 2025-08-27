/**
 * Stripe Integration Service for CosmicHub
 * Handles Stripe Checkout sessions, subscription management, and Firebase integration
 */

import { loadStripe, type Stripe, type StripeError } from '@stripe/stripe-js';

// Simple logger for integrations package
const logger = {
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[StripeIntegration] ${message}`, data);
    }
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[StripeIntegration] ${message}`, data);
  },
  error: (message: string, data?: unknown) => {
    console.error(`[StripeIntegration] ${message}`, data);
  },
};

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

interface FirebaseAuth {
  currentUser: FirebaseAuthUser | null;
}

interface FirebaseServices {
  getFirestore: () => unknown;
  doc: (db: unknown, collection: string, id: string) => FirestoreDocRef;
  setDoc: (
    ref: FirestoreDocRef,
    data: unknown,
    options?: { merge?: boolean }
  ) => Promise<void>;
  getDoc: (
    ref: FirestoreDocRef
  ) => Promise<FirestoreDocSnapshot<{ subscription?: SubscriptionData }>>;
  getAuth: () => FirebaseAuth;
}

let firebaseServices: FirebaseServices | null = null;

};

// Type-safe environment access
const getEnvVar = (key: string, fallback = ''): string => {
  // Attempt to read from process-like env (SSR/build). Avoid direct `process` reference to satisfy no-undef.
  const proc = (
    globalThis as unknown as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process;
  const valFromProcess = proc?.env?.[key];
  if (typeof valFromProcess === 'string' && valFromProcess.length > 0) {
    return valFromProcess;
  }

  // Vite style import.meta.env
  const meta = import.meta as unknown as {
    env?: Record<string, string | undefined>;
  };
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

  userId: string;
  isAnnual: boolean;
  successUrl: string;
  cancelUrl: string;
  feature?: string;
  metadata?: Record<string, string>;
}

  isAnnual: boolean;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  updatedAt: Date;
}

  checkoutEndpoint: string;
  portalEndpoint: string;
}

/**
 * Stripe Service - Singleton pattern for efficient initialization
 */

/**
 * Create and configure the default Stripe service instance
 */
let defaultStripeService: StripeService | null = null;

    return StripeService.getInstance(stripeConfig);
  } catch (error) {
    logger.error('Failed to create Stripe service:', error);
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
      logger.warn(
        'Stripe service not available:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return null;
    }
  }
  return defaultStripeService;
};

/**
 * Convenient alias for the default service (null-safe)
 * Throws error if service is not initialized
 */
  if (!service) {
    throw new Error(
      'Stripe service not initialized. Please call createStripeService() first.'
    );
  }
  return service;
};

/**
 * Convenient alias for the default service (null-safe)
 * @deprecated Use getStripeServiceOrThrow() for better type safety
 */

/**
 * Utility functions
 */
};

  const discountAmount = annualPrice * (discountPercent / 100);
  return annualPrice - discountAmount;
};

// Export types for convenience
export type { StripeError };
