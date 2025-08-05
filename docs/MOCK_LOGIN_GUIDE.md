# Mock Login System for CosmicHub

This document explains how to use the mock login system for testing different subscription tiers in CosmicHub.

## Overview

The mock login system provides three predefined user accounts with different subscription tiers to test the application's premium features and subscription logic.

## Mock User Accounts

### 1. Free Tier User
- **Email:** `free@cosmichub.test`
- **Password:** `demo123`
- **Tier:** Free
- **Features:**
  - Basic birth chart calculation
  - Western tropical astrology only
  - Limited saved charts (3)
  - Basic interpretations
- **Usage Limits:**
  - Charts this month: 2/10
  - Saved charts: 1/3

### 2. Premium Tier User
- **Email:** `premium@cosmichub.test`
- **Password:** `demo123`
- **Tier:** Premium
- **Features:**
  - Multi-system analysis
  - Synastry compatibility
  - PDF chart exports
  - Unlimited saved charts
  - Advanced interpretations
- **Usage:**
  - Charts this month: 15 (unlimited)
  - Saved charts: 25 (unlimited)

### 3. Elite Tier User
- **Email:** `elite@cosmichub.test`
- **Password:** `demo123`
- **Tier:** Elite
- **Features:**
  - All Premium features
  - AI interpretations
  - Transit analysis & predictions
  - Priority support
  - Early access to new features
- **Usage:**
  - Charts this month: 50 (unlimited)
  - Saved charts: 100 (unlimited)

## How to Access Mock Logins

### Method 1: Mock Login Panel
1. Visit `/mock-login` directly in your browser
2. Click the "Login" button for any tier you want to test
3. You'll be automatically logged in and redirected to the home page

### Method 2: Via Login Page
1. Go to the regular login page (`/login`)
2. Look for the "🧪 For Testing" section at the bottom
3. Click on "Quick Mock Login Panel"
4. Select the tier you want to test

### Method 3: Development Button (Development Mode Only)
- When running in development mode, a small "🧪 Mock" button appears in the navbar
- Click it to access the mock login panel

## Testing Different Features

### Free Tier Testing
- Test basic chart calculation
- Verify usage limits are enforced
- Check that premium features are locked with upgrade prompts

### Premium Tier Testing
- Test multi-system analysis toggle
- Verify synastry analysis works
- Test PDF export functionality
- Check that Elite features show upgrade prompts

### Elite Tier Testing
- Test AI interpretation features
- Verify transit analysis works
- Check that all features are accessible

## Technical Implementation

The mock login system works by:

1. **Authentication**: Uses Firebase Auth with predefined email/password combinations
2. **Tier Recognition**: The `SubscriptionContext` checks the user's email address and assigns the appropriate tier
3. **Feature Access**: The `FeatureGuard` component and `useSubscription` hook control access to features based on the user's tier
4. **Usage Simulation**: Mock usage data is provided to test limits and quotas

## Development Notes

- Mock users are created automatically on first login attempt
- The system falls back to creating accounts if they don't exist
- All mock accounts have active subscriptions with 30-day periods
- Usage data is simulated and doesn't persist between sessions

## Environment

This mock system only works in development environments and should not be deployed to production.
