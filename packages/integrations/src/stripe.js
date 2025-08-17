/**
 * Stripe Integration Service for CosmicHub
 * Handles Stripe Checkout sessions, subscription management, and Firebase integration
 */
import { loadStripe } from '@stripe/stripe-js';
let firebaseServices = null;
export const initializeFirebaseServices = (services) => {
    firebaseServices = services;
};
// Type-safe environment access
const getEnvVar = (key, fallback = '') => {
    if (typeof process !== 'undefined' && process.env?.[key]) {
        return process.env[key];
    }
    if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) {
        return import.meta.env[key];
    }
    return fallback;
};
/**
 * Stripe Service - Singleton pattern for efficient initialization
 */
export class StripeService {
    config;
    static instance;
    stripe = null;
    initializationPromise = null;
    isInitializing = false;
    constructor(config) {
        this.config = config;
    }
    static getInstance(config) {
        if (!StripeService.instance) {
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
    async initializeStripe() {
        if (this.stripe || this.isInitializing) {
            return this.initializationPromise || Promise.resolve();
        }
        this.isInitializing = true;
        this.initializationPromise = this.performInitialization();
        try {
            await this.initializationPromise;
        }
        finally {
            this.isInitializing = false;
        }
    }
    async performInitialization() {
        if (!this.config.publicKey) {
            throw new Error('Stripe public key not configured');
        }
        try {
            this.stripe = await loadStripe(this.config.publicKey);
            if (!this.stripe) {
                throw new Error('Failed to initialize Stripe');
            }
        }
        catch (error) {
            console.error('Stripe initialization failed:', error);
            throw new Error('Stripe SDK failed to load');
        }
    }
    /**
     * Create Stripe Checkout session for subscription upgrade
     */
    async createCheckoutSession({ tier, userId, isAnnual, successUrl, cancelUrl, feature, metadata = {} }) {
        await this.initializeStripe();
        if (!this.stripe) {
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
                    feature: feature || '',
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
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(`Checkout session creation failed: ${errorData.error || response.statusText}`);
            }
            const { sessionId, url } = await response.json();
            if (!sessionId) {
                throw new Error('Invalid response: missing sessionId');
            }
            // If URL is provided, use it directly; otherwise redirect via Stripe
            if (url) {
                // Direct redirect to Stripe Checkout
                window.location.href = url;
                return { id: sessionId, url };
            }
            else {
                // Use Stripe.js to redirect
                const { error } = await this.stripe.redirectToCheckout({ sessionId });
                if (error) {
                    throw new Error(`Stripe redirect failed: ${error.message}`);
                }
                return { id: sessionId, url: '' };
            }
        }
        catch (error) {
            console.error('Stripe checkout error:', error);
            // Re-throw with user-friendly message
            if (error instanceof Error) {
                throw error;
            }
            else {
                throw new Error('Checkout session creation failed. Please try again.');
            }
        }
    }
    /**
     * Update user subscription data in Firestore
     */
    async updateUserSubscription(userId, tier, isAnnual, additionalData = {}) {
        if (!firebaseServices) {
            throw new Error('Firebase services not initialized');
        }
        try {
            const db = firebaseServices.getFirestore();
            const userRef = firebaseServices.doc(db, 'users', userId);
            const subscriptionData = {
                tier,
                isAnnual,
                status: 'active',
                updatedAt: new Date(),
                ...additionalData
            };
            await firebaseServices.setDoc(userRef, { subscription: subscriptionData }, { merge: true });
            console.log(`Subscription updated for user ${userId}: ${tier} (${isAnnual ? 'annual' : 'monthly'})`);
        }
        catch (error) {
            console.error('Failed to update user subscription:', error);
            throw new Error('Subscription update failed');
        }
    }
    /**
     * Get user subscription data from Firestore
     */
    async getUserSubscription(userId) {
        if (!firebaseServices) {
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
            return userData.subscription || null;
        }
        catch (error) {
            console.error('Failed to get user subscription:', error);
            return null;
        }
    }
    /**
     * Create customer portal session for subscription management
     */
    async createPortalSession(returnUrl) {
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
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(`Portal session creation failed: ${errorData.error || response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Portal session error:', error);
            throw new Error('Failed to access customer portal');
        }
    }
    /**
     * Validate Stripe configuration
     */
    static validateConfig(config) {
        if (!config.publicKey || config.publicKey.trim() === '') {
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
            checkoutEndpoint: config.checkoutEndpoint || defaultCheckoutEndpoint,
            portalEndpoint: config.portalEndpoint || defaultPortalEndpoint
        };
    }
    /**
     * Handle post-checkout success
     */
    async handleCheckoutSuccess(sessionId) {
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
            const { subscription } = await response.json();
            if (subscription) {
                await this.updateUserSubscription(auth.currentUser.uid, subscription.tier, subscription.isAnnual, subscription);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Checkout success handling failed:', error);
            return false;
        }
    }
    /**
     * Get current Stripe instance (for advanced usage)
     */
    async getStripeInstance() {
        await this.initializeStripe();
        return this.stripe;
    }
}
/**
 * Create and configure the default Stripe service instance
 */
let defaultStripeService = null;
export const createStripeService = (config) => {
    try {
        const stripeConfig = StripeService.validateConfig({
            publicKey: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', ''),
            ...config
        });
        return StripeService.getInstance(stripeConfig);
    }
    catch (error) {
        console.error('Failed to create Stripe service:', error);
        throw error;
    }
};
/**
 * Get the default configured Stripe service (safe initialization)
 */
export const getStripeService = () => {
    if (!defaultStripeService) {
        try {
            defaultStripeService = createStripeService();
        }
        catch (error) {
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
export const formatPrice = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};
export const calculateAnnualDiscount = (monthlyPrice, discountPercent = 20) => {
    const annualPrice = monthlyPrice * 12;
    const discountAmount = annualPrice * (discountPercent / 100);
    return annualPrice - discountAmount;
};
//# sourceMappingURL=stripe.js.map