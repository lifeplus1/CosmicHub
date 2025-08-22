# 🏗️ CosmicHub Project Structure

> **Last Updated:** August 22, 2025  
> **Structure Version:** 4.0 - Numbered Documentation Organization  
> **Status:** ✅ Comprehensive monorepo with numbered documentation structure

## 📁 **ROOT DIRECTORY STRUCTURE**

```text
CosmicHub/
├── 📱 apps/                      # Frontend applications
│   ├── astro/                   # Astrology application (React + TypeScript)
│   ├── healwave/               # Frequency therapy app (React + TypeScript)
│   └── mobile/                 # React Native mobile app (foundation)
├── 🔧 backend/                   # Python FastAPI backend services
├── 📦 packages/                  # Shared monorepo packages
├── 📚 docs/                     # Numbered documentation structure (89 files)
├── 🔧 Configuration Files        # Build, deployment, and tooling config
└── 📄 Project Files             # README, workspace, and metadata
```

## 🌟 **NUMBERED DOCUMENTATION STRUCTURE**

### **docs/ - Numbered Directory Organization (August 22, 2025)**

```text
docs/
├── 00-OVERVIEW/                    # 📘 Project Overview & Essential Context
│   ├── MASTER_CONTEXT.md          # 🎯 ESSENTIAL - Complete AI assistant context
│   ├── AI_CONTEXT_AUTOMATION.md   # AI assistant setup guide
│   └── INDEX.md                   # Documentation index and navigation
├── 01-CURRENT-STATUS/             # 📊 Current Project State
│   ├── PROJECT_STATUS.md          # Current development status
│   ├── PROJECT_PRIORITIES_2025.md # 2025 development priorities
│   ├── PROJECT_STATUS_SUMMARY.md  # Status summary
│   └── MOBILE_STATUS.md           # Mobile development status
├── 02-ACTIVE-PRIORITIES/          # 🎯 Current Work & Tasks
│   ├── MASTER_TASK_LIST.md        # ESSENTIAL - Prioritized task list
│   └── ISSUE_TRACKER.md           # Active issue tracking
├── 03-GUIDES/                     # 📚 All Development & Feature Guides
│   ├── deployment/                # Production deployment guides
│   ├── feature-guides/            # Feature-specific implementation guides
│   ├── development/               # Development workflows and patterns
│   ├── experimentation/           # A/B testing and experiments
│   └── data-and-environment/      # Configuration and setup guides
├── 04-ARCHITECTURE/               # 🏗️ System Design & Technical Specs
│   ├── PROJECT_STRUCTURE.md       # ESSENTIAL - This file (codebase organization)
│   ├── SYSTEM_ARCHITECTURE.md     # System architecture overview
│   ├── CONCURRENCY_MODEL_SPEC.md  # Concurrency specifications
│   ├── architecture-planning/     # Technical planning documents
│   └── multi-system/              # Astrology system specifications
├── 05-ARCHIVE/                    # 📦 Historical & Completed Work
│   ├── implementation-summaries/  # Completed feature documentation
│   ├── phase-completions/         # Historical development phases
│   ├── historical-plans/          # Archived planning documents
│   └── lint-and-quality/          # Code quality improvement history
├── 06-OPERATIONS/                 # ⚙️ Operational Procedures
│   ├── operations/                # Capacity planning and system operations
│   └── runbooks/                  # Operational procedures and templates
├── 07-MONITORING/                 # � Observability & Monitoring
│   └── observability/             # Logging specifications and SLO policies
├── 08-SECURITY/                   # � Security & Privacy
│   ├── security/                  # Security policies and threat models
│   └── privacy/                   # Privacy policies and data classification
└── 99-REFERENCE/                  # � Reference Materials
    └── (to be populated)          # Reference documentation and standards
```

## 📱 **FRONTEND APPLICATIONS**

### **apps/astro/ - Astrology Application**

