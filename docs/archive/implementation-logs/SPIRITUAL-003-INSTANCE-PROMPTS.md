# SPIRITUAL-003: TCM-Wellness Bridge - Instance Implementation Prompts

## Overview

**Duration**: 6 weeks (3 parallel instances) **Architecture**: Multi-instance parallel development
with standards enforcement **Integration Point**: Week 4-6 (coordinated merge and testing)

---

## 🏛️ INSTANCE 1: Cultural Foundation & Data Architecture

### **Week 1-2: Foundation & Data Modeling**

**Prompt for Instance 1 Agent:**

````text
# SPIRITUAL-003: TCM-Wellness Bridge - Instance Implementation Prompts

## Overview

**Duration**: 6 weeks (3 parallel instances)
**Architecture**: Multi-instance parallel development with standards enforcement
**Integration Point**: Week 4-6 (coordinated merge and testing)

---

## 🏛️ INSTANCE 1: Cultural Foundation & Data Architecture

### **Week 1-2: Foundation & Data Modeling**

**Prompt for Instance 1 Agent:**

```text
You are implementing the Cultural Foundation & Data Architecture for SPIRITUAL-003: TCM-Wellness Bridge.

CONTEXT:
- Building Traditional Chinese Medicine integration for CosmicHub consciousness platform
- Must maintain cultural authenticity and respect for TCM traditions
- Creating foundation for HealWave frequency therapy integration

STANDARDS TO ENFORCE:
1. **Type Safety**: All data models using Zod schemas with strict validation
2. **Performance**: Redis caching for all knowledge base queries (24h TTL for elements, 12h for meridians)
3. **Cultural Authenticity**: Expert consultation validation framework required
4. **Testing**: 95%+ test coverage with cultural accuracy validation
5. **Documentation**: Traditional sources cited, cultural context explained

TASKS:
1. Design complete TCM knowledge base schema:
   - 5 Elements (Wood, Fire, Earth, Metal, Water) with Chinese names, properties, relationships
   - 12 Principal Meridians with accurate point locations and indications
   - Organ correspondences, emotional associations, seasonal timing
   - Element generation/control cycles (Wu Xing theory)

2. Create Zod validation schemas for:
   ```typescript
   TCMElementSchema, MeridianSchema, AcupointSchema, PatternSchema
````

1. Implement Redis caching strategy:
   - Namespace: 'tcm:\*'
   - TTL: elements(24h), meridians(12h), points(6h)
   - Cache warming for frequently accessed data

2. Cultural authenticity framework:
   - Traditional source validation
   - Expert practitioner review process
   - Cultural sensitivity guidelines

DELIVERABLES:

- Complete TCM knowledge base (365 traditional acupoints)
- Zod validation schemas for all TCM data types
- Redis caching layer with performance optimization
- Cultural authenticity validation framework
- 95%+ test coverage with integration tests

TECHNICAL SPECIFICATIONS:

- Use existing `packages/types/` structure
- Follow `backend/astro/calculations/` pattern for TCM calculations
- Implement in TypeScript with strict mode
- All async operations with proper error handling
- Performance budget: <100ms for knowledge base queries

OUTPUT REQUIREMENTS:

- File: `packages/types/src/tcm.types.ts`
- File: `backend/astro/calculations/tcm/knowledge_base.py`
- File: `backend/astro/calculations/tcm/validation.py`
- Tests: Comprehensive test suite with cultural accuracy validation

```text

### **Week 3-4: Integration Preparation**

**Prompt for Instance 1 Agent (Continuation):**

```

WEEK 3-4 CONTINUATION for Cultural Foundation & Data Architecture:

Now implement the integration layer and advanced TCM analysis algorithms.

ADDITIONAL TASKS:

1. TCM Pattern Recognition Engine:
   - Symptom-to-pattern mapping algorithms
   - Constitutional analysis (Nine Constitutions theory)
   - Tongue and pulse diagnosis data structures
   - Treatment principle recommendations

2. Astrological-TCM Correlations:
   - Planetary-organ correspondences
   - Seasonal/temporal correlations
   - Birth chart to constitutional mapping
   - Transit effects on TCM patterns

3. API Endpoint Definitions:

   ```python
   /api/tcm/analyze-constitution
   /api/tcm/pattern-recognition
   /api/tcm/element-balance
   /api/tcm/meridian-assessment
   ```

4. Performance Optimization:
   - Knowledge base indexing strategy
   - Query optimization for complex pattern matching
   - Memory-efficient data structures
   - Batch processing for multiple analyses

INTEGRATION REQUIREMENTS:

