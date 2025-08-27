# 🤖 CosmicHub AI Assistant Guide

> **Auto-Discovery File**: AI assistants should read this file first for complete project context

## 📚 ESSENTIAL CONTEXT FILES (Read First)

Before working on any task, **ALWAYS** read these files in order:

1. **[docs/00-OVERVIEW/MASTER_CONTEXT.md](docs/00-OVERVIEW/MASTER_CONTEXT.md)** - Complete project context and status
2. **[docs/04-ARCHITECTURE/PROJECT_STRUCTURE.md](docs/04-ARCHITECTURE/PROJECT_STRUCTURE.md)** - Codebase organization  
3. **[docs/02-ACTIVE-PRIORITIES/MASTER_TASK_LIST.md](docs/02-ACTIVE-PRIORITIES/MASTER_TASK_LIST.md)** - Current priorities
4. **[AI-COORDINATION-RULES.md](AI-COORDINATION-RULES.md)** - Execution rules and patterns

## 🎯 PROJECT STATUS SNAPSHOT

**Production Status**: ✅ Production-ready platform with all major features complete  
**Code Quality**: ✅ 0 TypeScript errors, optimized ESLint configuration  
**Test Coverage**: ✅ 284/284 backend tests passing, 69/69 frontend tests passing  
**Architecture**: React + TypeScript frontend, Python FastAPI backend  
**Build Performance**: 83% improvement (20s → 2s)  

## ⚡ CRITICAL EXECUTION PATTERNS

### **Lint Coordination System**

```bash
# ✅ ALWAYS use the safe coordination system
npm run lint:ai-coord

# Current status: 5 agents ready, 3 need work
# Stage 1: 5 agents parallel (optimized for speed)
# Stage 2: 2 dependent agents (after Stage 1 complete)
```

### **Agent Dependencies**

- **Agent 3 (PagesContextAgent)** depends on **Agent 1 (ComponentFixAgent)**
- **Agent 7 (AppsPackagesAgent)** depends on **Agents 4,5,6 (Services/UI/Config)**

### **Build System**

```bash
# ✅ Fast development builds
npm run build:fast          # 83% faster than legacy

# ✅ Development with hot reload  
npm run dev                  # All apps
npm run dev --workspace=apps/astro    # Specific app
```

## 🏗️ ARCHITECTURE OVERVIEW

```text
CosmicHub/
├── apps/
│   ├── astro/              # Astrology app (React + TypeScript)
│   ├── healwave/           # Frequency healing app  
│   └── mobile/             # React Native app
├── packages/               # Shared packages (auth, ui, config, etc.)
├── backend/                # Python FastAPI with vectorized operations
├── docs/                   # Numbered documentation (00-08, 99-REFERENCE)
└── scripts/                # Build, coordination, and automation tools
```

## 📋 CURRENT PRIORITIES

**Immediate**: Lint coordination - 3 agents need fixes (ComponentFixAgent, PagesContextAgent, AppsPackagesAgent)  
**Next**: Infrastructure hardening (monitoring, security enhancements)  
**Status**: Phase 3 planning after code quality completion  

## 🚨 COMMON MISTAKES TO AVOID

1. **Never assume files exist** - Use `file_search` or `list_dir` first
2. **Wait for command completion** - Check exit codes before reading outputs  
3. **Don't read partial terminal output** - Use output files or wait for completion
4. **Follow existing patterns** - Use established scripts and coordination systems
5. **Check documentation first** - Your answers are likely in the numbered docs structure

## 🔧 DEVELOPMENT TOOLS & PATTERNS

### **Documentation Navigation**

- **00-OVERVIEW/**: Essential context and setup guides
- **01-CURRENT-STATUS/**: Real-time project status  
- **02-ACTIVE-PRIORITIES/**: Current tasks and priorities
- **03-GUIDES/**: Development workflows and patterns
- **04-ARCHITECTURE/**: Technical specifications
- **05-ARCHIVE/**: Completed work and historical context

### **Testing & Quality**

```bash
npm run lint                 # ESLint with strict configuration
npm run type-check          # TypeScript compilation check  
npm run test                # All test suites
npm run test:astro          # Frontend tests only
```

### **Coordination & Automation**

```bash
npm run lint:ai-coord       # Safe coordination system (primary)
./scripts/safe-coordination.sh    # Direct script execution
```

## 📊 PERFORMANCE METRICS

- **Build Time**: ~2 seconds (83% improvement)
- **Test Suite**: 353/353 tests passing across all systems
- **Code Quality**: 0 TypeScript errors, optimized ESLint baseline
- **Bundle Size**: Optimized with advanced code splitting
- **Core Web Vitals**: All metrics in green zone

## 🎯 QUICK START FOR AI ASSISTANTS

1. **Read context**: Start with `docs/00-OVERVIEW/MASTER_CONTEXT.md`
2. **Check status**: Review current coordination output in `coordination-output.log`  
3. **Follow patterns**: Use existing scripts and avoid reinventing workflows
4. **Respect dependencies**: Agent 3→1, Agent 7→(4,5,6)
5. **Wait for completion**: Never read outputs before commands finish

## 📞 HELP & REFERENCE

- **Full Documentation Index**: [docs/00-OVERVIEW/INDEX.md](docs/00-OVERVIEW/INDEX.md)
- **Setup Automation**: [docs/00-OVERVIEW/AI_CONTEXT_AUTOMATION.md](docs/00-OVERVIEW/AI_CONTEXT_AUTOMATION.md)  
- **Execution Rules**: [AI-COORDINATION-RULES.md](AI-COORDINATION-RULES.md)
- **Project Overview**: [README.md](README.md)

---

**🎯 Remember**: This project has sophisticated automation and coordination systems already in place. Use them instead of recreating functionality. When in doubt, check the documentation structure first.