```text
apps/astro/
├── public/                     # Static assets and PWA files
├── src/
│   ├── components/            # React components
│   │   ├── ChartDisplay/     # Chart visualization components
│   │   ├── Calculator/       # Birth chart calculator
│   │   ├── Auth/            # Authentication components
│   │   └── UI/              # Shared UI components
│   ├── pages/               # Application pages/routes
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API client services
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── styles/              # CSS and styling files
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### **apps/healwave/ - Frequency Therapy Application**

```text
apps/healwave/
├── public/                     # Static assets and audio files
├── src/
│   ├── components/            # React components
│   │   ├── AudioEngine/      # Web Audio API components
│   │   ├── FrequencyGen/     # Frequency generation UI
│   │   ├── Therapy/          # Healing protocol components
│   │   └── Controls/         # Audio control interfaces
│   ├── audio/               # Audio processing utilities
│   ├── services/            # Audio and API services
│   └── [similar structure to astro]
├── package.json
└── vite.config.ts
```

### **apps/mobile/ - React Native Mobile App**

```text
apps/mobile/
├── src/
│   ├── screens/              # Mobile app screens
│   ├── components/           # React Native components
│   ├── navigation/           # Navigation configuration
│   ├── services/            # API and device services
│   └── utils/               # Mobile-specific utilities
├── package.json
├── app.json                 # Expo configuration
└── babel.config.js
```

## 🔧 **BACKEND SERVICES**

### **backend/ - Python FastAPI Backend**

```text
backend/
├── main.py                   # FastAPI application entry point
├── routers/                  # API route definitions
│   ├── charts.py            # Chart calculation endpoints
│   ├── users.py             # User management
│   ├── auth.py              # Authentication
│   ├── payments.py          # Stripe integration
│   └── interpretations.py   # AI interpretation endpoints
├── astro/                    # Astrological calculation engines
│   ├── calculations/        # Core calculation modules
│   │   ├── western.py       # Western astrology
│   │   ├── vedic.py         # Vedic astrology
│   │   ├── chinese.py       # Chinese astrology
│   │   ├── mayan.py         # Mayan astrology
│   │   └── uranian.py       # Uranian astrology
│   ├── multi_system/        # Multi-system integration
│   └── interpretations/     # AI interpretation logic
├── services/                 # Business logic services
├── utils/                    # Shared utilities
├── config/                   # Configuration management
├── tests/                    # Test suite (284 tests)
├── requirements.txt
└── Dockerfile
```

## 📦 **SHARED PACKAGES**

### **packages/ - Monorepo Shared Code**

```text
packages/
├── auth/                     # Authentication utilities
│   ├── src/
│   │   ├── firebase-auth.ts  # Firebase integration
│   │   ├── jwt-utils.ts      # Token management
│   │   └── auth-context.tsx  # React context
│   └── package.json
├── types/                    # Shared TypeScript definitions
│   ├── src/
│   │   ├── user.ts          # User and profile types
│   │   ├── chart.ts         # Chart and calculation types
│   │   ├── astro.ts         # Astrological data types
│   │   └── api.ts           # API request/response types
│   └── package.json
├── ui/                       # Shared React components
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── themes/          # Design system themes
│   │   └── utils/           # UI utilities
│   └── package.json
├── config/                   # Configuration utilities
│   ├── src/
│   │   ├── environment.ts   # Environment variables
│   │   ├── features.ts      # Feature flags
│   │   └── constants.ts     # Application constants
│   └── package.json
└── integrations/             # External service integrations
    ├── src/
    │   ├── stripe/          # Stripe payment processing
    │   ├── xai/             # xAI/Grok integration
    │   └── firebase/        # Firebase utilities
    └── package.json