- Compatible with existing `backend/api/routers/` structure
- FastAPI integration with proper validation
- GraphQL schema definitions for frontend consumption
- Real-time updates for dynamic pattern changes

CULTURAL VALIDATION:

- Weekly expert TCM practitioner reviews
- Traditional text accuracy verification
- Cultural appropriation sensitivity review
- Educational content accuracy validation

Continue using strict standards enforcement and maintain 95%+ test coverage.

```text

---

## ⚙️ INSTANCE 2: Technical Architecture & Core Systems

### **Week 1-2: Core Architecture**

**Prompt for Instance 2 Agent:**

```

You are implementing the Technical Architecture & Core Systems for SPIRITUAL-003: TCM-Wellness
Bridge.

CONTEXT:

- Building high-performance backend systems for TCM integration
- Must integrate with existing CosmicHub architecture
- Preparing for HealWave cross-platform synchronization
- Supporting real-time analysis and recommendations

STANDARDS TO ENFORCE:

1. **Architecture**: Microservices pattern following existing CosmicHub structure
2. **Performance**: <200ms API response times, vectorized calculations where possible
3. **Error Boundaries**: Comprehensive error handling with graceful degradation
4. **Monitoring**: Full observability with metrics, logging, tracing
5. **Security**: Authentication, authorization, data validation at all layers
6. **Scalability**: Horizontal scaling support, database optimization

TASKS:

1. Core TCM Analysis Engine:

   ```python
   class TCMAnalysisEngine:
       async def analyze_constitution(self, birth_data, symptoms)
       async def identify_patterns(self, symptom_data)
       async def recommend_treatments(self, pattern_analysis)
       async def calculate_element_balance(self, patient_data)
   ```

2. GraphQL API Design:
   - Complete schema for TCM data types
   - Real-time subscriptions for analysis updates
   - Optimized resolvers with DataLoader pattern
   - Input validation with proper error responses

3. Microservice Architecture:
   - TCM Analysis Service
   - Pattern Recognition Service
   - Recommendation Engine Service
   - Data Synchronization Service

4. Performance Optimization:
   - Redis caching integration (work with Instance 1)
   - Database query optimization
   - Async processing for heavy calculations
   - Connection pooling and resource management

TECHNICAL SPECIFICATIONS:

- FastAPI backend following existing patterns in `backend/`
- PostgreSQL for relational TCM knowledge data
- Redis for caching and session management
- Celery for background task processing
- Prometheus metrics collection
- Structured logging with context

INTEGRATION POINTS:

- Existing authentication system
- Current user management
- Analytics system (recently completed)
- Error monitoring and alerting

DELIVERABLES:

- Complete TCM microservice architecture
- GraphQL API with 50+ optimized endpoints
- Real-time analysis engine with <200ms response times
- Comprehensive monitoring and logging system
- Load testing results showing 1000+ concurrent users

```text

### **Week 3-4: Advanced Features & AI Integration**

**Prompt for Instance 2 Agent (Continuation):**

```

WEEK 3-4 CONTINUATION for Technical Architecture & Core Systems:

Implement advanced AI features and system integrations.

ADVANCED TASKS:

1. AI-Powered Pattern Recognition:

   ```python
   class TCMPatternAI:
       async def analyze_symptom_clusters(self, symptoms: List[str])
       async def predict_pattern_progression(self, current_patterns)
       async def generate_personalized_recommendations(self, patient_history)
       async def cross_reference_systems(self, tcm_data, astro_data)
   ```

2. Real-Time Data Processing:
   - WebSocket connections for live analysis updates
   - Event streaming for pattern changes
   - Real-time recommendation adjustments
   - Live synchronization with HealWave data

3. Advanced Caching Strategy:
   - Multi-tier caching (L1: memory, L2: Redis, L3: DB)
   - Predictive cache warming
   - Cache invalidation strategies
   - Performance metrics tracking

4. Cross-System Integration:
   - Astrology-TCM correlation algorithms
   - Vedic-TCM traditional medicine bridge
   - Western-TCM symptom mapping
   - Multi-system synthesis engine

PERFORMANCE REQUIREMENTS:

- API response times: <200ms (95th percentile)
- Concurrent users: 1000+ without degradation
- Database queries: <50ms average
- Cache hit ratio: >90% for knowledge base queries

AI/ML INTEGRATION:

- Pattern recognition accuracy: >85%
- Recommendation relevance: >4.5/5 user rating
- Cross-system correlation confidence: >80%
- Learning from user feedback loops

MONITORING & OBSERVABILITY:

- Custom Grafana dashboards for TCM metrics
- Alert rules for performance degradation
- User journey tracking through TCM analysis
- A/B testing framework for recommendations

