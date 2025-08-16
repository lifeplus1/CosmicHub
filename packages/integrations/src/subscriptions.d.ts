/**
 * Unified subscription management for CosmicHub monorepo
 * Handles Stripe integration and feature access across all apps
 */
declare class SimpleEventEmitter {
    private events;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    emit(event: string, data?: any): void;
}
export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    stripePriceId: string;
    apps: ('astro' | 'healwave')[];
}
export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: 'active' | 'inactive' | 'cancelled' | 'past_due';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    stripeSubscriptionId?: string;
    apps: ('astro' | 'healwave')[];
}
export interface FeatureAccess {
    canAccess: boolean;
    reason?: string;
    upgradeRequired?: boolean;
    requiredPlan?: string;
}
export declare const SUBSCRIPTION_PLANS: SubscriptionPlan[];
declare class SubscriptionManager extends SimpleEventEmitter {
    private currentSubscription;
    private plans;
    constructor();
    initialize(subscription: UserSubscription | null): void;
    getCurrentSubscription(): UserSubscription | null;
    getCurrentPlan(): SubscriptionPlan | null;
    checkFeatureAccess(feature: string, app?: 'astro' | 'healwave'): FeatureAccess;
    getAvailablePlans(currentApp?: 'astro' | 'healwave'): SubscriptionPlan[];
    createCheckoutSession(planId: string, successUrl: string, cancelUrl: string): Promise<{
        url: string;
    }>;
    createPortalSession(returnUrl: string): Promise<{
        url: string;
    }>;
    cancelSubscription(): Promise<void>;
    reactivateSubscription(): Promise<void>;
    updateSubscription(subscription: UserSubscription): void;
    subscribe(event: string, callback: (data: any) => void): () => void;
    getUsageLimits(): Record<string, number>;
    expiresWithin(days: number): boolean;
}
export declare const subscriptionManager: SubscriptionManager;
export declare const useSubscription: () => {
    subscription: UserSubscription | null;
    plan: SubscriptionPlan | null;
    checkFeatureAccess: (feature: string, app?: "astro" | "healwave") => FeatureAccess;
    getAvailablePlans: (currentApp?: "astro" | "healwave") => SubscriptionPlan[];
    createCheckoutSession: (planId: string, successUrl: string, cancelUrl: string) => Promise<{
        url: string;
    }>;
    createPortalSession: (returnUrl: string) => Promise<{
        url: string;
    }>;
    cancelSubscription: () => Promise<void>;
    reactivateSubscription: () => Promise<void>;
    getUsageLimits: () => Record<string, number>;
    expiresWithin: (days: number) => boolean;
    subscribe: (event: string, callback: (data: any) => void) => () => void;
};
export default subscriptionManager;
//# sourceMappingURL=subscriptions.d.ts.map