```

## ⚙️ **CONFIGURATION FILES**

### **Root Configuration**

```text
CosmicHub/
├── package.json              # Root package.json with scripts
├── pnpm-workspace.yaml      # PNPM workspace configuration
├── turbo.json               # Turbo build system configuration
├── tsconfig.json            # Base TypeScript configuration
├── tsconfig.base.json       # Shared TypeScript settings
├── eslint.config.js         # ESLint configuration
├── .gitignore               # Git ignore rules
├── .env.example             # Environment variable template
├── Makefile                 # Build and deployment shortcuts
└── CosmicHub.code-workspace # VS Code workspace settings
```

### **Deployment Configuration**

```text
├── docker-compose.yml        # Docker services for local development
├── docker-compose.dev.yml   # Development-specific overrides
├── deploy-dev.sh            # Development deployment script
├── start-dev.sh             # Development startup script
├── firebase.json            # Firebase deployment configuration
└── vercel.json              # Vercel deployment settings
```

## 🔄 **WORKFLOW INTEGRATION**

### **GitHub Integration**

```text
.github/
├── workflows/
│   ├── ci-cd.yml            # Main CI/CD pipeline
│   ├── test.yml             # Testing workflows
│   └── deploy.yml           # Deployment automation
├── ISSUE_TEMPLATE.md        # Issue templates
└── PULL_REQUEST_TEMPLATE.md # PR templates
```

### **Development Tools**

```text
├── .vscode/                 # VS Code settings and extensions
├── scripts/                 # Build and utility scripts
└── tests/                   # Integration and E2E tests
```

## 📊 **PROJECT METRICS**

### **Codebase Size**

- **Total Files:** ~850+ files across all applications
- **Frontend Code:** ~400 TypeScript/React files
- **Backend Code:** ~150 Python files
- **Shared Packages:** ~100 shared utility files
- **Documentation:** 25+ organized documentation files
- **Configuration:** ~50 configuration and tooling files

### **Documentation Organization**

- **Before:** 344+ scattered markdown files
- **After:** 25 organized, consolidated documentation files
- **Reduction:** ~93% file reduction while maintaining all information
- **Organization:** Clear hierarchy from overview to detailed references

### **Code Quality**

- **ESLint Status:** 0 errors, 0 warnings
- **TypeScript:** 100% clean compilation
- **Test Coverage:** >95% across critical paths
- **Build Performance:** 2-3 seconds with Turbo optimization

## 🎯 **NAVIGATION GUIDE**

### **For New Developers**

1. **Start Here:** `docs/00-OVERVIEW/MASTER_CONTEXT.md`
2. **Setup:** `docs/03-GUIDES/DEVELOPMENT_SETUP.md`
3. **Architecture:** `docs/04-ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
4. **Standards:** `docs/99-REFERENCE/CODING_STANDARDS.md`

### **For Project Management**

1. **Current Status:** `docs/01-CURRENT-STATUS/PROJECT_STATUS_SUMMARY.md`
2. **Active Work:** `docs/02-ACTIVE-PRIORITIES/MASTER_TASK_LIST.md`
3. **Issue Tracking:** `docs/02-ACTIVE-PRIORITIES/ISSUE_TRACKER.md`

### **For DevOps/Deployment**

1. **Deployment Guide:** `docs/03-GUIDES/DEPLOYMENT_GUIDE.md`
2. **Architecture:** `docs/04-ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
3. **Troubleshooting:** `docs/03-GUIDES/TROUBLESHOOTING.md`

### **For AI Assistants**

1. **Essential Context:** `docs/00-OVERVIEW/MASTER_CONTEXT.md` (ALWAYS reference first)
2. **Current Status:** `docs/01-CURRENT-STATUS/PROJECT_STATUS_SUMMARY.md`
3. **Active Tasks:** `docs/02-ACTIVE-PRIORITIES/MASTER_TASK_LIST.md`

---

## 📞 **QUICK REFERENCE**

### **Key Commands**

```bash
# Development
pnpm run dev-frontend    # Start both Astro and HealWave apps
pnpm run dev-backend     # Start Python FastAPI server
pnpm run build           # Build all applications
pnpm run test            # Run all tests
pnpm run lint            # Code quality check

# Deployment
pnpm run deploy          # Deploy to production
git push origin main     # Trigger CI/CD pipeline
```

### **Important Paths**

- **Main Documentation:** `docs/00-OVERVIEW/MASTER_CONTEXT.md`
- **Current Status:** `docs/01-CURRENT-STATUS/PROJECT_STATUS_SUMMARY.md`
- **Architecture:** `docs/04-ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- **Active Tasks:** `docs/02-ACTIVE-PRIORITIES/MASTER_TASK_LIST.md`

**Project Structure Status:** ✅ Organized, documented, and optimized for development efficiency