Continue following all CosmicHub standards and prepare for Instance 3 integration.

```text

---

## 🎨 INSTANCE 3: HealWave Integration & User Experience

### **Week 2-3: UI/UX Foundation**

**Prompt for Instance 3 Agent:**

```

You are implementing the HealWave Integration & User Experience for SPIRITUAL-003: TCM-Wellness
Bridge.

CONTEXT:

- Building user-facing components for TCM analysis and recommendations
- Integrating with HealWave app for frequency therapy
- Creating mobile-first, accessible, culturally respectful interface
- Bridge between traditional medicine and modern technology

STANDARDS TO ENFORCE:

1. **UI/UX**: Tailwind CSS + RadixUI components, cosmic design system
2. **Accessibility**: WCAG 2.1 AA compliance, screen reader support
3. **Mobile**: Mobile-first responsive design, touch optimizations
4. **Performance**: Lazy loading, code splitting, virtualization for large datasets
5. **Cultural Sensitivity**: Respectful visual design, traditional aesthetics
6. **Error Handling**: Graceful degradation, helpful error messages

TASKS:

1. TCM-Themed Component Library:

   ```tsx
   // Core components
   <TCMElementWheel /> // Interactive Five Elements visualization
   <MeridianMap />     // Body meridian visualization
   <PatternAnalysis /> // Analysis results display
   <TreatmentPlan />   // Recommendations interface
   <ProgressTracker /> // Treatment progress
   ```

2. Mobile-Optimized Interface:
   - Touch-friendly Five Elements selector
   - Swipe-based meridian navigation
   - Mobile questionnaire interface
   - Responsive chart visualizations
   - Haptic feedback for important interactions

3. Accessibility Implementation:
   - Screen reader support for all TCM data
   - Keyboard navigation for complex visualizations
   - High contrast mode support
   - Text scaling support
   - Alternative text for traditional symbols

4. Cultural Design Elements:
   - Traditional Chinese color palettes (earth tones, natural colors)
   - Respectful use of traditional symbols
   - Educational content with cultural context
   - Proper pronunciation guides for Chinese terms

TECHNICAL SPECIFICATIONS:

- React 18 with Suspense boundaries
- Tailwind CSS with custom TCM color palette
- RadixUI for accessible primitives
- Framer Motion for smooth animations
- React Hook Form for questionnaires
- React Query for data management

DELIVERABLES:

- Complete TCM component library
- Mobile-responsive analysis interface
- Accessibility compliant (WCAG 2.1 AA)
- Cultural sensitivity validation passed
- Performance budget: <3s initial load

```text

### **Week 4-6: HealWave Integration & Advanced Features**

**Prompt for Instance 3 Agent (Continuation):**

```

WEEK 4-6 CONTINUATION for HealWave Integration & User Experience:

Implement HealWave bridge and advanced user experience features.

ADVANCED TASKS:

1. HealWave-TCM Integration Bridge:

   ```tsx
   class TCMFrequencyBridge {
     // Map TCM patterns to healing frequencies
     async generateFrequencyProtocol(tcmAnalysis: TCMAnalysis);

     // Real-time biofeedback integration
     async processBiofeedbackData(sensorData: BiofeedbackData);

     // Personalized frequency recommendations
     async personalizeFrequencies(userProfile: UserProfile, tcmPattern: TCMPattern);
   }
   ```

2. Cross-Platform Features:
   - Unified user experience between Astro and HealWave
   - Synchronized TCM data across platforms
   - Progressive Web App (PWA) capabilities
   - Offline functionality for core features

3. Advanced Visualizations:
   - Interactive 3D meridian mapping
   - Animated Five Elements relationships
   - Real-time pattern progression charts
   - Personalized recommendation timelines

4. User Engagement Features:
   - Daily TCM insights based on analysis
   - Progress tracking with visual feedback
   - Educational content delivery system
   - Community features for TCM practitioners

HEALWAVE INTEGRATION SPECIFICS:

- Frequency Protocol Generation:
  - Liver Qi Stagnation → 528Hz base frequency
  - Kidney Yang Deficiency → 285Hz therapy
  - Heart Fire Excess → 639Hz calming frequencies
  - Custom protocols based on individual analysis

- Biofeedback Integration:
  - Heart Rate Variability (HRV) monitoring
  - Stress level correlation with TCM patterns
  - Real-time adjustment of frequency therapy
  - Progress tracking across both platforms

MOBILE APP ENHANCEMENTS:

- Native iOS/Android TCM features
- Apple Health/Google Fit integration
- Push notifications for treatment reminders
- Offline access to TCM knowledge base

PERFORMANCE REQUIREMENTS:

