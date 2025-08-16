export interface UserSubscription {
    tier: 'free' | 'premium' | 'elite';
    status: 'active' | 'canceled' | 'past_due' | 'incomplete';
    currentPeriodEnd: Date;
    customerId?: string;
    subscriptionId?: string;
}
export interface SubscriptionPlan {
    id: string;
    name: string;
    tier: 'free' | 'premium' | 'elite';
    price: number;
    features: string[];
    limits: {
        chartsPerMonth?: number;
        chartStorage?: number;
        [key: string]: any;
    };
}
export interface AstrologyChart {
    id: string;
    userId: string;
    birthData: {
        date: string;
        time: string;
        location: {
            lat: number;
            lng: number;
            name: string;
        };
    };
    planets: Planet[];
    houses: House[];
    aspects: Aspect[];
}
export interface Planet {
    name: string;
    sign: string;
    degree: number;
    house: number;
    retrograde: boolean;
}
export interface House {
    number: number;
    sign: string;
    degree: number;
}
export interface Aspect {
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
    applying: boolean;
}
export interface HealwaveSession {
    id: string;
    userId: string;
    frequency: number;
    duration: number;
    timestamp: string;
    personalizedFor?: AstrologyChart;
}
export * from './api';
export * from './ephemeris';
export * from './stripe';
export * from './subscriptions';
export * from './xaiService';
export * from './types';
export { useCrossAppStore } from './cross-app-hooks';
export { useCrossAppStore as useCrossAppState } from './useCrossAppStore';
export { stripeService, getStripeService, createStripeService, type StripeSession, type StripeCheckoutParams, type SubscriptionData, type StripeConfig } from './stripe';
//# sourceMappingURL=index.d.ts.map