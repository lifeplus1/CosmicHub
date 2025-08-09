# 🏗️ CosmicHub Project Structure

## **Architecture Overview: Standalone Apps with Shared Infrastructure**

### 🎯 **Key Principle**: HealWave remains completely standalone while leveraging shared functionality

---

## 📁 **Current Optimized Structure**

```text
CosmicHub/
├── apps/                           # 🎯 STANDALONE APPLICATIONS
│   ├── astro/                      # ⭐ Astrology App (cosmichub.com)
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   └── frequency/      # 🌟 Astrology-enhanced frequency modules
│   │   │   │       └── AstroFrequencyGenerator.tsx
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── App.tsx
│   │   ├── package.json            # ✅ Independent dependencies + shared packages
│   │   ├── Dockerfile              # 🐳 Independent deployment
│   │   └── vite.config.ts
│   │
│   └── healwave/                   # 🎵 HealWave App (healwave.com)
│       ├── src/
│       │   ├── components/
│       │   │   └── FrequencyGenerator.tsx  # 🎵 Standalone frequency generator
│       │   ├── pages/
│       │   └── App.tsx
│       ├── package.json            # ✅ Independent dependencies + shared packages
│       ├── Dockerfile              # 🐳 Independent deployment
│       └── vite.config.ts
│
├── packages/                       # 🔧 SHARED INFRASTRUCTURE (No Code Duplication)
│   ├── auth/                       # 🔐 Shared authentication logic
│   ├── config/                     # ⚙️ Shared configuration management
│   ├── frequency/                  # 🎵 Shared audio engine & frequency logic
│   ├── integrations/               # 🔗 Cross-app utilities & API clients
│   └── ui/                         # 🎨 Shared UI components
│
├── backend/                        # 🖥️ UNIFIED API SERVER
│   ├── api/
│   │   ├── routers/
│   │   │   ├── presets.py          # 📊 HealWave preset management
│   │   │   ├── subscriptions.py    # 💳 Shared subscription logic
│   │   │   └── ai.py               # 🤖 Shared AI chatbot
│   │   └── models/
│   ├── astro/                      # ⭐ Astrology calculations
│   └── main.py
│
└── shared/                         # 📦 Legacy shared files (being migrated to packages/)
```text

---

## 🎯 **HealWave Standalone Deployment**

### **1. Independent Build Process**
```bash
# HealWave builds completely independently
cd apps/healwave
npm install
npm run build
npm run preview

# Deploy to healwave.com
vercel deploy --prod
```text

### **2. Standalone User Experience**
- **URL**: `healwave.com` (completely separate domain)
- **Navigation**: Independent routing, no astrology features
- **Branding**: HealWave-specific design and messaging
- **Features**: Pure frequency therapy focus

### **3. Shared Infrastructure Usage**
```typescript
// apps/healwave/src/App.tsx
import { AuthProvider } from '@cosmichub/auth';        // 🔐 Shared auth
import { AudioEngine } from '@cosmichub/frequency';    // 🎵 Shared audio logic
import { Button } from '@cosmichub/ui';                // 🎨 Shared components

// HealWave uses shared infrastructure but remains standalone
function HealWaveApp() {
  return (
    <AuthProvider>
      <HealWaveFrequencyGenerator />  {/* 100% HealWave-specific */}
    </AuthProvider>
  );
}
```text

---

## ⭐ **Astrology App Enhanced Integration**

### **1. Enhanced Frequency Features**
```typescript
// apps/astro/src/features/frequency/AstroFrequencyGenerator.tsx
import { AudioEngine } from '@cosmichub/frequency';    // 🎵 Same shared logic as HealWave

// But with astrology-specific enhancements:
function AstroFrequencyGenerator({ chartData, transits }) {
  const personalizedFrequency = useMemo(() => {
    // 🌟 Adjust frequencies based on astrology chart
    return calculateAstrologyFrequency(baseFrequency, chartData);
  }, [chartData]);

  // 🎵 Use same AudioEngine as HealWave, but with astrology context
  return <EnhancedFrequencyInterface />;
}
```text

### **2. Astrology-Specific Features**
- **Transit-based frequency recommendations**
- **Chart-synchronized binaural beats** 
- **Planetary frequency mappings**
- **Human design integration**
- **Personalized frequency calculations**

---

## 🔧 **Shared Infrastructure Benefits**

### **1. Zero Code Duplication**
```typescript
// ✅ BEFORE: Duplicated across apps
// apps/healwave/src/audio.ts       (duplicated)
// apps/astro/src/audio.ts          (duplicated)

// ✅ AFTER: Shared package
// packages/frequency/src/index.ts  (single source of truth)
```text

### **2. Consistent Authentication**
```typescript
// Both apps use the same auth logic but remain independent
import { AuthProvider, useAuth } from '@cosmichub/auth';

// HealWave: healwave.com/login
// Astro: cosmichub.com/login
// Same underlying auth, different UX contexts
```text

### **3. Cross-App Premium Features**
```typescript
// packages/integrations/src/subscriptions.ts
export const useCrossAppSubscription = () => {
  // Premium features work across both apps
  // But each app can be used independently
};
```text

---

## 🚀 **Deployment Independence**

### **HealWave Deployment** (healwave.com)
```yaml
# vercel.json for HealWave
{
  "name": "healwave",
  "buildCommand": "cd apps/healwave && npm run build",
  "outputDirectory": "apps/healwave/dist"
}
```text

### **Astrology Deployment** (cosmichub.com)
```yaml
# vercel.json for Astrology  
{
  "name": "cosmichub-astro",
  "buildCommand": "cd apps/astro && npm run build", 
  "outputDirectory": "apps/astro/dist"
}
```text

### **Backend Deployment** (astrology-app-0emh.onrender.com)
```yaml
# Unified API serves both apps
services:
  - healthwave endpoints: /api/presets, /api/frequencies
  - astrology endpoints: /api/charts, /api/transits
  - shared endpoints: /api/auth, /api/subscriptions
```text

---

## 🎊 **Summary: Best of Both Worlds**

### ✅ **HealWave Remains Standalone**
- Independent build, deploy, and URL
- Pure frequency therapy focus
- No astrology complexity for users
- Can be marketed and scaled independently

### ✅ **Zero Code Duplication**
- Shared audio engine prevents bugs
- Consistent authentication across apps
- Unified subscription management
- Shared UI components for consistency

### ✅ **Astrology App Enhanced**
- Same robust frequency engine as HealWave
- Plus astrology-specific features
- Personalized frequency recommendations
- Integration with chart calculations

### ✅ **Developer Benefits**
- Single source of truth for core logic
- Faster feature development
- Easier maintenance and bug fixes
- Consistent testing and deployment

---

**🎯 Result**: HealWave functions as a completely standalone app while sharing robust, tested infrastructure with the astrology app. Users get the best experience in each app, and developers avoid code duplication.