- Mobile app load time: <3 seconds
- Smooth 60fps animations
- Efficient memory usage for large datasets
- Battery optimization for background features

CULTURAL & EDUCATIONAL FEATURES:

- Interactive TCM learning modules
- Traditional text references and explanations
- Video guides for self-assessment techniques
- Expert practitioner directory integration

TESTING REQUIREMENTS:

- Usability testing with TCM practitioners
- A/B testing for frequency protocol effectiveness
- Accessibility testing with assistive technologies
- Performance testing across device ranges

Continue integrating with Instance 1 & 2 outputs and prepare for final system integration.

```text

---

## 🔄 INTEGRATION & COORDINATION PROMPTS

### **Week 4: Integration Start**

**Prompt for All Instances Coordination:**

```

INTEGRATION PHASE: All instances begin coordination for SPIRITUAL-003 system integration.

INTEGRATION TASKS:

INSTANCE 1 (Cultural Foundation):

- Provide finalized TCM knowledge base API
- Share cultural validation results
- Export Zod schemas for cross-instance use
- Validate Instance 2's pattern recognition accuracy

INSTANCE 2 (Technical Architecture):

- Integrate Instance 1's knowledge base
- Expose GraphQL endpoints for Instance 3
- Provide real-time WebSocket connections
- Test Instance 3's UI component integration

INSTANCE 3 (UI/HealWave):

- Consume Instance 2's GraphQL API
- Validate Instance 1's cultural authenticity in UI
- Complete HealWave bridge implementation
- Provide user acceptance testing feedback

COORDINATION REQUIREMENTS:

1. Daily standup between instances (async updates)
2. Shared testing environment deployment
3. Cross-instance code review process
4. Performance testing with full integration
5. Cultural validation with expert review

QUALITY GATES:

- All automated tests passing (>95% coverage)
- Performance benchmarks met (<200ms API, <3s UI load)
- Accessibility compliance validated (WCAG 2.1 AA)
- Cultural authenticity expert approval
- Security review completed

```text

### **Week 5-6: Final Integration & Launch**

**Prompt for Final Integration:**

```

FINAL INTEGRATION PHASE: Complete system integration and production preparation.

ALL INSTANCES TASKS:

1. Production deployment preparation
2. User acceptance testing coordination
3. Performance optimization based on integration results
4. Documentation finalization
5. Launch readiness verification

FINAL VALIDATION CHECKLIST:

- [ ] Cultural authenticity: Expert TCM practitioner approval
- [ ] Technical performance: All benchmarks exceeded
- [ ] User experience: >4.5/5 satisfaction rating
- [ ] Accessibility: WCGA 2.1 AA compliance verified
- [ ] Security: Penetration testing completed
- [ ] Documentation: User guides and technical docs complete

LAUNCH PREPARATION:

- Marketing content ready
- User onboarding flow tested
- Support documentation prepared
- Rollback plan established
- Monitoring dashboards configured

SUCCESS METRICS TO TRACK:

- User engagement with TCM features
- HealWave integration usage rates
- Cultural authenticity feedback scores
- Technical performance metrics
- User satisfaction and retention

```text

---

## 📋 STANDARDS ENFORCEMENT CHECKLIST

### **For All Instances - Use This Checklist:**

**Type Safety & Validation:**
- [ ] All data models use Zod schemas
- [ ] TypeScript strict mode enabled
- [ ] Runtime validation at API boundaries
- [ ] Proper error handling with type guards

**Performance & Caching:**
- [ ] Redis caching implemented (TTL: 24h elements, 12h meridians)
- [ ] API response times <200ms (95th percentile)
- [ ] Lazy loading for heavy components
- [ ] Virtualization for large data sets
- [ ] Code splitting and tree shaking

**UI/UX Standards:**
- [ ] Tailwind CSS with cosmic design system
- [ ] RadixUI for accessible primitives
- [ ] Mobile-first responsive design
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Cultural sensitivity validation

**Error Handling & Resilience:**
- [ ] Error boundaries at appropriate levels
- [ ] Suspense boundaries for async components
- [ ] Graceful degradation strategies
- [ ] Proper loading states and feedback

**Testing & Quality:**
- [ ] >95% test coverage
- [ ] Unit, integration, and E2E tests
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Cultural accuracy validation

**Monitoring & Observability:**
- [ ] Structured logging with context
- [ ] Metrics collection (Prometheus/Grafana)
- [ ] Error tracking and alerting
- [ ] User journey analytics
- [ ] Performance monitoring

This prompt-based approach provides clear, actionable guidance for each instance while maintaining strict adherence to CosmicHub's established standards and ensuring successful parallel development of the TCM-Wellness Bridge system.
```
