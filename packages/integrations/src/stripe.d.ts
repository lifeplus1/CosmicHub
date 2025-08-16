/**
 * Stripe Integration Service for CosmicHub
 * Handles Stripe Checkout sessions, subscription management, and Firebase integration
 */
import { Stripe, StripeError } from '@stripe/stripe-js';
interface FirebaseServices {
    getFirestore: () => any;
    doc: (db: any, collection: string, id: string) => any;
    setDoc: (ref: any, data: any, options?: any) => Promise<void>;
    getDoc: (ref: any) => Promise<any>;
    getAuth: () => any;
}
export declare const initializeFirebaseServices: (services: FirebaseServices) => void;
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
export declare class StripeService {
    private config;
    private static instance;
    private stripe;
    private initializationPromise;
    private isInitializing;
    private constructor();
    static getInstance(config?: StripeConfig): StripeService;
    /**
     * Initialize Stripe with lazy loading and error handling
     */
    private initializeStripe;
    private performInitialization;
    /**
     * Create Stripe Checkout session for subscription upgrade
     */
    createCheckoutSession({ tier, userId, isAnnual, successUrl, cancelUrl, feature, metadata }: StripeCheckoutParams): Promise<StripeSession>;
    /**
     * Update user subscription data in Firestore
     */
    updateUserSubscription(userId: string, tier: 'premium' | 'elite', isAnnual: boolean, additionalData?: Partial<SubscriptionData>): Promise<void>;
    /**
     * Get user subscription data from Firestore
     */
    getUserSubscription(userId: string): Promise<SubscriptionData | null>;
    /**
     * Create customer portal session for subscription management
     */
    createPortalSession(returnUrl: string): Promise<{
        url: string;
    }>;
    /**
     * Validate Stripe configuration
     */
    static validateConfig(config: Partial<StripeConfig>): StripeConfig;
    /**
     * Handle post-checkout success
     */
    handleCheckoutSuccess(sessionId: string): Promise<boolean>;
    /**
     * Get current Stripe instance (for advanced usage)
     */
    getStripeInstance(): Promise<Stripe | null>;
}
export declare const createStripeService: (config?: Partial<StripeConfig>) => StripeService;
/**
 * Get the default configured Stripe service (safe initialization)
 */
export declare const getStripeService: () => StripeService | null;
/**
 * Convenient alias for the default service (null-safe)
 */
export declare const stripeService: StripeService | null;
/**
 * Utility functions
 */
export declare const formatPrice: (amount: number, currency?: string) => string;
export declare const calculateAnnualDiscount: (monthlyPrice: number, discountPercent?: number) => number;
export type { StripeError };
//# sourceMappingURL=stripe.d.ts.map