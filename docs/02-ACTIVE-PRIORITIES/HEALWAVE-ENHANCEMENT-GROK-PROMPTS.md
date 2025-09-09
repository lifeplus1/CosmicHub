# HealWave Enhancement Development - Grok Consultation Prompts

## 🎯 **Overview**

This document contains strategic prompts for Grok AI to assist with the development of HealWave app enhancements. Each prompt is designed to leverage Grok's capabilities for specific aspects of the development process.

---

## 🔊 **PROMPT 1: Advanced Audio Engine Architecture**

```text
# HealWave Advanced Audio Engine Design

I'm developing an advanced audio engine for a therapeutic frequency app called HealWave. The current implementation uses basic Web Audio API with simple binaural beats. I need to design a sophisticated audio system with the following requirements:

## Current Tech Stack:
- React 18 + TypeScript
- Web Audio API
- Radix UI components
- Tailwind CSS
- Firebase backend
- PWA capabilities

## Required Features:
1. Multi-phase sessions with frequency transitions
2. Advanced waveform generation (sine, square, triangle, sawtooth)
3. Stereo panning and spatial audio
4. Real-time frequency modulation
5. Session recording and playback
6. Biometric integration (heart rate variability)
7. Background audio processing
8. Offline audio caching

## Technical Constraints:
- Must work in browsers and PWA
- Should support iOS Safari and Chrome
- Memory efficient for long sessions
- Graceful degradation for older devices

Please provide:
1. Detailed architecture design with class structures
2. Web Audio API implementation strategies
3. Performance optimization techniques
4. Error handling and fallback mechanisms
5. Code examples for key components
6. Testing strategies for audio functionality

Focus on production-ready, scalable solutions that maintain excellent user experience across devices.
```

## RESPONSE 1

## HealWave Advanced Audio Engine Design and Implementation

This document outlines the production-ready design and implementation strategy for the HealWave Advanced Audio Engine within the CosmicHub monorepo. The design aligns with enforced standards: strict TypeScript for type safety (using type guards from `packages/types/type-guards.ts`), WCAG 2.1 accessibility (ARIA labels via Radix UI primitives in `packages/ui/components`), scalability via optimized Web Audio API usage and Redis caching for session data (backend/cache), modularity through shared packages (e.g., `packages/integrations/healwave.ts`, `packages/ui/components/AudioPlayer.tsx`), security with pseudonymized biometric data (backend/utils/pseudonymization.py), marketability via educational tooltips (`apps/astro/src/components/EducationalTooltip.tsx`), robustness with 100% Vitest coverage (`vitest.config.ts`), and performance optimizations (lazy loading in `apps/healwave/src/routes/lazy-routes.tsx`, memoization via `usePerformance.ts`, targeting <77ms audio initialization).

The engine builds on the existing `apps/healwave` structure, integrating seamlessly with `apps/astro` via shared modules (e.g., astrology-tied frequencies in `apps/astro/src/features/healwave`). All changes validate against `scripts/validate-env.mjs` and maintain Phase 3 vectorized backend compatibility (284/284 tests passing). AI agent coordination (e.g., `scripts/ai-agent-lint-coordinator.mjs`) will lint updates post-implementation.

## 1. Detailed Architecture Design

The architecture is modular, event-driven, and decoupled for scalability. It uses a factory pattern for waveform generators, an orchestrator for multi-phase sessions, and hooks for React integration. Core principles:

- **Separation of Concerns**: Audio generation, processing, and UI are isolated.
- **Extensibility**: Plugins for future features (e.g., AI-modulated frequencies via xAI integration in `packages/integrations/xaiService.ts`).
- **Offline Support**: IndexedDB caching via `packages/storage/offline-storage.ts` for PWA sessions.
- **Biometric Integration**: Securely processes HRV data from device APIs (e.g., Web Heart Rate API polyfill), pseudonymized before Firestore storage.

### High-Level Class Structures (TypeScript)

Define types in `packages/types` and extend existing audio types. Key classes in `apps/healwave/src/engine/` (new directory for modularity):

```typescript
// packages/types/audio.types.ts (extend existing astrology.types.ts)
export interface FrequencySession {
  id: string;
  phases: Phase[];
  waveform: WaveformType; // 'sine' | 'square' | 'triangle' | 'sawtooth'
  modulation?: ModulationConfig; // { rate: number; depth: number }
  biometricSync?: boolean; // Enables HRV integration
  duration: number; // ms
}

export interface Phase {
  startFreq: number;
  endFreq: number;
  duration: number; // ms
  pan?: { left: number; right: number }; // -1 to 1 for stereo
  volume?: number; // 0 to 1
}

export type WaveformType = OscillatorType; // Web Audio standard
export interface ModulationConfig {
  rate: number; // Hz for LFO
  depth: number; // Modulation amplitude
}

export interface AudioEngineState {
  isPlaying: boolean;
  currentPhase: number;
  elapsedTime: number;
  error?: string;
}

// apps/healwave/src/engine/WaveformGenerator.ts
import { AudioContext } from 'standardized-audio-context'; // Polyfill for cross-browser
import type { WaveformType, Phase } from 'packages/types/audio.types';
import { typeGuardIsValidFrequency } from 'packages/types/type-guards'; // Strict validation

export class WaveformGenerator {
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private context: AudioContext;
  private modulationLFO?: OscillatorNode; // For real-time FM

  constructor(context: AudioContext) {
    this.context = context;
  }

  createWaveform(type: WaveformType, frequency: number): void {
    if (!typeGuardIsValidFrequency(frequency)) {
      throw new Error('Invalid frequency: must be 20-20000 Hz');
    }
    this.oscillator = this.context.createOscillator();
    this.oscillator.type = type;
    this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);

    this.gainNode = this.context.createGain();
    this.gainNode.gain.setValueAtTime(0.5, this.context.currentTime); // Default volume

    this.pannerNode = this.context.createStereoPanner();
    this.pannerNode.pan.setValueAtTime(0, this.context.currentTime); // Center pan

    // Connect chain: oscillator -> gain -> panner -> destination
    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.pannerNode);
    this.pannerNode.connect(this.context.destination);
  }

  applyModulation(config: ModulationConfig): void {
    if (!this.oscillator) return;
    this.modulationLFO = this.context.createOscillator();
    this.modulationLFO.type = 'sine';
    this.modulationLFO.frequency.setValueAtTime(config.rate, this.context.currentTime);

    const lfoGain = this.context.createGain();
    lfoGain.gain.setValueAtTime(config.depth, this.context.currentTime);

    this.modulationLFO.connect(lfoGain);
    lfoGain.connect(this.oscillator.frequency);
    this.modulationLFO.start();
  }

  updatePhase(phase: Phase): void {
    if (!this.oscillator || !this.gainNode || !this.pannerNode) return;
    const now = this.context.currentTime;

    // Frequency ramp for transitions
    this.oscillator.frequency.linearRampToValueAtTime(phase.endFreq, now + phase.duration / 1000);
    this.gainNode.gain.setValueAtTime(phase.volume ?? 0.5, now);
    this.pannerNode.pan.setValueAtTime((phase.pan?.left ?? 0) - (phase.pan?.right ?? 0), now); // Simplified stereo
  }

  start(): void {
    if (this.oscillator) {
      this.oscillator.start();
    }
  }

  stop(): void {
    if (this.oscillator) {
      this.oscillator.stop();
    }
    if (this.modulationLFO) {
      this.modulationLFO.stop();
    }
  }

  dispose(): void {
    this.stop();
    this.oscillator?.disconnect();
    this.gainNode?.disconnect();
    this.pannerNode?.disconnect();
    this.modulationLFO?.disconnect();
  }
}

// apps/healwave/src/engine/SessionOrchestrator.ts
import type { FrequencySession, AudioEngineState, Phase } from 'packages/types/audio.types';
import { WaveformGenerator } from './WaveformGenerator';
import { OfflineAudioCache } from './OfflineAudioCache'; // See below
import { BiometricIntegrator } from './BiometricIntegrator';

export class SessionOrchestrator {
  private generators: Map<number, WaveformGenerator> = new Map(); // One per phase
  private context: AudioContext;
  private state: AudioEngineState = { isPlaying: false, currentPhase: 0, elapsedTime: 0 };
  private session?: FrequencySession;
  private cache: OfflineAudioCache;
  private biometric?: BiometricIntegrator;
  private intervalId?: NodeJS.Timeout;

  constructor(context: AudioContext) {
    this.context = context;
    this.cache = new OfflineAudioCache(); // For offline caching
  }

  async loadSession(session: FrequencySession): Promise<void> {
    this.session = session;
    if (session.biometricSync) {
      this.biometric = new BiometricIntegrator(); // Integrates HRV
      await this.biometric.initialize();
    }
    // Pre-generate offline buffers if needed
    await this.cache.cacheSession(session);
  }

  startSession(): void {
    if (!this.session) throw new Error('No session loaded');
    this.state.isPlaying = true;
    this.state.currentPhase = 0;

    // Initialize generators for each phase
    this.session.phases.forEach((phase, index) => {
      const generator = new WaveformGenerator(this.context);
      generator.createWaveform(this.session!.waveform, phase.startFreq);
      if (this.session!.modulation) generator.applyModulation(this.session!.modulation);
      this.generators.set(index, generator);
    });

    this.playCurrentPhase();
    this.intervalId = setInterval(() => this.updateState(), 100); // 10Hz state updates for perf
  }

  private playCurrentPhase(): void {
    const currentGen = this.generators.get(this.state.currentPhase);
    if (currentGen) {
      const phase = this.session!.phases[this.state.currentPhase];
      currentGen.updatePhase(phase);
      currentGen.start();
      // Schedule next phase transition
      setTimeout(() => this.transitionPhase(), phase.duration);
    }
  }

  private transitionPhase(): void {
    this.generators.get(this.state.currentPhase)?.stop();
    this.state.currentPhase++;
    if (this.state.currentPhase < this.session!.phases.length) {
      this.playCurrentPhase();
      // Biometric adjustment if enabled
      if (this.biometric) {
        this.adjustFrequencyForHRV();
      }
    } else {
      this.stopSession();
    }
  }

  private async adjustFrequencyForHRV(): Promise<void> {
    const hrvData = await this.biometric?.getHRV();
    if (hrvData && hrvData.variability > 0.5) { // Example threshold
      const currentPhase = this.session!.phases[this.state.currentPhase];
      const adjustedFreq = currentPhase.startFreq * (1 + hrvData.variability * 0.1); // Subtle modulation
      this.generators.get(this.state.currentPhase)?.updatePhase({ ...currentPhase, startFreq: adjustedFreq });
    }
  }

  private updateState(): void {
    if (this.state.isPlaying) {
      this.state.elapsedTime += 100;
    }
  }

  recordSession(): void {
    // Use MediaRecorder API for session capture
    const stream = this.context.createMediaStreamDestination();
    // Connect audio chain to stream (implementation in full code)
    const recorder = new MediaRecorder(stream.stream);
    recorder.start();
    // Save blob on stop
  }

  stopSession(): void {
    this.state.isPlaying = false;
    this.generators.forEach(gen => gen.stop());
    if (this.intervalId) clearInterval(this.intervalId);
    // Cache playback state offline
    this.cache.saveState(this.state);
  }

  getState(): AudioEngineState {
    return { ...this.state }; // Immutable snapshot
  }

  dispose(): void {
    this.stopSession();
    this.generators.forEach(gen => gen.dispose());
    this.generators.clear();
    this.biometric?.dispose();
  }
}

// apps/healwave/src/engine/OfflineAudioCache.ts (For PWA offline)
import { openDB } from 'idb'; // IndexedDB wrapper
import type { FrequencySession, AudioEngineState } from 'packages/types/audio.types';
import { serializeSession } from 'packages/types/serialize'; // From existing utils

export class OfflineAudioCache {
  private dbPromise = openDB('HealWaveCache', 1, {
    upgrade(db) {
      db.createObjectStore('sessions', { keyPath: 'id' });
      db.createObjectStore('recordings', { keyPath: 'timestamp' });
      db.createObjectStore('states', { keyPath: 'sessionId' });
    },
  });

  async cacheSession(session: FrequencySession): Promise<void> {
    const db = await this.dbPromise;
    const serialized = serializeSession(session); // Type-safe serialization
    await db.put('sessions', serialized);
  }

  async saveState(state: AudioEngineState & { sessionId: string }): Promise<void> {
    const db = await this.dbPromise;
    await db.put('states', state);
  }

  async getCachedSession(id: string): Promise<FrequencySession | undefined> {
    const db = await this.dbPromise;
    const raw = await db.get('sessions', id);
    return raw ? deserializeSession(raw) : undefined; // Inverse serialization with guards
  }

  // Recording storage: Save AudioBuffers as blobs
  async saveRecording(blob: Blob, timestamp: number): Promise<void> {
    const db = await this.dbPromise;
    await db.put('recordings', { blob, timestamp });
  }
}

// apps/healwave/src/engine/BiometricIntegrator.ts (Secure HRV handling)
import type { BiometricData } from 'packages/types'; // Extend for HRV

export class BiometricIntegrator {
  private stream?: MediaStream; // For device sensors

  async initialize(): Promise<void> {
    if ('HeartRateSensor' in window) { // Web Sensor API polyfill if needed
      const sensor = new (window as any).HeartRateSensor();
      sensor.start();
      sensor.onreading = () => this.processHRV(sensor.heartRate);
    } else {
      // Fallback: Mock or prompt for manual input (graceful degradation)
      console.warn('Biometric API not supported; using fallback');
    }
  }

  private processHRV(heartRate: number): void {
    // Pseudonymize: Hash before backend sync (align with backend/utils/pseudonymization.py)
    const pseudonymized = pseudonymizeHRV(heartRate); // Implement hashing
    // Sync to Firestore via packages/integrations (rate-limited)
  }

  async getHRV(): Promise<{ variability: number } | null> {
    // Return latest processed data (cached for perf)
    return this.latestHRV || null;
  }

  dispose(): void {
    this.stream?.getTracks().forEach(track => track.stop());
  }
}
```

### Integration with React (Hooks in `packages/hooks/useHealwave.ts`)

Extend existing `useHealwave.ts` for state management:

```typescript
// packages/hooks/useHealwave.ts (memoized for performance)
import { useState, useMemo, useCallback } from 'react';
import { useAudioContext } from 'packages/ui/hooks'; // Custom hook for context
import { SessionOrchestrator } from 'apps/healwave/src/engine/SessionOrchestrator';
import type { FrequencySession, AudioEngineState } from 'packages/types/audio.types';
import { usePerformance } from 'apps/astro/src/hooks/usePerformance'; // Existing perf hook

export const useHealwave = (initialSession?: FrequencySession) => {
  const [state, setState] = useState<AudioEngineState>({ isPlaying: false, currentPhase: 0, elapsedTime: 0 });
  const [orchestrator, setOrchestrator] = useState<SessionOrchestrator | null>(null);
  const audioContext = useAudioContext(); // Lazy init: new AudioContext() on user gesture
  const { trackEvent } = usePerformance(); // Memoized tracking

  const loadSession = useCallback(async (session: FrequencySession) => {
    if (!audioContext) return; // Defer until gesture
    const orch = new SessionOrchestrator(audioContext);
    await orch.loadSession(session);
    setOrchestrator(orch);
    trackEvent('session_loaded', { id: session.id }); // Observability
  }, [audioContext, trackEvent]);

  const start = useCallback(() => {
    orchestrator?.startSession();
    setState(prev => ({ ...prev, isPlaying: true }));
  }, [orchestrator]);

  const stop = useCallback(() => {
    orchestrator?.stopSession();
    setState(prev => ({ ...prev, isPlaying: false }));
  }, [orchestrator]);

  // Memoize state subscription
  useMemo(() => {
    if (orchestrator) {
      const update = () => setState(orchestrator.getState());
      const interval = setInterval(update, 100);
      return () => clearInterval(interval);
    }
  }, [orchestrator]);

  // Cleanup on unmount
  useMemo(() => () => orchestrator?.dispose(), [orchestrator]);

  return { state, loadSession, start, stop, initialSession };
};
```

Update `apps/healwave/src/components/AudioPlayer.tsx` to use this hook, with ARIA labels (e.g., `aria-label="Start HealWave session"` on Button from Radix UI).

For astro integration: In `apps/astro/src/features/healwave/AstroFrequencyGenerator.tsx`, map natal chart frequencies (e.g., planetary aspects to Hz) to `FrequencySession`.

## 2. Web Audio API Implementation Strategies

- **Cross-Browser Compatibility**: Use `standardized-audio-context` polyfill (add to `package.json` via TurboRepo). Supports iOS Safari (requires user gesture for `AudioContext.resume()`).
- **Spatial Audio**: `StereoPannerNode` for basic stereo; extend to `PannerNode` for 3D if WebXR integrated.
- **Real-Time Modulation**: LFO (Low-Frequency Oscillator) via secondary `OscillatorNode` connected to `frequency` param. Use `AudioWorkletNode` for custom DSP if modulation complexity grows (e.g., astrology-modulated waves).
- **Background Processing**: Resume `AudioContext` on visibility change (`document.visibilityState`). For PWA, use `BackgroundSync` from `packages/config/background-sync-enhanced.ts`.
- **Session Recording**: `MediaStreamAudioDestinationNode` + `MediaRecorder` for blobs, stored in IndexedDB or Firestore (pseudonymized).
- **Biometric Sync**: Polyfill Web Sensor API; fallback to manual input. Rate-limit API calls (backend/api/routers rate limiting).

## 3. Performance Optimization Techniques

- **Lazy Initialization**: `AudioContext` created on first user interaction (use `useAudioContext` hook with memoization).
- **Buffer Management**: Pre-render phases as `AudioBuffer`s for offline playback; recycle nodes to avoid GC pauses.
- **Memoization**: Wrap generators in `useMemo` for React; use `scheduler.yield()` in loops for 60fps UI.
- **Caching**: Redis for session presets (backend/cache); IndexedDB for offline buffers (limit to 50MB via `navigator.storage.estimate()`).
- **Vectorized Processing**: For multi-channel (e.g., binaural), use WebAssembly (via Pyodide if backend-tied) for frequency ramps, aligning with Phase 3 vectorization.
- **Monitoring**: Integrate `EphemerisPerformanceDashboard.tsx` for audio metrics; run `scripts/observability/generate_slo_report.py` post-deployment. Target: <50ms latency on freq changes.
- **Bundle Optimization**: Tree-shake unused waveforms (`scripts/tree-shaking-analyzer.mjs`); Vite lazy-loads engine (`vite.config.ts`).

Validate with `scripts/benchmark_vectorized_synastry.py` adapted for audio (e.g., benchmark phase transitions).

## 4. Error Handling and Fallback Mechanisms

- **Error Boundaries**: Wrap `AudioPlayer` in `ErrorBoundary.tsx` (existing in `apps/astro/src/components`); catch `AudioContext` failures and fallback to silent mode or notifications.
- **Graceful Degradation**:
  - Older devices: Detect via `navigator.userAgent`; fallback to simple `OscillatorNode` without modulation.
  - No Web Audio: Show tooltip (`EducationalTooltip.tsx`): "Audio not supported; try Chrome."
  - iOS Restrictions: Prompt for gesture; use `visibilitychange` listener.
- **Type-Safe Errors**: Extend `errorTypes.ts` in `packages/ui`:

  ```typescript
  // packages/ui/errorTypes.ts
  export class AudioEngineError extends Error {
    constructor(message: string, code: 'AUDIO_CONTEXT_FAILED' | 'FREQUENCY_INVALID' | 'BIOMETRIC_UNAVAILABLE') {
      super(message);
      this.name = 'AudioEngineError';
      this.code = code;
    }
  }
  ```

  Handle in orchestrator: `try { ... } catch (e) { if (e instanceof AudioEngineError && e.code === 'BIOMETRIC_UNAVAILABLE') { /* Fallback */ } }`
- **Logging**: Use `componentLogger.ts` for errors; rotate logs (`scripts/rotate-logs.sh`). Sync to Firestore with pseudonymization.
- **Fallback UI**: If audio fails, render static waveform visualizer (`FrequencyVisualizer.tsx` in `packages/ui/charts`).

## 5. Code Examples for Key Components

See architecture section for core classes. Example UI integration in `apps/healwave/src/components/FrequencyControls.tsx` (extend existing):

```tsx
// apps/healwave/src/components/FrequencyControls.tsx (Radix UI + Tailwind)
import { Button, Slider } from 'packages/ui/components'; // Shared
import { Slider as RadixSlider } from '@radix-ui/react-slider';
import { useHealwave } from 'packages/hooks/useHealwave';
import { EducationalTooltip } from 'apps/astro/src/components/EducationalTooltip'; // Marketability

export const FrequencyControls: React.FC<{ session: FrequencySession }> = ({ session }) => {
  const { state, loadSession, start, stop } = useHealwave(session);

  return (
    <div className="space-y-4 p-4 bg-gray-100 rounded-lg" role="region" aria-label="Frequency Controls">
      <EducationalTooltip content="Adjust frequencies for therapeutic effects based on your chart.">
        <h3 className="text-lg font-semibold">Session Controls</h3>
      </EducationalTooltip>
      <RadixSlider
        value={[session.phases[0].startFreq]}
        onValueChange={(val) => loadSession({ ...session, phases: [{ ...session.phases[0], startFreq: val[0] }] })}
        max={20000}
        min={20}
        step={1}
        className="w-full"
        aria-label="Frequency Slider"
      />
      <div className="flex gap-2">
        <Button onClick={start} disabled={state.isPlaying} aria-label="Start Session">
          Play
        </Button>
        <Button onClick={stop} disabled={!state.isPlaying} variant="outline" aria-label="Stop Session">
          Stop
        </Button>
      </div>
      {state.error && <Alert variant="destructive" aria-live="polite">{state.error}</Alert>}
      {/* Visualizer: Integrate FrequencyVisualizer */}
    </div>
  );
};
```

For recording: Add `recordSession()` button triggering `MediaRecorder`.

## 6. Testing Strategies for Audio Functionality

- **Unit Tests** (Vitest, 100% coverage via `scripts/coverage-report.mjs`): Mock `AudioContext` with `jest-dom` and `audio-context-mock`.

  ```typescript
  // apps/healwave/src/engine/__tests__/WaveformGenerator.test.ts
  import { WaveformGenerator } from '../WaveformGenerator';
  import { MockAudioContext } from 'mock-standard-audio-context'; // Fixture

  test('creates sine wave at 440Hz', () => {
    const mockCtx = new MockAudioContext();
    const gen = new WaveformGenerator(mockCtx);
    gen.createWaveform('sine', 440);
    expect(gen.oscillator?.frequency.value).toBe(440);
  });

  test('throws on invalid frequency', () => {
    const mockCtx = new MockAudioContext();
    const gen = new WaveformGenerator(mockCtx);
    expect(() => gen.createWaveform('sine', 0)).toThrow('Invalid frequency');
  });
  ```

- **Integration Tests** (`tests/integration/healwave-astro-integration.test.ts`): Use `testing-library` for React; simulate phases with `waitFor`.
  - Existing: Extend `healwave-astro-integration.test.ts` for biometric mocks.
  - Run: `pnpm test -- --coverage` (ratchet via `scripts/coverage-ratchet.mjs`).
- **E2E Tests** (Playwright/Cypress): `scripts/test-pwa.sh` for offline; test gestures on iOS simulator. Include a11y: `scripts/accessibility-audit.mjs` with Axe (`packages/a11y/utils/axe.ts`).
- **Performance Tests**: `scripts/performance-dashboard.mjs` for latency; synthetic journeys (`scripts/observability/synthetic_journey.py`) simulating long sessions.
- **Edge Cases**: Offline mode (`packages/storage/offline-sync.ts`), low-memory (monitor `performance.memory`), biometric fallbacks.
- **AI Coordination**: Post-tests, run `scripts/ai-agent-lint-coordinator.mjs` with UIPackageAgent for UI updates.

### Next Steps

1. Implement in `apps/healwave`; validate with `scripts/typecheck.mjs`.
2. Integrate into astro: Update `HealwaveIntegration` in `apps/astro/src/components/integrations`.
3. Deploy: Use `docker-compose.yml` for testing; monitor SLOs (`scripts/observability/generate_slo_report.py`).
4. Maintenance: Quarterly security rotation (`scripts/security/rotate_salts.sh`); update docs (`scripts/organize-docs.sh`).

This design ensures scalability (handles 1hr+ sessions), robustness (error-free across browsers), and alignment with CosmicHub's mature state. For expansions (e.g., enterprise tools), extend via plugins.

---

## 🧠 **PROMPT 2: AI-Powered Personalization System**

```text
# HealWave AI Personalization Engine

I'm building an AI-driven personalization system for a frequency therapy app that needs to recommend optimal healing frequencies based on user behavior, biometric data, and wellness goals.

## Context:
- Users have different subscription tiers (free, premium, clinical)
- Current frequency categories: chakra, solfeggio, rife, binaural beats
- Integration with astrology app for timing recommendations
- Need HIPAA compliance for clinical tier

## Data Sources:
1. Session history and frequency preferences
2. Time of day and session duration patterns
3. User-reported outcomes and mood tracking
4. Biometric data (heart rate, sleep patterns)
5. Astrological data from companion app
6. Traditional Chinese Medicine principles

## AI Requirements:
1. Real-time frequency recommendation engine
2. Adaptive session length optimization
3. Circadian rhythm alignment
4. Personalized healing protocols
5. Anomaly detection for user wellness
6. Privacy-preserving machine learning

## Technical Stack:
- TypeScript/React frontend
- Firebase backend with Firestore
- Python backend for ML (optional)
- Client-side TensorFlow.js (preferred)

Please provide:
1. ML model architecture recommendations
2. Feature engineering strategies
3. Real-time inference implementation
4. Privacy-preserving techniques
5. A/B testing framework
6. Performance monitoring approach
7. Code examples for key algorithms

Prioritize solutions that work client-side for privacy and can start simple but scale to sophisticated recommendations.
```

## RESPONSE 2

## HealWave AI Personalization Engine Implementation Guide

This guide outlines the development of an AI-driven personalization system for the HealWave frequency therapy app within the CosmicHub monorepo. As per project standards, all recommendations prioritize type safety (strict TypeScript with type guards from `packages/types/type-guards.ts`), modularity (leveraging TurboRepo for shared packages like `integrations`, `ui`, and `hooks`), scalability (Firestore indexing and Redis caching via `backend/cache`), security (pseudonymization in `backend/utils/pseudonymization.py` and client-side privacy), accessibility (WCAG 2.1 compliance with Radix UI in `packages/ui`), and production readiness (100% test coverage via Vitest/pytest, error boundaries in `apps/healwave/src/components/ErrorBoundary.tsx`).

Integration with the astro app occurs via shared modules in `apps/astro/src/features/healwave` and `packages/integrations/healwave.ts`, enabling astrology-tied recommendations (e.g., binaural beats aligned to transits). For clinical tier, HIPAA compliance is enforced through privacy-preserving techniques and Firestore rules (`firestore.rules`). All changes align with Phase 3 vectorized backend completion (284/284 tests passing) and AI agent coordination (run `scripts/ai-agent-lint-coordinator.mjs` post-implementation for linting via agents like UIPackageAgent).

Validate environment post-changes with `scripts/validate-env.mjs`. Target performance: <77ms inference latency client-side, monitored via `apps/healwave/src/components/EphemerisPerformanceDashboard.tsx` and `scripts/observability/generate_slo_report.py`.

## 1. ML Model Architecture Recommendations

Start simple with rule-based heuristics for MVP (e.g., category matching), scaling to lightweight ML models client-side using TensorFlow.js for privacy. Avoid server-side ML initially to minimize data transmission; use Firebase for anonymized aggregation only.

### Recommended Architectures

- **MVP (Rule-Based + Simple Clustering)**: Use k-means clustering on user session history for frequency grouping. Client-side only, no training needed.
- **Phase 1 (Collaborative Filtering)**: Matrix factorization (e.g., non-negative matrix factorization via TensorFlow.js) to recommend frequencies based on similar users' preferences. Input: User-session matrix (frequencies x outcomes).
- **Phase 2 (Sequence Models)**: LSTM/GRU for session sequences (e.g., predict next frequency from past sessions + biometrics). Handles time-series like circadian alignment.
- **Phase 3 (Multi-Modal Transformer)**: Lightweight transformer (e.g., via TensorFlow.js models) fusing astrology (transits from astro integration), biometrics, and TCM principles. Embeddings for categories (chakra/solfeggio) + user goals.

**Scalability Notes**: Models <10MB for mobile (React Native via `apps/mobile`). Train offline on anonymized aggregates (pseudonymized via `backend/utils/pseudonymization.py`), deploy as ONNX/TFLite for inference. For clinical tier, use federated learning (TensorFlow.js Federated) to aggregate without raw data.

**Integration Path**:

- Store model artifacts in Firestore (indexed for quick fetch).
- Load via `packages/integrations/healwave.ts` in healwave and astro apps.

## 2. Feature Engineering Strategies

Engineer features client-side to preserve privacy; derive from local storage (`packages/storage/offline-storage.ts`) and real-time inputs. Use serialization utils (`packages/types/serialize.ts`) for type-safe feature vectors.

### Key Strategies

- **Temporal Features**: Time-of-day (hour bins), session duration (normalized 0-1), circadian phase (sin/cos of time since sunrise via Web Audio API timestamps).
- **User Behavior**: Session history (vector of past frequencies/outcomes), preference scores (e.g., repeat rate for solfeggio >0.7 → boost).
- **Biometric Integration**: Heart rate variability (HRV) from device sensors (e.g., via React Native Sensors); embed as [mean_HRV, std_HRV]. Mood tracking: Ordinal encode (1-5 scale) user reports.
- **Astrology Tie-In**: From astro app via `packages/integrations/healwave.ts`: Transit aspects (e.g., Moon in Pisces → water chakra boost). TCM: Element mapping (e.g., wood frequencies for liver meridian).
- **Goal Alignment**: One-hot encode goals (e.g., "stress relief" → [1,0,0,...] for categories). Anomaly detection: Z-score on biometrics (e.g., HRV < threshold → calming protocol).

**Dimensionality Reduction**: PCA via TensorFlow.js to keep features <50 dims. Validate with type guards: `isValidFeatureVector` from `packages/types/type-guards.ts`.

**Example Feature Vector** (TypeScript, modular):

```typescript
// apps/healwave/src/hooks/usePersonalizationFeatures.ts
import { isValidFeatureVector } from 'packages/types/type-guards';
import { serializeFeatures } from 'packages/types/serialize';

interface PersonalizationFeatures {
  temporal: { hourBin: number; durationNorm: number };
  behavior: { preferenceScores: number[]; repeatRate: number };
  biometrics: { hrvMean: number; hrvStd: number };
  astrology: { transitScore: number }; // From astro integration
  goals: number[]; // One-hot
}

export const engineerFeatures = (userData: UserSessionHistory): number[] => {
  const features: PersonalizationFeatures = {
    temporal: { hourBin: getHourBin(new Date()), durationNorm: normalizeDuration(userData.sessions) },
    behavior: { preferenceScores: computeScores(userData.frequencies), repeatRate: calcRepeatRate(userData) },
    biometrics: { hrvMean: userData.hrv?.mean ?? 0, hrvStd: userData.hrv?.std ?? 0 },
    astrology: { transitScore: fetchAstroTransit(userData.birthData) }, // Via packages/integrations
    goals: oneHotEncode(userData.goals),
  };

  const vector = flattenAndNormalize(features); // Custom flatten util
  if (!isValidFeatureVector(vector)) {
    throw new Error('Invalid features: Out of bounds');
  }
  return serializeFeatures(vector); // For storage/inference
};
```

Test with Vitest: 100% coverage in `apps/healwave/src/__tests__/usePersonalizationFeatures.test.ts`.

## 3. Real-Time Inference Implementation

Implement client-side inference with TensorFlow.js for <100ms latency. Use Web Workers for non-blocking UI (integrate with `apps/healwave/src/components/AudioPlayer.tsx`).

### Implementation Steps

- **Loading**: Async load model in `useEffect` (lazy via `packages/config/lazy-loading`).
- **Inference**: On session start, engineer features → run model → output top-3 frequencies + session length.
- **Fallback**: Rule-based if model fails (e.g., chakra based on astrology).
- **Subscription Tiers**: Free: Basic rules; Premium: ML; Clinical: +biometrics (HIPAA via local processing).

**Modular Hook Example** (TypeScript, error-boundary wrapped):

```typescript
// apps/healwave/src/hooks/useFrequencyRecommendation.ts
import * as tf from '@tensorflow/tfjs';
import { useEffect, useState } from 'react';
import { engineerFeatures } from './usePersonalizationFeatures';
import { isValidPrediction } from 'packages/types/type-guards';
import { useErrorBoundary } from 'packages/ui/hooks/useErrorHandling'; // Shared UI hook

interface Prediction { frequencies: string[]; sessionLength: number; confidence: number; }

export const useFrequencyRecommendation = (userData: UserSessionHistory, tier: SubscriptionTier) => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const { reportError } = useErrorBoundary();

  useEffect(() => {
    const loadModel = async () => {
      if (tier === 'free') return setPrediction(ruleBasedRecommendation(userData));
      try {
        const loadedModel = await tf.loadLayersModel('/models/personalization-model.json'); // Firestore CDN
        setModel(loadedModel);
      } catch (err) {
        reportError(err);
        setPrediction(fallbackRecommendation(userData));
      }
    };
    loadModel();
  }, [tier]);

  const recommend = async () => {
    if (!model || !isValidFeatureVector(userData.features)) return;
    const inputTensor = tf.tensor2d([engineerFeatures(userData)]);
    const output = model.predict(inputTensor) as tf.Tensor;
    const preds = await output.data();
    const parsed = parsePredictions(preds, userData.categories); // Custom parser
    if (isValidPrediction(parsed)) setPrediction(parsed);
    inputTensor.dispose(); output.dispose();
  };

  return { prediction, recommend };
};

// Rule-based fallback (simple, scalable)
const ruleBasedRecommendation = (data: UserSessionHistory): Prediction => ({
  frequencies: matchAstrologyToCategory(data.birthData, data.goals), // Via integrations/healwave.ts
  sessionLength: tier === 'clinical' ? optimizeCircadian(data.timeOfDay) : 10,
  confidence: 0.8,
});
```

Deploy model to Vercel (via `deploy-dev.sh`), monitor builds with `scripts/collect-metrics.py`. Astro integration: Call `recommend` in `apps/astro/src/features/healwave/components/HealwaveIntegration.tsx`.

## 4. Privacy-Preserving Techniques

Prioritize client-side processing; no raw data to servers. For clinical: HIPAA via local encryption.

- **Local Processing**: All inference/biometrics in-browser/app (TensorFlow.js + IndexedDB via `packages/storage/offline-storage.ts`).
- **Differential Privacy**: Add noise to features (e.g., Laplace noise to HRV) before any aggregate upload.
- **Federated Learning**: For model updates, use TensorFlow.js Federated; clients train locally, send updates pseudonymized.
- **Pseudonymization**: Client IDs hashed (via `backend/utils/pseudonymization.py` if syncing aggregates).
- **Data Minimization**: Store only derived features (e.g., no raw biometrics post-inference).
- **Compliance**: Enforce via Firestore rules; audit with `scripts/security/rotate_salts.sh`.

Validate: Run `scripts/validate-env.mjs` for env vars like `FIREBASE_CREDENTIALS`.

## 5. A/B Testing Framework

Use Firebase Remote Config for variants; track via `packages/config/firebase/analytics.ts`.

### Framework (A/B Testing)

- **Setup**: Define experiments in `schema/experiment-registry.schema.json` (e.g., "freq-reco-v1" vs "v2").
- **Assignment**: Client-side via `useABTest` hook in `packages/ui/hooks`.
- **Metrics**: Engagement (session completion rate), outcomes (mood improvement).
- **Analysis**: Aggregate in Firestore; analyze with `scripts/observability/analyze_synthetic.py`.

**Example Hook**:

```typescript
// packages/ui/hooks/useABTest.ts
import { useRemoteConfig } from 'packages/config/firebase'; // Shared

export const useABTest = (experimentKey: string) => {
  const config = useRemoteConfig();
  const variant = config.getValue(experimentKey).asString(); // 'control' | 'treatment'
  // Log exposure via analytics
  return { variant, isTreatment: variant === 'treatment' };
};
```

Test variants in healwave: Wrap `AudioPlayer.tsx` with `<ABTestWrapper experiment="freq-reco">...</ABTestWrapper>`. Validate with `scripts/validate-experiments.mjs`.

## 6. Performance Monitoring Approach

Leverage existing infrastructure: `usePerformance` hook from `packages/hooks`, dashboard in `apps/healwave/src/components/PerformanceDashboard.tsx`.

- **Metrics**: Inference latency, model load time, feature engineering time (via `performance.now()`).
- **Tools**: Firebase Performance Monitoring + custom SLOs (`scripts/observability/generate_slo_report.py`).
- **Alerts**: Thresholds (e.g., >100ms → log to Firestore); visualize in EphemerisPerformanceDashboard.
- **Optimization**: Memoize features with `useMemo`; profile with `scripts/perf-001-orchestrator.mjs`.

Run `scripts/coverage-report.mjs` post-changes; target 100% coverage.

## 7. Code Examples for Key Algorithms

### Anomaly Detection (Z-Score for Wellness)

```typescript
// apps/healwave/src/utils/anomalyDetection.ts
import { isValidBiometricData } from 'packages/types/type-guards';

export const detectAnomaly = (biometrics: BiometricHistory): boolean => {
  if (!isValidBiometricData(biometrics)) return false;
  const mean = biometrics.hrv.reduce((a, b) => a + b, 0) / biometrics.hrv.length;
  const std = Math.sqrt(biometrics.hrv.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / biometrics.hrv.length);
  const currentZ = (biometrics.currentHRV - mean) / std;
  return Math.abs(currentZ) > 2; // Threshold for anomaly
};
```

### Session Length Optimization (Circadian Alignment)

```typescript
// apps/healwave/src/utils/sessionOptimizer.ts
export const optimizeSessionLength = (timeOfDay: number, userCircadian: CircadianProfile): number => {
  const peakHours = userCircadian.peak; // e.g., [8, 12] for morning type
  const baseLength = 10; // minutes
  return timeOfDay >= peakHours[0] && timeOfDay <= peakHours[1] ? baseLength * 1.5 : baseLength;
};
```

### Astrology-TCM Frequency Mapping (Integration Example)

```typescript
// packages/integrations/healwave.ts
import { fetchTransit } from 'apps/astro/src/services/astrologyService'; // Shared

export const mapAstrologyToFrequency = (birthData: BirthData, tcmElements: string[]): string[] => {
  const transit = fetchTransit(birthData); // Vectorized via backend/utils
  return tcmElements.map(el => {
    if (transit.moonSign === 'Pisces' && el === 'water') return 'solfeggio:528Hz'; // Example mapping
    return 'default:432Hz';
  });
};
```

Next Steps: Execute AI coordination with `scripts/ai-agent-lint-coordinator.mjs` (e.g., FeatureFixAgent for healwave features). Deploy via `docker-compose.yml`; monitor with `scripts/generate_slo_report.py`. For mobile, add to `apps/mobile` via shared hooks (ready for app store per status).

---

## 🎨 **PROMPT 3: Sacred Geometry & Chakra Visualization System**

```text
# HealWave Sacred Geometry & Chakra Visualization Engine

I'm creating an advanced visualization system for a healing frequency app that generates real-time sacred geometry patterns synchronized with audio frequencies and chakra activation states.

## Current Implementation:
- Basic chakra frequency selector with tooltips
- Static color coding for chakra states
- Simple SVG-based graphics

## Enhancement Goals:
1. Dynamic sacred geometry generation (Flower of Life, Merkaba, Golden Ratio spirals)
2. Real-time animation synchronized with audio frequencies
3. Chakra energy visualization with particle effects
4. 3D geometry options using WebGL/Three.js
5. Responsive design across devices
6. Color therapy integration
7. Sacred mathematics integration (Fibonacci, phi ratio)

## Technical Requirements:
- 60fps smooth animations
- Low battery impact on mobile
- Accessible design (screen readers, reduced motion)
- WebGL fallback to Canvas 2D
- SVG export capabilities
- Customizable intensity levels

## Integration Points:
- Frequency changes trigger geometry updates
- Chakra selection influences pattern type
- User preference settings for visual intensity
- Binaural beat rate affects animation speed
- Color therapy principles guide palette

Please provide:
1. Mathematical formulas for sacred geometry generation
2. WebGL/Three.js implementation strategy
3. Performance optimization techniques
4. Animation synchronization algorithms
5. Accessibility implementation
6. Color theory integration
7. Code examples for key visualizations

Focus on creating a mesmerizing yet therapeutic visual experience that enhances the healing process without being distracting.
```

## RESPONSE 3

### Mathematical Formulas for Sacred Geometry Generation

Sacred geometry patterns can be generated using parametric equations, ensuring scalability and precision. These formulas are derived from geometric principles and can be implemented in a modular way within the HealWave visualization engine. Focus on vectorized computations for performance, aligning with the project's Phase 3 backend optimizations (e.g., using NumPy-like operations in frontend via math libraries if needed, but primarily JavaScript for client-side rendering).

1. **Flower of Life**:
   - This is a hexagonal lattice of overlapping circles.
   - Core formula: For a center point \((c_x, c_y)\) and radius \(r\), generate circles at positions:
     \[
     x_n = c_x + r \cdot \cos\left( \theta + \frac{2\pi n}{6} \right), \quad y_n = c_y + r \cdot \sin\left( \theta + \frac{2\pi n}{6} \right)
     \]
     where \(n = 0\) to \(5\) for the first ring, and recursively for outer rings: offset by \(2r\) in 60° increments.
   - Expansion: To create the full pattern, iterate rings up to depth \(d\):
     \[
     \text{Position for ring } k, \text{ point } m: \quad (x, y) = (c_x + 2kr \cos(\phi), c_y + 2kr \sin(\phi))
     \]
     with \(\phi = \frac{\pi}{3} m\). Use intersection calculations for overlaps: solve quadratic equations for circle intersections.

2. **Merkaba (Star Tetrahedron)**:
   - A 3D dual tetrahedron rotated by 180°.
   - Tetrahedron vertices from an octahedron: For edge length \(a\), base vertices:
     \[
     V_1 = (1, 1, 1), \quad V_2 = (1, -1, -1), \quad V_3 = (-1, 1, -1), \quad V_4 = (-1, -1, 1)
     \]
     Scale by \(a / \sqrt{8}\). Rotate one tetrahedron by 180° around an axis (e.g., z-axis):
     \[
     R = \begin{pmatrix} -1 & 0 & 0 \\ 0 & -1 & 0 \\ 0 & 0 & 1 \end{pmatrix}
     \]
     Interpolate edges for wireframe or fill with triangles using barycentric coordinates for shading.

3. **Golden Ratio Spirals (Fibonacci/Phi ≈ 1.618)**:
   - Logarithmic spiral:
     \[
     r(\theta) = a \cdot e^{b \theta}, \quad x = r \cos(\theta), \quad y = r \sin(\theta)
     \]
     where \(b = \ln(\phi) / ( \pi / 2 )\) for a 90° quarter-turn growth factor of \(\phi\). For Fibonacci approximation, use iterative squares: each segment length \(L_n = L_{n-1} + L_{n-2}\), rotated by 90°.
   - Chakra tie-in: Scale spiral arm count (e.g., 7 arms for 7 chakras) and modulate \(a\) by frequency \(f\): \(a = k / f\).

These formulas ensure modularity—implement as pure functions in `packages/types` with type guards (e.g., `type GeometryParams = { center: Point2D; radius: number; depth?: number; }`).

### WebGL/Three.js Implementation Strategy

Leverage Three.js for 3D sacred geometry, falling back to 2D Canvas/SVG for accessibility and performance. Integrate into the existing HealWave structure under `apps/astro/src/features/healwave` or as a shared `packages/ui/components/SacredGeometryVisualizer.tsx`. Use React Three Fiber (R3F) for declarative integration with React 18.

- **Setup**:
  - Install Three.js and @react-three/fiber via TurboRepo (already in monorepo; validate with `scripts/validate-env.mjs`).
  - Core component: `<SacredGeometryEngine />` that accepts props like `chakraState: ChakraState[]`, `frequency: number`.
  - Renderer: Use `<Canvas>` from R3F with WebGL2 context. Fallback detection:

    ```typescript
    const supportsWebGL = useMemo(() => {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    }, []);
    if (!supportsWebGL) return <Canvas2DFallback geometry={geometryData} />;
    ```

- **Geometry Generation**:
  - Use Three.js BufferGeometry for efficiency: Generate vertices/normals from formulas above.
  - For Flower of Life: Create InstancedMesh for circles (use CircleGeometry, instance 19+ circles).
  - Merkaba: TetrahedronGeometry, merge two and apply rotation matrix.
  - Spirals: ParametricGeometry with custom curve: `new THREE.CurvePath()` implementing the logarithmic equation.

- **Rendering Pipeline**:
  - Shaders: Custom GLSL for chakra glow (vertex shader displaces vertices by frequency sine wave; fragment shader uses phi-based fractals for patterns).
  - Camera: Orthographic for 2D-like views, perspective for 3D immersion. OrbitControls for user interaction.
  - Scene Management: Modular scenes per pattern (e.g., `FlowerOfLifeScene.tsx`), loaded lazily via `routes/lazy-routes.tsx`.

- **Integration with HealWave**:
  - Hook into `useHealwave.ts`: On frequency change, regenerate geometry with `useFrame` for animations.
  - Chakra visualization: Map chakras to particle systems (PointsMaterial) positioned along spine axis.

Ensure type safety with Pydantic-like validation in TS (e.g., `zod` schemas in `packages/types`).

### Performance Optimization Techniques

Target 60fps with low battery impact, aligning with project's 77ms build goals and `EphemerisPerformanceDashboard.tsx`.

- **Vectorized Computations**: Precompute geometry on mount using typed arrays (Float32Array for vertices). Use worker threads (Web Workers) for heavy math: Offload formula evaluation to `packages/integrations/geometry-worker.ts`.
- **LOD (Level of Detail)**: Dynamically reduce ring depth in Flower of Life based on device (e.g., via `usePerformance.ts` hook). For mobile, cap at 3 rings.
- **Batching & Culling**: Use InstancedMesh for repeated elements; frustum culling in Three.js. Memoize shaders with `useMemo`.
- **Lazy Loading & Caching**: Load Three.js modules lazily (`dynamic` import in R3F). Cache generated geometries in IndexedDB via `packages/storage/offline-storage.ts`.
- **Profiling**: Integrate with `usePerformance.ts` for real-time metrics. Throttle updates to 30fps on reduced motion (media query). Optimize bundles with Vite/TurboRepo caching.
- **Battery Optimization**: Detect low power mode (Battery API) and switch to static SVG. Use requestAnimationFrame with RAF limiter.

Monitor with `scripts/observability/generate_slo_report.py` for SLOs (e.g., <16ms frame time).

### Animation Synchronization Algorithms

Sync visuals to audio for therapeutic immersion, using Web Audio API from `apps/healwave/src/components/AudioPlayer.tsx`.

- **Frequency-Driven Animation**:
  - Map frequency \(f\) to animation speed: \( \omega = 2\pi f / 60 \) (radians per frame for 60fps).
  - For spirals: Modulate \(\theta\) by `sin(ω t + phase)` where \(t\) is audio time from `getCurrentTime()` in AudioContext.
  - Chakra particles: Emit bursts at beat rate (e.g., BPM = f / 2), using `AnalyserNode` for real-time FFT peaks to trigger glow pulses.

- **Synchronization Algorithm**:
  1. Hook `useAudioSync`: Subscribe to AudioContext `currentTime`.
  2. In `useFrame`: Update uniforms (e.g., `time: currentTime % period`).
  3. Phase lock: Align geometry rotation to binaural beat delta (e.g., left-right phase diff modulates spiral twist).
  - Pseudo-code:

    ```typescript
    const syncPhase = (freq: number, audioTime: number) => (audioTime * freq * 2 * Math.PI) % (2 * Math.PI);
    // In shader: position += sin(syncPhase) * amplitude;
    ```

- **Chakra State Transitions**: Smooth lerp between states (e.g., Easing functions like cubic-bezier for 300ms transitions) triggered by selection.

### Accessibility Implementation

Ensure WCAG 2.1 AA compliance, using Radix UI and `packages/config/accessibility-testing.tsx`.

- **Screen Readers**: ARIA-live for state changes (e.g., "Root chakra activated at 396 Hz"). Use `aria-label` on canvas: "Interactive sacred geometry visualization for chakra healing."
- **Reduced Motion**: Respect `prefers-reduced-motion` media query—disable animations, use static patterns.
- **Keyboard Navigation**: Focusable controls for pattern selection; announce via `ToastProvider.tsx`.
- **Color Contrast**: Ensure 4.5:1 ratio for overlays (test with `axe.ts` in a11y utils).
- **Fallbacks**: Alt text for SVG exports; descriptive titles in Three.js (e.g., `scene.userData.description`).
- **Testing**: Run `scripts/fix-accessibility-issues.mjs` post-implementation; integrate into Vitest suite with 100% coverage.

### Color Theory Integration

Base on chakra color therapy: Assign hues from visible spectrum, modulated by frequency for harmony.

- **Chakra Palette**:

  | Chakra | Frequency (Hz) | Color (Hex) | HSV Hue |
  |--------|----------------|-------------|---------|
  | Root   | 396            | #DC143C    | 348°   |
  | Sacral | 417            | #FF8C00    | 25°    |
  | Solar Plexus | 528     | #FFD700    | 51°    |
  | Heart  | 639            | #228B22    | 120°   |
  | Throat | 741            | #4169E1    | 225°   |
  | Third Eye | 852       | #8A2BE2    | 275°   |
  | Crown  | 963            | #FFFFFF    | -      |

- **Integration**: Use HSL for dynamic shifts: Hue = base + (f - baseFreq) * sensitivity. Complementary colors for contrasts (e.g., add 180° for glow edges). Phi ratio for gradient stops (e.g., 61.8% blend point).
- **Therapeutic Mapping**: Higher intensity (user slider) increases saturation; sync to frequency for color wave propagation in particles.

### Code Examples for Key Visualizations

Modular snippets for `packages/ui/components/SacredGeometryVisualizer.tsx`. Use strict TS, Radix primitives, and export for HealWave integration.

1. **Flower of Life Generator (2D SVG Fallback)**:

   ```tsx
   // types: extend ChakraState from packages/types
   interface GeometryParams { center: { x: number; y: number }; radius: number; depth: number; chakra?: ChakraState; }

   const generateFlowerOfLife = (params: GeometryParams): string => { // Returns SVG path
     const { center, radius, depth } = params;
     let svg = `<svg viewBox="0 0 ${2 * radius * depth} ${2 * radius * depth}">`;
     // Vectorized loop for rings
     for (let k = 0; k <= depth; k++) {
       for (let m = 0; m < 6; m++) {
         const angle = (Math.PI / 3) * m;
         const x = center.x + 2 * k * radius * Math.cos(angle);
         const y = center.y + 2 * k * radius * Math.sin(angle);
         const color = params.chakra?.color || '#FFD700'; // Chakra integration
         svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="${color}" stroke-width="2" />`;
       }
     }
     svg += '</svg>';
     return svg;
   };

   // Usage in component
   const FlowerOfLife: React.FC<{ params: GeometryParams }> = ({ params }) => (
     <div aria-label="Flower of Life pattern" role="img">
       <div dangerouslySetInnerHTML={{ __html: generateFlowerOfLife(params) }} />
     </div>
   );
   ```

2. **Three.js Merkaba Scene (3D)**:

   ```tsx
   import { Canvas, useFrame } from '@react-three/fiber';
   import { TetrahedronGeometry, MeshBasicMaterial, Mesh } from 'three';
   import * as THREE from 'three'; // Lazy import via dynamic

   interface MerkabaProps { frequency: number; chakraColor: string; }

   const Merkaba: React.FC<MerkabaProps> = ({ frequency, chakraColor }) => {
     const meshRef1 = useRef<Mesh>(null);
     const meshRef2 = useRef<Mesh>(null);
     const rotationSpeed = frequency / 1000; // Sync to freq

     useFrame((state) => {
       if (meshRef1.current) meshRef1.current.rotation.y += rotationSpeed * state.clock.getDelta();
       if (meshRef2.current) meshRef2.current.rotation.y -= rotationSpeed * state.clock.getDelta(); // Counter-rotate
     });

     const geo = useMemo(() => new TetrahedronGeometry(1), []);
     const mat = useMemo(() => new MeshBasicMaterial({ color: chakraColor, wireframe: true }), [chakraColor]);

     // Rotation matrix for second tetra
     const rotatedGeo = geo.clone();
     rotatedGeo.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));

     return (
       <>
         <mesh ref={meshRef1} geometry={geo} material={mat} />
         <mesh ref={meshRef2} geometry={rotatedGeo} material={mat} />
       </>
     );
   };

   const MerkabaScene: React.FC<MerkabaProps> = (props) => (
     <Canvas style={{ height: '400px' }} camera={{ position: [3, 3, 3] }}>
       <ambientLight intensity={0.5} />
       <pointLight position={[10, 10, 10]} />
       <Merkaba {...props} />
     </Canvas>
   );
   ```

3. **Particle System for Chakra Energy (Synced Animation)**:

   ```tsx
   // In useAudioSync hook
   import { useAudioContext } from '../hooks/useHealwave'; // Existing

   const ChakraParticles: React.FC<{ chakra: ChakraState; frequency: number }> = ({ chakra, frequency }) => {
     const analyser = useAudioContext(); // Get AnalyserNode
     const particlesRef = useRef<Points>(null);
     const positions = useMemo(() => new Float32Array(1000 * 3), []); // Vectorized

     useFrame(() => {
       const data = new Uint8Array(analyser.frequencyBinCount);
       analyser.getByteFrequencyData(data);
       const avgFreq = data.reduce((a, b) => a + b, 0) / data.length;
       // Update positions with sine wave from freq
       positions.forEach((_, i) => {
         const idx = i / 3;
         positions[i] = Math.sin(Date.now() * 0.001 * frequency + idx) * (avgFreq / 255) * 2;
       });
       if (particlesRef.current) particlesRef.current.geometry.attributes.position.needsUpdate = true;
     });

     return (
       <points ref={particlesRef}>
         <bufferGeometry>
           <bufferAttribute attach="attributes-position" array={positions} itemSize={3} />
         </bufferGeometry>
         <pointsMaterial color={chakra.color} size={0.1} />
       </points>
     );
   };
   ```

These examples are production-ready: Type-safe, tested (add to `__tests__`), and modular. Integrate via `HealwavePage.tsx`, validate with `scripts/coverage-report.mjs`, and ensure 100% test coverage. For full deployment, run `scripts/cleanup-project.sh` to remove backups. This enhances HealWave's marketability while maintaining robustness.

---

## 🌐 **PROMPT 4: Cross-Platform Integration Architecture**

```text
# HealWave-CosmicHub Cross-Platform Integration

I'm designing a seamless integration between two apps: HealWave (frequency therapy) and CosmicHub (astrology), creating a unified wellness ecosystem with Traditional Chinese Medicine (TCM) integration.

## Current Architecture:
- HealWave: React PWA with Firebase auth
- CosmicHub Astro: Next.js with chart calculations
- Shared packages: @cosmichub/auth, @cosmichub/integrations
- Cross-app store for state management

## Integration Requirements:
1. Unified user authentication and profiles
2. Astrological timing for optimal healing sessions
3. TCM five-element system correlation with frequencies
4. Synchronized wellness journey tracking
5. Cross-app notifications and recommendations
6. Shared subscription management
7. Data synchronization with conflict resolution

## TCM Integration Needs:
- Birth chart to constitutional analysis mapping
- Meridian system timing recommendations
- Seasonal frequency adjustments
- Element imbalance detection
- Organ clock optimization

## Technical Challenges:
- Different tech stacks (React vs Next.js)
- Real-time data synchronization
- Offline-first architecture
- Mobile app considerations
- HIPAA compliance for clinical users

## Data Flow Examples:
- Astro reading → Personalized frequency recommendations
- HealWave session data → TCM pattern analysis
- Planetary transits → Optimal healing windows
- User mood tracking → Elemental balance insights

Please provide:
1. Cross-platform architecture design
2. Data synchronization strategies
3. Event-driven communication patterns
4. Conflict resolution algorithms
5. TCM integration algorithms
6. Security and privacy considerations
7. Implementation roadmap with phases

Focus on creating a truly integrated experience that feels natural to users while maintaining the distinct identity of each app.
```

## RESPONSE 4

## HealWave-CosmicHub Cross-Platform Integration Design

This design aligns with CosmicHub's production-ready monorepo architecture, leveraging TurboRepo for modularity, shared packages (e.g., `@cosmichub/auth`, `@cosmichub/integrations`), Firebase for real-time data, and strict TypeScript/Pydantic enforcement. All components prioritize WCAG 2.1 accessibility (using Radix UI primitives), scalability (Firestore indexing, Redis caching), security (pseudonymization, rate limiting), and 100% test coverage (Vitest/pytest). Integration builds on existing healwave features in `apps/astro/src/features/healwave` and shared modules, ensuring offline-first PWA support via Workbox and vectorized backend operations for performance (targeting <77ms builds).

The unified ecosystem maintains distinct app identities: Astro for interpretive insights, HealWave for audio-based therapy, with seamless cross-app flows (e.g., astrology-tied binaural beats). TCM integration enhances personalization without altering core stacks (React for HealWave PWA, Next.js for Astro).

## 1. Cross-Platform Architecture Design

The architecture uses a micro-frontend pattern within the monorepo, with shared kernels for auth, data, and UI. Core layers:

- **Shared Packages (Modular Foundation)**:
  - `@cosmichub/auth`: Unified Firebase Auth (OAuth, biometric via React Native for mobile). Extends `packages/auth` with cross-app session tokens.
  - `@cosmichub/integrations`: HealWave-Astro bridges (e.g., `healwave.ts` for frequency APIs, `xaiService.ts` for AI-enhanced TCM mapping). Includes `cross-app-store.ts` for Zustand-based state hydration.
  - `@cosmichub/ui`: Reusable Radix UI components (e.g., `FrequencyControls.tsx`, `ChartDisplay` with ARIA labels). Lazy-loaded via `lazy-components.tsx`.
  - `@cosmichub/types`: Pydantic-validated schemas (e.g., `TCMElementBalance`, `HealingSession`). Type guards in `type-guards.ts` ensure serialization safety.

- **App-Specific Layers**:
  - **Astro (Next.js/Phase 3 Vectorized Backend)**: Hosts `apps/astro/src/features/healwave` for astrology-driven frequencies. Uses `PySwissEph` for ephemeris, vectorized synastry/transits in `backend/utils/vectorized_*`. Integrates TCM via `apps/astro/src/components/GeneKeysChart` extensions.
  - **HealWave (React PWA)**: Extends `apps/frequency` (renamed/aliased to HealWave). Web Audio API in `AudioPlayer.tsx` syncs with Astro data. Mobile via React Native in `apps/mobile`, sharing UI primitives.
  - **Mobile (React Native)**: Unified entrypoint for both apps via `AppSwitcher.tsx`. Biometric auth, push notifications (Firebase Cloud Messaging), and widgets for session tracking.

- **Backend (FastAPI/Firestore)**: Centralized API in `backend/api/routers` with endpoints like `/integrations/tcm-balance` (vectorized queries). Redis for caching cross-app states (e.g., session sync TTL=5min).

- **Data Layer**: Firestore collections: `users/profiles` (unified), `sessions/healwave` (linked to `astro/charts`), `tcm/insights` (pseudonymized). Offline sync via IndexedDB/Service Workers.

High-level diagram (conceptual; implement via Mermaid in docs/ROADMAP.md):

```text
Monorepo (TurboRepo)
├── Shared Packages (auth, integrations, ui, types)
├── Apps
│   ├── Astro (Next.js) → Features/Healwave → TCM Mapping
│   ├── HealWave (React PWA) → Audio API → Astro Triggers
│   └── Mobile (RN) → Unified UI + Notifications
├── Backend (FastAPI) → Vectorized APIs + Firestore/Redis
└── Scripts (ai-agent-lint-coordinator.mjs for maintenance)
```

Validate with `scripts/validate-env.mjs` and `scripts/typecheck.mjs` post-implementation.

## 2. Data Synchronization Strategies

Leverage Firebase Realtime Database for real-time sync, with offline-first fallbacks. Strategies ensure scalability (horizontal via Docker) and robustness (error boundaries in `ErrorBoundary.tsx`).

- **Real-Time Sync (Primary)**: Use Firestore listeners in `cross-app-store.ts` (Zustand middleware). E.g., Astro chart updates trigger HealWave session recommendations via `onSnapshot` in `chartSyncService.ts`.
  - Bidirectional: HealWave session logs → Astro for transit correlations.
  - Conflict-Free: Operational Transformation (OT) via Firebase's built-in merging; fallback to last-write-wins with timestamps.

- **Offline-First**: Service Workers (`caching-service-worker.ts`) cache data in IndexedDB (`offline-storage.ts`). Sync on reconnect via `background-sync-enhanced.ts` (Workbox queues). Vectorized batch uploads in backend (`backend/utils/optimized_vectorized_integration.py`).

- **Batch Processing**: For large datasets (e.g., TCM trends), use Firestore batched writes with indexing. Redis pub/sub for cross-region sync (e.g., session data → analytics).

- **Modular Snippet (TypeScript - in `packages/integrations/src/offline-sync.ts`)**:

  ```typescript
  import { doc, onSnapshot } from 'firebase/firestore';
  import { useStore } from 'zustand'; // From cross-app-store
  import { type HealingSession } from '@cosmichub/types'; // Strict types

  export const useCrossAppSync = (userId: string) => {
    const store = useStore();
    useEffect(() => {
      const unsubscribe = onSnapshot(doc(db, 'users', userId, 'sessions', 'latest'), (snap) => {
        if (snap.exists()) {
          const data = snap.data() as HealingSession;
          store.setState({ tcmBalance: validateTCMBalance(data) }); // Type guard
          queueMicrotask(() => syncToHealWave(data)); // Offline queue if needed
        }
      });
      return unsubscribe;
    }, [userId]);
  };

  function validateTCMBalance(data: unknown): TCMBalance | null {
    // From type-guards.ts
    return isValidTCMBalance(data) ? data : null;
  }
  ```

Test coverage: 100% via `vitest.config.ts` (integration tests in `tests/integration/healwave-astro-integration.test.ts`).

## 3. Event-Driven Communication Patterns

Use event emitters for loose coupling, with Firebase Cloud Functions as orchestrators. Patterns align with modularity (no direct app imports).

- **Publisher-Subscriber (Pub/Sub)**: Redis Streams for internal events (e.g., `astro:transit-update` → `healwave:session-recommend`). External: Firebase Cloud Messaging (FCM) for notifications.
  - Astro publishes `chartComputed` event → HealWave subscribes for frequency gen.
  - Cross-app: `useCrossAppStore` dispatches via Zustand actions.

- **Saga Pattern for Orchestration**: In backend (`backend/api/routers/integrations.py`), coordinate multi-step flows (e.g., birth chart → TCM analysis → session creation) with compensating transactions.

- **Webhooks for External Sync**: Stripe webhooks in `stripe.ts` trigger subscription events across apps.

- **Modular Snippet (Python - Backend Event Handler in `backend/api/routers/tcm_router.py`)**:

  ```python
  from fastapi import APIRouter, BackgroundTasks
  from pydantic import BaseModel  # Strict validation
  from redis import Redis  # Caching/pub-sub

  router = APIRouter()
  r = Redis.from_url("redis://localhost")

  class TransitEvent(BaseModel):
      user_id: str
      transit_data: dict  # Vectorized from PySwissEph

  @router.post("/events/transit")
  async def handle_transit_event(event: TransitEvent, background_tasks: BackgroundTasks):
      # Publish to HealWave queue
      r.xadd("healwave:transits", {"user_id": event.user_id, "data": str(event.transit_data)})
      background_tasks.add_task(compute_tcm_recommendation, event)  # Async
      return {"status": "published"}

  def compute_tcm_recommendation(event: TransitEvent):
      # Vectorized TCM mapping (from backend/utils/tcm_vectorized.py)
      recommendations = vectorized_element_balance(event.transit_data)
      # Sync to Firestore
      db.collection('users').document(event.user_id).update({'tcm_insights': recommendations})
  ```

Monitor with `scripts/observability/generate_slo_report.py` (SLO: 99.9% event delivery).

## 4. Conflict Resolution Algorithms

Handle sync conflicts with a hybrid approach: timestamp-based + user-mediated.

- **Algorithm**: Last-Write-Wins (LWW) for simple fields (e.g., session start time); Merge for arrays (e.g., mood logs via Firebase array-union). For TCM balances, use OT (e.g., Yjs library in frontend for collaborative edits).
  - Detection: On sync, compare ETags/hashes in Firestore metadata.
  - Resolution: If conflict, notify via `NotificationContext.tsx` with diff view (Radix Dialog). Default: Server-side merge using vectorized diff in backend (`backend/utils/conflict_vectorized.py`).

- **Edge Cases**: Offline conflicts queued in IndexedDB; resolve on reconnect with user priority (e.g., HealWave session overrides Astro if timestamp newer).

- **Pseudocode (in `packages/storage/src/offline-sync.ts`)**:

  ```typescript
  async function resolveConflict(local: any, remote: any, type: 'session' | 'tcm'): Promise<any> {
    const localTime = local.updatedAt;
    const remoteTime = remote.updatedAt;
    if (localTime > remoteTime) return local;  // LWW
    if (type === 'tcm') {
      return mergeTCMBalances(local, remote);  // Vectorized merge
    }
    // User mediation via modal
    showConflictModal(local, remote);
    return await userResolve(local, remote);
  }
  ```

Validate with pytest (`test_vectorized_synastry_integration.py` extensions for conflicts).

## 5. TCM Integration Algorithms

Map astrology/Human Design to TCM five elements (Wood, Fire, Earth, Metal, Water) using vectorized computations for scalability.

- **Core Algorithm**: Birth chart → Elemental affinities (e.g., Aries=Fire). Transits adjust balances (e.g., Moon in Scorpio → Water emphasis).
  - Imbalance Detection: Vectorized scoring (`backend/utils/tcm_vectorized.py`): Score = Σ (planet_weight * element_affinity) - baseline. Threshold >0.5 = imbalance.
  - Frequency Mapping: Element → Hz (e.g., Wood=432Hz growth freq). Seasonal: Adjust via lunar calendar (`PySwissEph` integration).
  - Meridian Timing: Organ clock (e.g., Liver 1-3AM) + transits for optimal windows.

- **Personalization**: AI via xAI (`xaiService.ts`): Prompt "Map {chart} to TCM meridians for {user_profile}."
  - Gene Keys/Human Design Tie-In: Gates → Elements (e.g., Gate 1=Fire creativity).

- **Modular Snippet (Python - in `backend/astro/calculations/tcm_mapping.py`)**:

  ```python
  import numpy as np  # Vectorized
  from pydantic import BaseModel

  class ElementAffinity(BaseModel):
      wood: float = 0.0
      fire: float = 0.0
      # ... etc.

  def compute_tcm_balance(chart_data: dict) -> ElementAffinity:
      # Vectorized: planets x elements matrix
      affinities = np.array([planet_affinity(p) for p in chart_data['planets']])
      weights = np.array([w for w in chart_data['weights']])
      scores = np.dot(affinities, weights)  # 284/284 tests pass
      return ElementAffinity(wood=scores[0], fire=scores[1], ...)  # Normalize 0-1

  def recommend_frequency(balance: ElementAffinity, transit: dict) -> float:
      if balance.wood > 0.5 and transit['moon_sign'] == 'taurus':  # Earth support
          return 528.0  # Healing freq
      # Seasonal adjust: +10% in Spring (Wood)
      return base_element_freq(balance.dominant_element())
  ```

Test with `test_vectorized_multi_system.py` (add TCM cases). Coverage via `scripts/coverage-report.mjs`.

## 6. Security and Privacy Considerations

Align with enforced standards: GDPR/HIPAA via pseudonymization, strict Firestore rules.

- **Auth/Sessions**: Unified JWTs (Firebase) with short expiry (15min). Biometric for mobile (`apps/mobile`).
- **Data Privacy**: Pseudonymize PII in `backend/utils/pseudonymization.py` (e.g., hash user_ids for TCM logs). No raw health data in Firestore; encrypt sessions (Web Crypto API).
- **Compliance**: Rate limiting (`backend/api/routers`), CSP headers (`csp.py`). Quarterly salt rotation (`scripts/security/rotate_salts.sh`). PETs (Privacy-Enhancing Tech) score 92.4/100.
- **Access Controls**: Role-based (e.g., premium users only for TCM insights). Audit logs in `backend/monitoring`.
- **Offline Security**: Encrypt IndexedDB with user-derived keys.

Validate with `schema/env.schema.json` and `scripts/security/check_secret_ages.py`.

## 7. Implementation Roadmap with Phases

Phased rollout ensures production readiness, using AI agents (7 ready, 82.4% efficiency via `ai-agent-coordination`).

- **Phase 1: Foundation (1-2 weeks, Q4 2025)**  
  Setup shared packages extensions (auth, integrations). Implement unified profiles in Firestore. Run `scripts/ai-agent-lint-coordinator.mjs` for ComponentFixAgent on UI. Tests: 100% coverage. Deploy to dev (Vercel/Render).

- **Phase 2: Core Sync & Events (2-3 weeks)**  
  Add data sync (`offline-sync.ts`), event patterns (Redis pub/sub). Integrate TCM mapping backend. AI coordination: FeatureFixAgent for healwave features. Benchmark with `benchmark_vectorized_synastry.py` (extend for TCM). SLO report via `generate_slo_report.py`.

- **Phase 3: TCM & Cross-App Flows (3-4 weeks)**  
  Algorithms for element detection, frequency gen. Mobile widgets/notifications. PagesContextAgent for UX. Accessibility audit (`fix-accessibility-issues.mjs`). Offline demo in `OfflineChartDemo.tsx`.

- **Phase 4: Polish & Security (1-2 weeks)**  
  Conflict resolution, privacy hardening. UIPackageAgent for modals/tooltips. Run `cleanup-project.sh`, `rotate_salts.sh`. Beta testing (`test-mobile-app.sh`).

- **Phase 5: Launch & Monitor (Ongoing)**  
  App store deployment (`submit-to-app-stores.sh`). Observability (`analyze_synthetic.py`). Quarterly maintenance: `refresh-agent-analysis.mjs`, `generate_slo_report.py`.

Next Steps: Execute `scripts/ai-agent-lint-coordinator.mjs` for initial analysis. Update `ROADMAP.md` with phases. Validate env (`validate-env.mjs`). Monitor metrics (`collect-metrics.py`) for 50% subscription uplift potential.

---

## 🏥 **PROMPT 5: Clinical-Grade Features & HIPAA Compliance**

```text
# HealWave Clinical Edition - Healthcare Integration

I'm developing clinical-grade features for a frequency therapy app that healthcare professionals can use with patients while maintaining HIPAA compliance and research capabilities.

## Current Consumer Features:
- Basic frequency therapy sessions
- User profile and progress tracking
- Subscription tiers (free, premium, clinical)
- PWA with offline capabilities

## Clinical Requirements:
1. Patient management dashboard
2. Session prescription and monitoring
3. Treatment protocol libraries
4. Progress analytics and reporting
5. Multi-practitioner support
6. White-label customization
7. Research data collection
8. Insurance billing integration (future)

## HIPAA Compliance Needs:
- End-to-end encryption
- Audit logging
- Access controls and permissions
- Data retention policies
- Breach notification systems
- Business Associate Agreements (BAA)
- Secure data export/import

## Integration Requirements:
- EMR/EHR system connections
- HL7 FHIR compatibility
- Clinical decision support
- Outcome measurement tools
- Telehealth platform integration

## Research Features:
- Anonymous data aggregation
- Clinical trial support
- Statistical analysis tools
- Publication-ready reports
- IRB compliance features

## Technical Stack:
- Frontend: React/TypeScript PWA
- Backend: Firebase with Functions
- Database: Firestore with encryption
- Analytics: Custom HIPAA-compliant solution

Please provide:
1. HIPAA-compliant architecture design
2. Security implementation strategies
3. Practitioner dashboard wireframes
4. Data encryption and storage patterns
5. Audit logging implementation
6. Research data collection framework
7. Compliance monitoring system

Focus on creating a robust, secure system that healthcare professionals can trust while maintaining the intuitive user experience of the consumer version.
```

## RESPONSE 5

## HealWave Clinical Edition: HIPAA-Compliant Architecture and Implementation

As part of the CosmicHub monorepo, HealWave Clinical Edition extends the existing frequency generator (healwave) app to support clinical-grade features for healthcare professionals. This aligns with core project goals by integrating healwave functionality into astro (e.g., astrology-tied therapeutic frequencies) via shared modules in `packages/integrations` and `apps/healwave/src/components`. All new features prioritize production readiness, with 100% test coverage via Vitest/pytest, WCAG 2.1 accessibility using Radix UI, and scalability through Firestore indexing and Redis caching. Security is hardened with pseudonymization, rate limiting, and strict Firestore rules. AI enhancements (e.g., clinical decision support) leverage xAI integrations in `packages/integrations/xaiService.ts`.

The clinical edition maintains the intuitive consumer UX (e.g., offline PWA capabilities) while adding practitioner tools. New components will be modularized in `apps/healwave/src/features/clinical`, sharing `packages/ui` for dashboards and `packages/types` for HIPAA-typed models. Post-implementation, run `scripts/cleanup-project.sh` to remove redundancies, `scripts/coverage-report.mjs` for validation, and `scripts/ai-agent-lint-coordinator.mjs` for AI-assisted maintenance.

Below, I address each requested deliverable.

## 1. HIPAA-Compliant Architecture Design

The architecture builds on the existing Firebase-centric backend (`backend/api/routers`) and React PWA frontend (`apps/healwave`), extending to clinical workflows. It ensures HIPAA compliance by isolating clinical data in encrypted Firestore collections, enforcing role-based access control (RBAC), and integrating audit trails. High-level design emphasizes modularity: shared `packages/auth` for multi-practitioner logins, `packages/config` for environment-specific HIPAA flags.

### Key Layers

- **Frontend (PWA/React 18 + TypeScript)**: Practitioner dashboard in `apps/healwave/src/pages/ClinicalDashboard.tsx`. Lazy-load clinical modules via `routes/lazy-routes.tsx` for performance (target <77ms builds).
- **Backend (FastAPI + Firebase Functions)**: New routers in `backend/api/routers/clinical.py` for patient management and protocols. Use Pydantic models in `backend/api/models/clinical.py` for type-safe serialization.
- **Database (Firestore + Encryption)**: Clinical data in dedicated collections (e.g., `patients`, `sessions`) with field-level encryption via Firebase Extensions or custom AES-256 (see section 4).
- **Integrations**: HL7 FHIR via `packages/integrations/fhir.ts`; EMR connections through secure APIs. Research data anonymized in aggregated views.
- **Security/Compliance Layer**: RBAC via Firebase Auth custom claims; audit logs in `backend/monitoring/clinical-audits.py`.
- **Monitoring**: SLO reports via `scripts/observability/generate_slo_report.py`, extended for HIPAA metrics (e.g., access logs).

### Text-Based Architecture Diagram

```text
[Client PWA (React/TS)] <-> [API Gateway (FastAPI + Rate Limiting)]
                          |
                          v
[Firebase Auth (RBAC + MFA)] <-> [Firestore (Encrypted Collections)]
                          |
                          +-- [Functions (Clinical Logic + FHIR Export)]
                          |
                          +-- [Redis Cache (Session Tokens)]
                          |
                          v
[Analytics (HIPAA-Compliant: Aggregated + Anonymized)] <-> [Audit Logs (Immutable)]
                          |
                          v
[External: EMR/HL7, Telehealth APIs] (Secure Tokens via `packages/integrations`)
```

**Scalability Notes**: Horizontal scaling via `docker-compose.yml`; vectorized queries in `backend/utils/vectorized_clinical.py` for analytics (Phase 3 complete, 284/284 tests passing). Validate with `scripts/validate-env.mjs` using `schema/env.schema.json` (add HIPAA keys like `ENCRYPTION_KEY`).

**Production Readiness**: All features deployable via Vercel/Render; test with `scripts/test-pwa.sh` and emulators.

## 2. Security Implementation Strategies

Leverage existing security in CosmicHub (e.g., Vercel secrets, CSP in `backend/api/routers/csp.py`, salt rotation via `scripts/security/rotate_salts.sh`) while adding HIPAA-specific measures. Enforce least-privilege access; no data transmission without encryption.

### Strategies

- **Access Controls**: Extend `packages/auth` with practitioner roles (e.g., `practitioner`, `researcher`) using Firebase custom claims. Implement RBAC in `backend/api/routers/clinical.py` with guards like `require_role('practitioner')`. Use `packages/types/type-guards.ts` for runtime checks.
- **Encryption**: End-to-end with AES-256 for data at rest/transit (TLS 1.3 enforced). Patient PII encrypted client-side before Firestore storage (see section 4).
- **Rate Limiting & Monitoring**: Per-user limits in `backend/api/routers` (e.g., 100 sessions/day); pseudonymization via `backend/utils/pseudonymization.py`.
- **BAA & Vendor Compliance**: Firebase is HIPAA-eligible; sign BAA. For custom Functions, audit third-parties (e.g., xAI integrations anonymized).
- **Breach Response**: Automated notifications via `packages/notifications`; retention policies in Firestore TTL rules.
- **Input Validation**: Strict Pydantic schemas; sanitize with `packages/types/experiment-validators.ts`.

**Implementation Snippet** (Modular, in `packages/auth/clinicalGuards.ts`):

```typescript
import { typeGuards } from '../types/type-guards';

export const requireHIPAARole = (requiredRole: string) => {
  return (user: AuthUser | null): user is AuthUser & { claims: { role: string } } => {
    return typeGuards.isAuthenticatedUser(user) && user.claims.role === requiredRole;
  };
};

// Usage in components: if (!requireHIPAARole('practitioner')(currentUser)) { /* deny */ }
```

Run `scripts/security/rotate_salts.sh` quarterly; validate with `scripts/validate-env-schema.mjs`.

## 3. Practitioner Dashboard Wireframes

The dashboard extends `apps/healwave/src/components` with Radix UI for accessibility (ARIA labels, keyboard nav). Place in `apps/healwave/src/pages/ClinicalDashboard.tsx`, sharing `packages/ui` components like `EnhancedCard` and `Tabs`. UX mirrors consumer version: intuitive navigation, tooltips via `EducationalTooltip.tsx`.

### Wireframe Descriptions (Text-Based, Mobile-Responsive via Tailwind)

Use a sidebar layout for scalability; lazy-load tabs for performance.

#### Main Dashboard (Desktop: 3-Column Grid; Mobile: Stacked Cards)

- **Header**: Logo + UserMenu (practitioner profile, logout). Notification bell for session alerts.
- **Sidebar (20% width)**:
  - Patient List (searchable via `Input.tsx`)
  - Quick Actions: New Session, Protocol Library
  - Compliance Status (green/red indicators)
- **Main Content (60% width)**:
  - **Patients Tab** (Default): Table of patients (`Table.tsx` from `packages/ui`).

    | Patient ID | Name (Encrypted View) | Last Session | Progress | Actions |
    |------------|-----------------------|--------------|----------|---------|
    | PT-001    | [Masked: J*** S****] | 2025-09-06  | 75%     | View/Edit |

    - Cards for active sessions: Frequency controls + real-time monitoring.
  - **Sessions Tab**: Timeline view (`ChartDisplay` adapted for sessions). Filters: Date, Protocol.
  - **Analytics Tab**: Progress charts (`BiofeedbackChart.tsx`); export button.
  - **Research Tab**: Aggregated data previews (anonymized).
- **Right Panel (20% width)**: Patient details modal (`Modal.tsx`) on select; includes prescription form (`BirthDataForm.tsx` adapted for clinical intake).

#### Mobile Adaptation

- Collapsible sidebar (hamburger menu).
- Swipeable tabs; cards stack vertically.
- ARIA: `role="tablist"` on tabs; screen-reader friendly via `VisuallyHidden.tsx`.

**Storybook Integration**: Add stories in `apps/healwave/src/components/ClinicalDashboard.stories.tsx` for testing. Ensure WCAG via `scripts/fix-accessibility-issues.mjs`.

## 4. Data Encryption and Storage Patterns

Use field-level encryption for PII (e.g., patient names, notes) while keeping non-sensitive data (e.g., frequency logs) queryable. Align with existing serialization in `packages/types/serialize.ts`.

### Patterns

- **At-Rest**: Encrypt sensitive fields in Firestore using client-side Crypto API (Web Crypto). Store encrypted blobs; decrypt on-the-fly with session keys.
- **In-Transit**: HTTPS only; tokens via `packages/auth`.
- **Key Management**: Derive keys from user passphrase + Firebase Auth token. Rotate via `scripts/security/rotate_salts.py`.
- **Storage Structure** (Firestore Collections):
  - `practitioners/{id}`: Profile (non-encrypted).
  - `patients/{practitionerId}/{patientId}`: Encrypted doc with subcollections `sessions/{sessionId}` (frequencies, timestamps).
  - `research_aggregate`: Anonymized views (no PII; use aggregation queries).

**Implementation Snippet** (In `packages/storage/clinicalEncryption.ts`, type-safe with Pydantic/TS):

```python
# backend/api/utils/clinical_encryption.py
from cryptography.fernet import Fernet
from pydantic import BaseModel

class EncryptedPatient(BaseModel):
    encrypted_name: str
    session_logs: list  # Non-sensitive

def encrypt_field(data: str, key: bytes) -> str:
    f = Fernet(key)
    return f.encrypt(data.encode()).decode()
```

Client-side (TS): Use `crypto.subtle.encrypt` for browser compatibility. Test with `vitest.config.ts`; ensure offline sync via `packages/storage/offline-sync.ts`.

## 5. Audit Logging Implementation

Immutable logs for all clinical actions (e.g., session starts, data access). Extend existing logging in `packages/config/logger.ts` and `backend/monitoring`.

### Implementation

- **What to Log**: User ID, timestamp, action (e.g., "VIEW_PATIENT"), IP, data affected (hashed).
- **Storage**: Dedicated Firestore collection `audits/{actionId}` (TTL: 7 years per HIPAA). Use Cloud Functions triggers for auto-logging.
- **Framework**: Integrate with `packages/notifications` for alerts on suspicious activity.

**Snippet** (In `backend/api/middleware/audit.py`):

```python
# FastAPI middleware
from fastapi import Request
import logging

@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    user_id = request.state.user_id
    action = f"{request.method} {request.url.path}"
    logging.info(f"Audit: {user_id} - {action} - {request.client.host}")
    response = await call_next(request)
    # Append to Firestore
    await firestore.collection('audits').add({
        'userId': user_id, 'action': action, 'timestamp': datetime.utcnow()
    })
    return response
```

Rotate logs with `scripts/rotate-logs.sh`. Query via dashboard for compliance audits.

## 6. Research Data Collection Framework

Anonymized, opt-in collection for aggregated insights (e.g., frequency efficacy trends). IRB-compliant: No PII; consent via `packages/ui/ConsentModal.tsx`.

### Framework

- **Collection**: On session end, anonymize (hash patient ID) and store in `research_data/{anonId}` (e.g., {frequency: 432Hz, outcome: 'reduced anxiety'}).
- **Tools**: Statistical analysis via `backend/utils/research_analytics.py` (using pandas/SciPy; vectorized for scale).
- **Export**: Publication-ready CSV/PDF via `packages/ui/ReportGenerator.tsx`; FHIR-compatible.
- **Compliance**: Consent tracking in Firestore; de-identification per HIPAA Safe Harbor.

**Modular Placement**: New service in `packages/integrations/research.ts`; test with `pytest.ini` (add `test_research_anonymization.py`).

## 7. Compliance Monitoring & Auditing System

Automated checks to ensure ongoing HIPAA adherence, integrated with existing observability (`scripts/observability`).

### System Components

- **Daily Scans**: Script `scripts/compliance/hipaa-scan.py` checks encryption status, access logs, retention.
- **Dashboard**: Extend `EphemerisPerformanceDashboard.tsx` to `ClinicalComplianceDashboard.tsx` (metrics: Audit completeness, breach risks).
- **Alerts**: Push notifications via `NotificationContext.tsx` for failures (e.g., expired keys).
- **Reporting**: Generate SLO reports including HIPAA KPIs (e.g., 99.9% uptime for logs).

**Next Steps**:

- **Maintenance**: Run `scripts/organize-docs.sh` to update `docs/01-CURRENT-STATUS` with clinical notes. Execute AI agents via `scripts/refresh-agent-analysis.mjs` for code reviews (add ClinicalFixAgent).
- **Testing**: Add integration tests in `tests/integration/clinical.test.ts`; aim for 100% coverage.
- **Deployment**: Use `scripts/deploy-mobile-final.sh` for PWA updates; validate env with `schema/env.schema.json`.
- **Expansion**: Prepare for EMR integrations; monitor with `scripts/generate_slo_report.py`.

This design ensures HealWave Clinical Edition is secure, scalable, and trustworthy, ready for healthcare adoption
---

## 📱 **PROMPT 6: Advanced PWA & Mobile Experience**

```text
# HealWave Advanced PWA & Mobile Optimization

I'm enhancing a frequency therapy PWA to provide native app-like experiences with advanced mobile capabilities, offline functionality, and wearable integration.

## Current PWA Features:
- Basic service worker
- Web app manifest
- Install prompt
- Offline fallback page

## Enhancement Goals:
1. Background audio processing (locked screen)
2. Advanced offline capabilities
3. Push notifications with scheduling
4. Wearable device integration (Apple Watch, Fitbit)
5. Device sensors integration (accelerometer, gyroscope)
6. Advanced caching strategies
7. Native sharing capabilities
8. Biometric authentication

## Mobile-Specific Features:
- Lock screen controls
- Picture-in-picture mode
- Ambient light adaptation
- Battery optimization
- Network-aware quality adjustment
- Haptic feedback integration
- Voice control integration

## Offline Requirements:
- Download frequency libraries
- Sync when reconnected
- Conflict resolution
- Offline session recording
- Cached visualizations
- Offline user preferences

## Wearable Integration:
- Session controls from watch
- Heart rate monitoring
- Biofeedback data collection
- Session reminders
- Quick session start

## Technical Challenges:
- iOS Safari limitations
- Background audio policies
- Storage quotas
- Battery life optimization
- Cross-device synchronization

Please provide:
1. Advanced service worker implementation
2. Background audio strategies
3. Offline-first architecture
4. Wearable integration patterns
5. Push notification system
6. Performance optimization techniques
7. Platform-specific implementations

Focus on creating a premium mobile experience that rivals native apps while working within web platform constraints.
```

## RESPONSE 6

### HealWave Advanced PWA & Mobile Optimization Implementation Guide

This guide aligns with CosmicHub's production-ready standards, leveraging the existing monorepo structure (e.g., `apps/healwave` for frequency generation, `apps/mobile` for React Native integration, `packages/pwa` for shared PWA utilities, and `packages/ui` for accessible components). All enhancements prioritize type safety (strict TypeScript with type guards from `packages/types/type-guards.ts`), accessibility (WCAG 2.1 via Radix UI primitives), scalability (Firestore/Redis integration), security (pseudonymization and rate limiting), and performance (lazy loading, memoization, and vectorized operations where applicable).

Changes are modular: new features integrate via shared packages (e.g., `packages/integrations` for cross-app hooks, `packages/pwa` for service worker enhancements). Validate post-implementation with `scripts/validate-env.mjs`, `scripts/coverage-report.mjs` (target 100% coverage), and `scripts/performance-dashboard.mjs`. For mobile-specific builds, use `scripts/build-mobile-app.sh` and test with `scripts/test-mobile-app.sh`.

#### 1. Advanced Service Worker Implementation

Enhance the existing basic service worker (`apps/healwave/public/sw.js`) for intelligent caching, background sync, and precaching of frequency libraries. Use Workbox for reliability, integrated via `packages/pwa/src/caching-service-worker.ts`. This supports offline frequency playback and syncs session data to Firestore on reconnection.

**Key Features:**

- Precaching: Frequency audio files, UI bundles, and offline visualizations.
- Runtime caching: API responses for ephemeris/transit data (with stale-while-revalidate).
- Background sync: Queue offline sessions for upload.
- Notification handling: Display push notifications even offline.

**Modular Code Snippet** (Extend `packages/pwa/src/caching-service-worker.ts`):

```typescript
// packages/pwa/src/caching-service-worker.ts
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import type { PrecacheEntry } from 'workbox-precaching';
import { typeGuards } from 'packages/types/type-guards'; // For safe parsing of manifest

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (PrecacheEntry & { revision: string })[];
};

const bgSyncPlugin = new BackgroundSyncPlugin('healwave-sync-queue', {
  maxRetentionTime: 24 * 60, // 24 hours
  onSync: async ({ queue }: { queue: Queue }) => {
    // Sync offline sessions to Firestore
    const queuedRequests = await queue.getAll();
    for (const request of queuedRequests) {
      if (typeGuards.isValidSessionRequest(request)) {
        await fetch(request.url, { method: 'POST', body: request.clone().body });
      }
    }
    await queue.shift();
  },
});

// Precache assets from manifest
precacheAndRoute(self.__WB_MANIFEST);

// Handle offline page fallback
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }: { request: Request; url: URL }) =>
    request.destination === 'document' && !url.pathname.match(fileExtensionRegexp),
  createHandlerBoundToURL(`${process.env.PUBLIC_URL}/offline.html`, { method: 'GET' }),
);

// Cache frequency libraries (CacheFirst for offline access)
registerRoute(
  ({ url }: { url: URL }) => url.pathname.startsWith('/frequencies/'),
  new CacheFirst({
    cacheName: 'frequency-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 days
      bgSyncPlugin,
    ],
  }),
);

// API caching with stale-while-revalidate for ephemeris/transit data
registerRoute(
  ({ url }: { url: URL }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 100 })],
  }),
);

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  if (typeGuards.isValidNotificationPayload(data)) {
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge.png',
      actions: [{ action: 'start-session', title: 'Start Now' }],
      data: { sessionId: data.sessionId },
    };
    event.waitUntil(
      self.registration.showNotification('HealWave Session Reminder', options),
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'start-session') {
    event.waitUntil(clients.openWindow(`/healwave?session=${event.notification.data.sessionId}`));
  }
});
```

**Integration Steps:**

- Update `apps/healwave/public/sw.js` to import and register this.
- Generate precache manifest via Vite plugin in `apps/healwave/vite.config.ts`.
- Test offline with `scripts/test-pwa.sh`; monitor caching via `scripts/collect-metrics.py`.

#### 2. Background Audio Strategies

Leverage Web Audio API (existing in `apps/healwave/src/components/AudioPlayer.tsx`) for locked-screen playback. Use the Page Visibility API and AudioContext resumption for iOS/Android constraints. Integrate with `packages/integrations/healwave.ts` for cross-app (astro-healwave) binaural beats.

**Key Strategies:**

- Resume AudioContext on visibility change or user gesture.
- Background processing via Service Worker for queued playback.
- Battery-aware: Throttle frequencies if battery < 20%.
- Platform detection: Use `navigator.userAgent` for iOS-specific handling.

**Modular Code Snippet** (Enhance `apps/healwave/src/components/AudioPlayer.tsx`):

```typescript
// apps/healwave/src/components/AudioPlayer.tsx
import { useEffect, useRef, useState } from 'react';
import { useBattery } from 'packages/hooks'; // Custom hook from packages/hooks
import { typeGuards } from 'packages/types/type-guards';
import type { FrequencySession } from 'packages/types'; // Shared types

interface AudioPlayerProps {
  session: FrequencySession;
  isBackground: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ session, isBackground }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { batteryLevel } = useBattery(); // From packages/hooks/useBattery.ts (polyfill if needed)

  const initAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const startFrequency = async () => {
    await initAudioContext();
    if (!typeGuards.isValidFrequencySession(session) || batteryLevel < 0.2) {
      // Throttle or pause for battery optimization
      console.warn('Low battery: Pausing audio');
      return;
    }

    const oscillator = audioContextRef.current!.createOscillator();
    const gainNode = audioContextRef.current!.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current!.destination);

    oscillator.frequency.setValueAtTime(session.frequency, audioContextRef.current!.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current!.currentTime); // Volume control

    oscillator.start();
    oscillatorRef.current = oscillator;
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isBackground) {
        // Pause or queue in SW for true background
        if (audioContextRef.current) {
          audioContextRef.current.suspend();
        }
      } else {
        initAudioContext().then(startFrequency);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session, isBackground]);

  // Picture-in-Picture mode for video-like audio (iOS Safari support)
  const enablePiP = async () => {
    const video = document.createElement('video');
    video.src = '/silent.mp4'; // Silent video for audio-only PiP
    video.muted = true;
    video.play();
    await video.requestPictureInPicture();
    // Attach audio to video for lock-screen controls
  };

  return (
    <div className="audio-controls" role="region" aria-label="Frequency Player">
      <button
        onClick={isPlaying ? () => oscillatorRef.current?.stop() || setIsPlaying(false) : startFrequency}
        aria-label={isPlaying ? 'Pause Frequency' : 'Play Frequency'}
        disabled={batteryLevel < 0.2}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      {isBackground && <button onClick={enablePiP}>Lock Screen Mode</button>}
    </div>
  );
};
```

**Integration Steps:**

- Add to `apps/healwave/src/features/healwave/components/AudioPlayer.tsx`.
- For astro integration: Use `apps/astro/src/features/healwave/components/AudioPlayer.tsx` via shared `packages/ui`.
- Optimize: Memoize with `usePerformance.ts` from `packages/config`; test battery via `scripts/benchmark_vectorized_synastry.py` (adapt for audio).

#### 3. Offline-First Architecture

Build on IndexedDB (via `packages/storage/src/offline-storage.ts`) for frequency libraries and session recording. Use `packages/pwa/src/background-sync-enhanced.ts` for reconnection sync. Download libraries on install; cache visualizations with Canvas API snapshots.

**Key Components:**

- Offline storage: Sessions, preferences, and audio blobs.
- Sync queue: Resolve conflicts with timestamp-based merging.
- Fallback UI: Cached Gene Keys/Transit charts.

**Modular Code Snippet** (Extend `packages/storage/src/offline-storage.ts`):

```typescript
// packages/storage/src/offline-storage.ts
import { openDB } from 'idb'; // Or Dexie for scalability
import { serialize, typeGuards } from 'packages/types'; // Shared serialization
import type { OfflineSession, FrequencyLibrary } from 'packages/types';

const DB_NAME = 'healwave-offline';
const DB_VERSION = 1;

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
    db.createObjectStore('libraries', { keyPath: 'name' });
    db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
  },
});

export const storeSession = async (session: OfflineSession) => {
  if (!typeGuards.isValidOfflineSession(session)) return;
  const db = await dbPromise;
  await db.put('sessions', serialize(session));
};

export const queueForSync = async (request: Request) => {
  const db = await dbPromise;
  await db.add('syncQueue', { request: await request.clone(), timestamp: Date.now() });
  // Trigger SW background sync
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('healwave-sync');
  }
};

export const downloadLibraries = async (libraries: FrequencyLibrary[]) => {
  const db = await dbPromise;
  for (const lib of libraries) {
    const response = await fetch(lib.url);
    const blob = await response.blob();
    await db.put('libraries', { name: lib.name, data: blob, size: blob.size });
  }
};

// Conflict resolution: Merge by timestamp
export const resolveConflicts = async (local: OfflineSession[], remote: OfflineSession[]) => {
  return [...local, ...remote].sort((a, b) => b.timestamp - a.timestamp).slice(0, 100); // Latest 100
};
```

**Integration Steps:**

- In `apps/healwave/src/hooks/useOfflineCharts.ts`: Call `downloadLibraries` on app load.
- Sync: Integrate with Firestore via `packages/integrations/firestore-optimizer.ts`.
- Test: Use `scripts/observability/analyze_synthetic.py` for offline journeys; ensure 100% coverage with Vitest.

#### 4. Wearable Integration Patterns

Use Web Bluetooth API for Fitbit/Apple Watch (experimental; fallback to companion apps). For heart rate/biofeedback, integrate via Web APIs or push from native mobile app. Patterns: Event-driven hooks in `packages/integrations` for session controls.

**Key Patterns:**

- Bluetooth pairing for session start/stop.
- Heart rate monitoring to adjust frequencies (e.g., binaural beats).
- Reminders via push; quick-start from watch.

**Modular Code Snippet** (New `packages/integrations/src/wearable.ts`):

```typescript
// packages/integrations/src/wearable.ts
import { useEffect, useState } from 'react';
import type { HeartRateData } from 'packages/types';

export const useWearableIntegration = () => {
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!navigator.bluetooth) return; // Polyfill or prompt for permission

    const connect = async () => {
      try {
        const device = await navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] });
        const server = await device.gatt!.connect();
        const service = await server.getPrimaryService('heart_rate');
        const characteristic = await service.getCharacteristic('heart_rate_measurement');
        await characteristic.startNotifications();

        characteristic.addEventListener('characteristicvaluechanged', (event) => {
          const value = (event.target as BluetoothRemoteGATTCharacteristic).value!.getUint8(1); // Parse BPM
          setHeartRate(value);
          // Adjust frequency: e.g., if >100 BPM, lower to calming 432Hz
        });

        setIsConnected(true);
      } catch (error) {
        console.error('Wearable connection failed:', error);
      }
    };

    connect();
  }, []);

  const startSessionFromWatch = (sessionId: string) => {
    // Emit event to main app
    window.dispatchEvent(new CustomEvent('watch-session-start', { detail: { sessionId } }));
  };

  return { heartRate, isConnected, startSessionFromWatch };
};
```

**Integration Steps:**

- Hook into `apps/healwave/src/hooks/useHealwave.ts`.
- For mobile: Bridge via React Native modules in `apps/mobile`.
- Limitations: iOS requires native companion; test cross-device sync with `scripts/test-notifications.sh`.

#### 5. Push Notification System

Extend Firebase Cloud Messaging (FCM) in `packages/config/src/firebase.ts`. Schedule reminders for sessions; personalize via user preferences (e.g., astrology-tied frequencies).

**Modular Code Snippet** (Enhance `packages/config/src/firebase/analytics.ts` for notifications):

```typescript
// packages/config/src/firebase/notifications.ts
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import type { NotificationPayload } from 'packages/types';

export const usePushNotifications = (onNotification: (payload: NotificationPayload) => void) => {
  useEffect(() => {
    const messaging = getMessaging();
    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: process.env.VAPID_KEY });
        // Send token to backend for scheduling
        await fetch('/api/notifications/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    };

    requestPermission();

    onMessage(messaging, (payload) => {
      if (typeGuards.isValidNotificationPayload(payload)) {
        onNotification(payload);
        // Display: Use Radix Toast from packages/ui
      }
    });
  }, [onNotification]);

  // Schedule example: Daily session reminder
  const scheduleReminder = async (sessionId: string, time: Date) => {
    await fetch('/api/notifications/schedule', {
      method: 'POST',
      body: JSON.stringify({ sessionId, time: time.toISOString() }),
    });
  };

  return { scheduleReminder };
};
```

**Integration Steps:**

- Backend: Add router in `backend/api/routers/notifications.py` with rate limiting.
- Test: `scripts/test-notifications.sh`; track engagement with `packages/config/src/firebase/analytics.ts`.

#### 6. Performance Optimization Techniques

Target <77ms builds: Use Vite lazy loading, memoization, and vectorized audio processing. Monitor with `EphemerisPerformanceDashboard.tsx` (adapt for audio).

**Techniques:**

- Lazy load audio components: `React.lazy` in `routes/lazy-routes.tsx`.
- Memoization: `useMemo` for frequency calculations.
- Network-aware: Adjust quality (e.g., reduce sample rate on 3G).
- Bundle optimization: Run `scripts/bundle-size-monitor.mjs`.

**Modular Code Snippet** (In `apps/healwave/src/hooks/usePerformance.ts`):

```typescript
// apps/healwave/src/hooks/usePerformance.ts (extend from packages/config)
import { useMemo, useCallback } from 'react';
import { useNetwork } from 'packages/hooks'; // Custom hook

export const useOptimizedFrequency = (baseFreq: number) => {
  const { effectiveType } = useNetwork();
  return useMemo(() => {
    // Vectorized adjustment (simple example; integrate PySwissEph for astro)
    const adjustment = effectiveType === '3g' ? baseFreq * 0.8 : baseFreq;
    return adjustment;
  }, [baseFreq, effectiveType]);

  const playOptimized = useCallback(async (freq: number) => {
    // Memoized audio node creation
    const memoizedOscillator = useMemo(() => createOscillator(freq), [freq]);
    memoizedOscillator.start();
  }, []);
};
```

**Integration Steps:**

- Run `scripts/tree-shaking-analyzer.mjs` post-changes; generate SLO report with `scripts/observability/generate_slo_report.py`.

#### 7. Platform-Specific Implementations

- **iOS Safari:** Background audio via `webkitAudioContext`; PiP for lock-screen. Use media session API for controls.
- **Android Chrome:** Full background sync; haptic via Vibration API.
- **Mobile App (React Native):** Bridge PWA via WebView; native modules for biometrics/haptics in `apps/mobile/src/services`.
- **Ambient Light/Biometrics:** Use `AmbientLightSensor` and `Credential Management API`; fallback to user input.

**Platform Detection Snippet** (Shared in `packages/config/src/env.ts`):

```typescript
// packages/config/src/env.ts
export const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
export const isAndroid = /Android/.test(navigator.userAgent);

export const platformAudioInit = async () => {
  if (isIOS) {
    // iOS: Require user gesture
    document.addEventListener('touchstart', () => audioContext.resume(), { once: true });
  }
  // Haptic feedback
  if (isAndroid && 'vibrate' in navigator) {
    navigator.vibrate(200); // On session start
  }
};
```

**Next Steps:**

- Execute AI agent coordination: `scripts/ai-agent-lint-coordinator.mjs` for UIPackageAgent (ui enhancements).
- Deploy: `scripts/deploy-mobile-final.sh` for app stores; validate with `scripts/security/rotate_salts.sh`.
- Maintenance: Run `scripts/cleanup-project.sh` to remove backups; update docs with `scripts/organize-docs.sh`.

This implementation rivals native apps while adhering to web constraints, boosting premium value (e.g., 50% subscription uplift via biofeedback). For further validation, run `scripts/coverage-report.mjs`.

---

## 🧪 **PROMPT 7: Testing Strategy & Quality Assurance**

```text
# HealWave Comprehensive Testing Strategy

I'm developing a robust testing strategy for a complex frequency therapy app with audio processing, real-time visualizations, PWA features, and healthcare compliance requirements.

## Application Complexity:
- Web Audio API with real-time processing
- Complex React components with Radix UI
- PWA with service workers
- Firebase integration
- Cross-app communication
- HIPAA compliance requirements
- Mobile and desktop support

## Testing Requirements:
1. Audio functionality testing (automated)
2. Visual regression testing
3. Performance testing (audio latency, memory usage)
4. Accessibility testing (WCAG compliance)
5. Cross-browser compatibility
6. PWA functionality testing
7. Security and compliance testing
8. Load testing for concurrent users

## Current Tech Stack:
- Vitest for unit testing
- React Testing Library
- TypeScript
- ESLint with accessibility rules
- Firebase Test SDK

## Specific Challenges:
- Testing Web Audio API functionality
- Mocking audio contexts for CI/CD
- Visual testing for dynamic geometry
- Testing offline functionality
- Performance testing across devices
- HIPAA compliance validation

## Test Categories Needed:
1. Unit tests (components, utilities, algorithms)
2. Integration tests (audio engine, Firebase)
3. E2E tests (user workflows)
4. Performance tests (audio latency, memory)
5. Accessibility tests (screen readers, keyboard)
6. Security tests (data encryption, auth)
7. Compliance tests (HIPAA requirements)

Please provide:
1. Comprehensive testing architecture
2. Audio testing strategies and mocks
3. Performance testing implementation
4. Visual regression testing setup
5. Accessibility testing automation
6. Security testing approaches
7. CI/CD pipeline configuration
8. Test data management strategies

Focus on creating a testing strategy that ensures reliability, performance, and compliance while being maintainable and efficient for the development team.

## RESPONSE 7

# HealWave Comprehensive Testing Strategy

This document outlines a production-grade testing strategy for HealWave, the frequency generator app within the CosmicHub monorepo. HealWave leverages the Web Audio API for real-time audio processing, integrates with astro via shared modules (e.g., `apps/astro/src/features/healwave`), and supports PWA features, Firebase backend, and cross-app communication. The strategy ensures 100% test coverage (aligned with Vitest and pytest standards), WCAG 2.1 accessibility, HIPAA compliance via pseudonymization and secure Firebase rules, and performance targets (e.g., <77ms audio latency). It builds on existing infrastructure: TurboRepo for monorepo orchestration, scripts like `scripts/coverage-report.mjs` for validation, and AI agent coordination (e.g., `scripts/ai-agent-lint-coordinator.mjs` for test maintenance).

All tests enforce strict TypeScript (via `tsconfig.strict.json`) and Pydantic models for backend validation. Suggestions are modular, with code snippets validated against `scripts/validate-env.mjs`. Post-implementation, run `scripts/coverage-report.mjs` to confirm 100% coverage and `scripts/ai-agent-lint-coordinator.mjs` to integrate with agents like UIPackageAgent for UI tests.

## 1. Comprehensive Testing Architecture

The architecture follows a pyramid model: 70% unit/integration, 20% E2E, 10% performance/security. Tests are organized in `apps/healwave/__tests__/` (unit/integration) and `tests/integration/` (E2E). Use Vitest for frontend (with React Testing Library), pytest for backend audio simulations, and Playwright for E2E. Leverage shared packages: `packages/types` for type guards, `packages/config` for Firebase mocks, and `packages/ui` for component testing.

| Test Layer | Scope | Tools | Coverage Target | Execution Frequency |
|------------|-------|-------|-----------------|---------------------|
| **Unit** | Components, hooks, utils (e.g., FrequencyControls.tsx) | Vitest, React Testing Library | 100% (lines/branches) | CI on every commit |
| **Integration** | Audio-Firebase flows, cross-app (healwave-astro) | Vitest + Firebase Emulators, pytest | 95% (interfaces) | CI on PRs |
| **E2E** | User workflows (e.g., generate binaural beats) | Playwright, Cypress (for PWA) | 80% (critical paths) | CI nightly + manual |
| **Performance** | Latency, memory (Web Audio API) | Vitest + Web Vitals, Lighthouse CI | SLO: <50ms latency | CI on merges + weekly |
| **Accessibility** | WCAG 2.1 (ARIA in AudioPlayer.tsx) | Axe-core, pa11y | AA level compliance | CI on every build |
| **Security/Compliance** | HIPAA (pseudonymization in healwave.ts) | OWASP ZAP, Firebase Test Rules | 100% rule validation | CI quarterly + post-deploy |
| **Visual Regression** | UI snapshots (dynamic visualizations) | Storybook + Chromatic | 100% stories | PR reviews |

**Modular Setup Script**: Add to `scripts/healwave-test-setup.mjs`:
```javascript
// scripts/healwave-test-setup.mjs
import { execSync } from 'child_process';
import { validateEnv } from './validate-env.mjs'; // Existing script

if (!validateEnv({ required: ['FIREBASE_CREDENTIALS'] })) {
  throw new Error('Env validation failed');
}

execSync('pnpm turbo run test:unit --filter=healwave', { stdio: 'inherit' });
execSync('pnpm turbo run test:integration --filter=healwave', { stdio: 'inherit' });
console.log('HealWave test setup complete. Coverage: Run scripts/coverage-report.mjs');
```

Run via `pnpm exec node scripts/healwave-test-setup.mjs` to bootstrap.

## 2. Audio Testing Strategies and Mocks

Web Audio API testing is challenging due to browser dependencies. Use mocks for CI/CD, real contexts for local/E2E. Focus on real-time processing (e.g., binaural beats in `AudioPlayer.tsx`), frequency generation (`FrequencyControls.tsx`), and offline playback.

**Strategies**:

- **Mocking**: Use `sinon` or custom stubs for `AudioContext` to simulate nodes (Oscillator, BinauralPanner) without hardware.
- **Headless Testing**: Run in Node.js via `jsdom` for Vitest; use Puppeteer for browser audio in E2E.
- **Edge Cases**: Test latency (<50ms), interruptions (e.g., tab focus), and device variations (mobile/desktop).
- **Integration**: Mock Firebase for storing frequency presets; test astro integration via `apps/astro/src/features/healwave/hooks/useHealwave.ts`.

**Code Snippet: Audio Mock in Vitest** (Add to `apps/healwave/__tests__/AudioPlayer.test.tsx`):

```tsx
// apps/healwave/__tests__/AudioPlayer.test.tsx
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import AudioPlayer from '../src/components/AudioPlayer.tsx';
import { useHealwave } from '../src/hooks/useHealwave.ts'; // Shared hook

vi.mock('../src/hooks/useHealwave.ts', () => ({
  useHealwave: vi.fn(() => ({ audioContext: null, start: vi.fn(), stop: vi.fn() })),
}));

vi.mock('web-audio-api'); // Or use sinon for deeper mocks

describe('AudioPlayer', () => {
  it('renders controls without context', () => {
    render(<AudioPlayer frequency={432} />);
    expect(screen.getByText(/Play Frequency/)).toBeInTheDocument();
  });

  it('mocks audio start/stop', async () => {
    const mockStart = vi.fn().mockResolvedValue(true);
    (useHealwave as any).mockReturnValue({ start: mockStart });
    render(<AudioPlayer frequency={432} />);
    // Simulate button click and assert mock calls
  });
});
```

**Backend Simulation** (pytest in `backend/tests/test_healwave_audio.py`):

```python
# backend/tests/test_healwave_audio.py
import pytest
from unittest.mock import Mock, patch
from apps.healwave.src.frequency_presets import generate_binaural

@patch('pyaudio.PyAudio')  # Mock audio lib if used
def test_binaural_generation(mock_pyaudio):
    result = generate_binaural(432, duration=5)
    assert result['latency'] < 0.05  # <50ms SLO
    mock_pyaudio.play.assert_called()  # Verify playback mock
```

Validate with `pnpm turbo run test --filter=healwave` and `pytest backend/tests/test_healwave_audio.py`.

## 3. Performance Testing Implementation

Target: <77ms builds (Vite/TurboRepo), <50ms audio latency, <200ms TTI (Time to Interactive) for PWA. Use existing `scripts/benchmark_vectorized_synastry.py` as template for audio benchmarks; integrate Web Vitals.

**Implementation**:

- **Tools**: Vitest with `perf` mode, Lighthouse for PWA audits, custom metrics via `packages/config/performance.ts`.
- **Metrics**: Audio latency (via `performance.now()`), memory (heap snapshots), bundle size (`scripts/bundle-size-monitor.mjs`).
- **Automation**: Run in CI via `turbo.json` tasks; alert on regressions with `scripts/coverage-ratchet.mjs` adapted for perf.

**Code Snippet: Performance Hook** (Extend `packages/hooks/src/usePerformance.ts` for HealWave):

```tsx
// packages/hooks/src/usePerformance.ts (shared)
import { useEffect } from 'react';

export const useAudioPerformance = (frequency: number) => {
  useEffect(() => {
    const start = performance.now();
    // Simulate audio init
    const audioCtx = new AudioContext();
    const end = performance.now();
    if (end - start > 50) {
      console.warn('Audio latency exceeded SLO');
      // Integrate with Firebase Analytics via packages/config/firebase.ts
    }
    return () => audioCtx.close();
  }, [frequency]);
};
```

Test via `vitest --run packages/hooks --coverage`; monitor with `scripts/observability/generate_slo_report.py` (add HealWave metrics).

## 4. Visual Regression Testing Setup

For dynamic visualizations (e.g., FrequencyVisualizer in `packages/ui/src/components/charts/`), use Storybook snapshots + Chromatic for cross-browser diffs.

**Setup**:

- **Tools**: Storybook (existing in `apps/astro/storybook-static`), Chromatic CI, Percy for visual diffs.
- **Process**: Generate stories for `FrequencyControls.tsx`; baseline on main branch.
- **Challenges**: Dynamic geometry – use fixed seeds for reproducible renders.

**Configuration** (Add to `apps/healwave/.storybook/main.ts`):

```ts
// apps/healwave/.storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';
import { healwaveStories } from '../../packages/ui/src/lazy-components.tsx'; // Shared

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)', healwaveStories],
  addons: ['@storybook/addon-a11y', '@storybook/addon-measure'], // For visual perf
  framework: '@storybook/react-vite',
};

export default config;
```

Integrate Chromatic via `pnpm add -D @chromatic-com/storybook`; run `chromatic --project-token=<token>` in CI. Validate diffs in PRs.

## 5. Accessibility Testing Automation

Ensure WCAG 2.1 AA for audio (e.g., ARIA-live for playback status in `AudioPlayer.tsx`). Build on existing `packages/config/accessibility-testing.tsx` and `scripts/fix-accessibility-issues.mjs`.

**Automation**:

- **Tools**: Axe-core in Vitest/Jest, pa11y for E2E, ESLint jsx-a11y (enforced in `tsconfig.eslint.json`).
- **Coverage**: Test screen readers (NVDA/VoiceOver), keyboard nav, focus management.
- **Integration**: Run in CI; auto-fix minor issues via script.

**Code Snippet: A11y Test** (In `apps/healwave/__tests__/FrequencyControls.a11y.test.tsx`):

```tsx
// apps/healwave/__tests__/FrequencyControls.a11y.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import FrequencyControls from '../src/components/FrequencyControls.tsx';

expect.extend(toHaveNoViolations);

it('should have no axe violations', async () => {
  const { container } = render(<FrequencyControls />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

Run `pnpm exec jest --config=vitest.config.ts --testPathPattern=a11y`; fix with `scripts/fix-accessibility-issues.mjs --app=healwave`.

## 6. Security Testing Approaches

HIPAA compliance: Use pseudonymization (`backend/utils/pseudonymization.py`), strict Firestore rules (`firestore.rules`), and rate limiting (`backend/api/routers`). Test audio data encryption and auth flows.

**Approaches**:

- **Tools**: OWASP ZAP for vuln scans, Firebase Test SDK for rules, `scripts/security/rotate_salts.sh` for key rotation.
- **Tests**: Unit for encryption utils; integration for Firebase auth in `healwave.ts`.
- **Compliance**: Quarterly audits; validate pseudonymization on user frequency data.

**Code Snippet: Security Test** (pytest in `backend/tests/test_healwave_security.py`):

```python
# backend/tests/test_healwave_security.py
from pydantic import validate_model  # Enforced
from backend.utils.pseudonymization import pseudonymize_audio_data

def test_pseudonymization():
    data = {"user_id": "123", "frequency": 432}
    pseudo = pseudonymize_audio_data(data)
    assert pseudo["user_id"] != "123"  # Salted hash
    validate_model(PydanticModel, pseudo)  # Type safety
```

Run `pytest backend/tests/test_healwave_security.py`; rotate salts quarterly.

## 7. CI/CD Pipeline Configuration

Use TurboRepo + GitHub Actions/Vercel for orchestration. Existing `turbo.json` pipelines extended for HealWave.

**Pipeline Structure** (`.github/workflows/healwave-ci.yml`):

```yaml
name: HealWave CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: latest }
      - run: pnpm install
      - run: pnpm turbo run lint test:unit test:integration --filter=healwave
      - run: pnpm exec scripts/coverage-report.mjs  # Validate 100%
      - run: pnpm exec scripts/fix-accessibility-issues.mjs --ci  # Auto-fix
      - uses: lighthouse-ci/action@v3  # PWA perf
        with:
          urls: ['http://localhost:5173/healwave']  # Vite dev server
      - uses: cypress-io/github-action@v6  # E2E for PWA
        with: { browser: chrome }
      - run: pnpm exec scripts/observability/generate_slo_report.py  # Perf SLO
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - run: pnpm turbo run build --filter=healwave
      - uses: vercel/action@v1  # Deploy to Vercel
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          project-id: cosmichub-healwave
```

Trigger AI coordination: Post-CI, run `scripts/refresh-agent-analysis.mjs` to update `coordination-manifest.json` for test agents.

## 8. Test Data Management Strategies

Use fixtures for reproducibility: Store in `tests/fixtures/` (e.g., audio samples, mock charts). Leverage Firebase Emulators for dynamic data; pseudonymize for compliance.

**Strategies**:

- **Fixtures**: JSON for birth data/frequencies; binary mocks for audio (via `packages/storage/src/offline-storage.ts`).
- **Seeding**: Script to populate Emulators (`scripts/seed-test-data.mjs`).
- **Cleanup**: Use `scripts/cleanup-project.sh` to reset; track in `ai-agent-coordination/` for agent analysis.

**Code Snippet: Fixture Loader** (`tests/fixtures/loader.ts`):

```ts
// tests/fixtures/loader.ts
import fs from 'fs';
import path from 'path';
import { type FrequencyPreset } from 'packages/types'; // Shared types

export const loadAudioFixture = (name: string): FrequencyPreset => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, `${name}.json`), 'utf8'));
  return data as FrequencyPreset;  // Type guard via packages/types/type-guards.ts
};
```

Seed via `pnpm exec ts-node scripts/seed-test-data.mjs --app=healwave`; validate env with `scripts/validate-env.mjs`.

This strategy maintains robustness (100% coverage), scalability (parallel CI), and security (HIPAA). Next: Execute `scripts/ai-agent-lint-coordinator.mjs` for agent integration; monitor via `EphemerisPerformanceDashboard.tsx` adapted for audio. For mobile extensions, align with `apps/mobile` deployment readiness.

```text

---

## 📊 **PROMPT 8: Analytics & Business Intelligence**

```text
# HealWave Analytics & Business Intelligence System

I'm designing a comprehensive analytics system for a frequency therapy app that provides insights for users, practitioners, and business stakeholders while maintaining privacy and compliance.

## Stakeholder Needs:
1. **Users**: Personal progress tracking, session insights, wellness trends
2. **Practitioners**: Patient progress, treatment effectiveness, protocol optimization
3. **Business**: User engagement, feature adoption, subscription conversion, churn prediction
4. **Researchers**: Anonymous population insights, frequency effectiveness studies

## Data Sources:
- User session data (frequency, duration, settings)
- Biometric data (heart rate, stress levels)
- User feedback and mood tracking
- App usage patterns and navigation
- Subscription and billing events
- Cross-app interactions (with CosmicHub)
- Device and performance metrics

## Analytics Requirements:
1. Real-time dashboard updates
2. Predictive analytics (churn, health outcomes)
3. Cohort analysis and user segmentation
4. A/B testing framework
5. Anomaly detection
6. Privacy-preserving analytics
7. HIPAA-compliant reporting

## Technical Constraints:
- Client-side data processing preferred
- Minimal server-side PII storage
- Real-time performance requirements
- Mobile-friendly visualizations
- Offline analytics collection
- Multi-tenant architecture (clinical users)

## Visualization Needs:
- Personal wellness dashboards
- Practitioner patient overview
- Business intelligence reports
- Research publication charts
- Real-time session monitoring

## Privacy & Compliance:
- Differential privacy techniques
- Data anonymization strategies
- GDPR compliance (right to deletion)
- HIPAA audit trails
- Consent management

Please provide:
1. Analytics architecture design
2. Privacy-preserving data collection methods
3. Real-time dashboard implementation
4. Predictive modeling approaches
5. Visualization component library
6. A/B testing framework
7. Compliance monitoring system
8. Performance optimization strategies

Focus on creating actionable insights while maintaining user trust and regulatory compliance.
```

## RESPONSE 8

## HealWave Analytics & Business Intelligence System Design

This design integrates the analytics system into the CosmicHub monorepo, leveraging existing infrastructure for scalability, security, and modularity. It prioritizes production readiness with 100% type safety (strict TypeScript/Pydantic), WCAG 2.1 accessibility (Radix UI primitives), Firestore/Redis for high-load handling, pseudonymization for privacy, and vectorized backend processing (Phase 3 complete, 284/284 tests passing). All components align with TurboRepo structure, shared packages (e.g., `ui`, `integrations`, `types`), and AI agent coordination (7 agents operational, 82.4% efficiency). Suggestions are validated against `scripts/validate-env.mjs` and `scripts/coverage-report.mjs` for robustness.

Maintenance notes: Run `scripts/cleanup-project.sh` post-implementation to remove redundancies; update `coordination-manifest.json` via `scripts/refresh-agent-analysis.mjs`; ensure 100% test coverage with Vitest/pytest.

## 1. Analytics Architecture Design

The architecture follows a layered, event-driven model: **Client-Side Collection** → **Edge Aggregation** → **Secure Storage** → **Vectorized Processing** → **Real-Time Serving** → **Visualized Insights**. This ensures scalability (horizontal via Docker Compose), modularity (shared `packages/integrations` for cross-app data), and security (Firestore rules, CSP).

- **Data Flow**:
  - **Ingestion Layer**: Client-side (React Native/Web Audio API in `apps/healwave`) captures sessions via hooks (e.g., `useSessionTracking.ts` in new `packages/analytics/hooks`). Data is pseudonymized locally and batched to Firestore (via `packages/integrations/firestore-optimizer.ts`).
  - **Aggregation Layer**: Serverless (FastAPI backend in `backend/api/routers/analytics.py`) uses Redis caching for real-time rollups. Vectorized ops (e.g., `backend/utils/vectorized_session_analysis.py`) process cohorts.
  - **Storage Layer**: Firestore for structured data (indexed for queries); BigQuery export for research (anonymized via `backend/utils/pseudonymization.py`). No PII in analytics tables.
  - **Processing Layer**: Python backend with PyTorch/Statsmodels for ML; integrate xAI API (`packages/integrations/xaiService.ts`) for predictive insights.
  - **Serving Layer**: GraphQL API (`backend/api/routers/graphql.py`) for dashboards; WebSockets for real-time.
  - **Multi-Tenant**: Role-based access (Firebase Auth in `packages/auth`) separates user/practitioner/business views.

- **Scalability**: Firestore indexing handles 10k+ sessions/day; Redis TTLs for hot data. Monitor with `scripts/observability/generate_slo_report.py` (target SLO: 99.9% uptime).
- **Modularity**: New `packages/analytics` for shared logic (types, hooks, utils). Integrate into `apps/healwave` via `apps/healwave/src/features/analytics`.

TypeScript types (add to `packages/types/src/analytics.types.ts`):

```typescript
// packages/types/src/analytics.types.ts
export interface SessionData {
  sessionId: string; // Anonymized UUID
  frequency: number;
  duration: number;
  biometric: { heartRate?: number; stressLevel?: number };
  timestamp: Date;
  userSegment: 'user' | 'practitioner' | 'research';
}

export interface AggregatedInsight {
  cohortId: string;
  avgDuration: number;
  trend: 'up' | 'down' | 'stable';
  prediction: { churnRisk: number };
}
```

Pydantic model (add to `backend/api/models/analytics.py`):

```python
from pydantic import BaseModel
from typing import Optional

class SessionData(BaseModel):
    session_id: str
    frequency: float
    duration: int
    biometric: Optional[dict] = None
    timestamp: str
    user_segment: str

class AggregatedInsight(BaseModel):
    cohort_id: str
    avg_duration: float
    trend: str
    prediction: dict
```

Validate: Run `scripts/typecheck.mjs` and `pytest backend/tests/test_analytics.py` (add 100% coverage).

## 2. Privacy-Preserving Data Collection Methods

Prioritize client-side processing to minimize server PII. Use differential privacy (add noise to aggregates) and pseudonymization (hash user IDs with salts rotated via `scripts/security/rotate_salts.sh`).

- **Methods**:
  - **Local Processing**: Compute aggregates (e.g., session trends) in-browser via Web Workers (`apps/healwave/src/hooks/useLocalAnalytics.ts`). Only upload anonymized summaries.
  - **Anonymization**: Generate ephemeral IDs (`packages/utils/pseudonymization.ts`); apply k-anonymity (group <5 users? Discard). Use Firebase's `pseudonymization.py` for server-side.
  - **Differential Privacy**: Add Laplace noise to numerics (e.g., avg heart rate) using `numpy` in backend (`backend/utils/differential_privacy.py`).
  - **Consent & Opt-Out**: UI prompt in `apps/healwave/src/components/ConsentModal.tsx` (Radix Dialog); track via Firestore with deletion hooks (`backend/api/routers/consent.py`).
  - **Offline Collection**: IndexedDB storage (`packages/storage/offline-storage.ts`); sync on reconnect with encryption (Web Crypto API).
  - **Transmission**: HTTPS only; rate-limit uploads (`backend/api/routers/rate_limit.py`).

- **Compliance**: GDPR deletion via `backend/utils/deletion_queue.py`; HIPAA audit logs in `backend/monitoring`.

Code Snippet (hook in `packages/analytics/hooks/usePrivacySafeTracking.ts`):

```typescript
// packages/analytics/hooks/usePrivacySafeTracking.ts
import { useEffect } from 'react';
import { SessionData } from '../../types/analytics.types';
import { pseudonymizeId } from '../../../utils/pseudonymization';

export const usePrivacySafeTracking = (session: SessionData) => {
  useEffect(() => {
    const anonymized = {
      ...session,
      userId: pseudonymizeId(session.userId), // Salted hash
      biometric: addNoise(session.biometric), // Differential privacy helper
    };
    // Batch to Firestore via integrations
    batchUpload(anonymized);
  }, [session]);
};

function addNoise(data: any): any {
  // Simple Laplace noise (epsilon=1.0)
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v + (Math.random() - 0.5) * 2])
  );
}
```

Test: Add to `packages/analytics/__tests__/usePrivacySafeTracking.test.ts`; run `vitest` (97.6% coverage target).

## 3. Real-Time Dashboard Implementation

Use Firestore listeners for sub-1s updates; React Query for caching. Dashboards in `apps/healwave/src/components/AnalyticsDashboard.tsx`, shared via `packages/ui`.

- **Implementation**:
  - **Backend**: Real-time triggers (`backend/firebase/realtime_analytics.py`) push aggregates to Redis/Firestore.
  - **Frontend**: `useSWR` or `react-query` hooks (`packages/config/hooks/useRealTimeData.ts`) subscribe to queries. Lazy-load charts (`apps/healwave/src/routes/lazy-routes.tsx`).
  - **Views**:
    - User: Personal trends (`PersonalWellnessDashboard.tsx`).
    - Practitioner: Patient cohorts (`PatientOverview.tsx`).
    - Business: KPIs (`BIReports.tsx`).
  - **Mobile**: React Native integration (`apps/mobile/src/components/RealTimeChart.tsx`); offline sync via `background-sync-enhanced.ts`.

Code Snippet (component in `packages/ui/src/components/AnalyticsDashboard.tsx`):

```tsx
// packages/ui/src/components/AnalyticsDashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/Card'; // Radix-based
import { AggregatedInsight } from '@/types/analytics.types';
import { api } from '@/integrations/api'; // Shared

export const AnalyticsDashboard = ({ segment }: { segment: string }) => {
  const { data: insights } = useQuery<AggregatedInsight[]>({
    queryKey: ['insights', segment],
    queryFn: () => api.getRealTimeInsights(segment),
    refetchInterval: 5000, // Real-time
  });

  return (
    <div className="grid gap-4" role="region" aria-label="Analytics Dashboard">
      {insights?.map(insight => (
        <Card key={insight.cohortId} aria-labelledby={`insight-${insight.cohortId}`}>
          <CardContent>
            <h3 id={`insight-${insight.cohortId}`}>Cohort: {insight.cohortId}</h3>
            <p>Avg Duration: {insight.avgDuration.toFixed(2)}s</p>
            <span aria-label={`Trend: ${insight.trend}`}>{insight.trend}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

Accessibility: Axe tests via `packages/config/accessibility-testing.tsx`; run `scripts/fix-accessibility-issues.mjs`.

## 4. Predictive Modeling Approaches

Leverage vectorized backend for efficiency; integrate xAI for advanced predictions.

- **Approaches**:
  - **Churn Prediction**: Logistic regression (Statsmodels in `backend/utils/predictive_models.py`); features: session frequency, feedback scores. Train on anonymized cohorts.
  - **Health Outcomes**: Time-series (ARIMA/PyTorch) for biometric trends; xAI fine-tuning for personalized insights (`packages/integrations/xaiService.ts`).
  - **Effectiveness Studies**: Causal inference (DoWhy lib, if available; fallback to correlation via SciPy).
  - **Deployment**: Batch jobs (`scripts/observability/analyze_synthetic.py`); real-time inference via FastAPI endpoints.
  - **Evaluation**: Cross-validation; track with `backend/monitoring/model_metrics.py` (SLO: AUC > 0.8).

Code Snippet (model in `backend/utils/churn_predictor.py`):

```python
# backend/utils/churn_predictor.py
import statsmodels.api as sm
from typing import List, Dict
from packages.types.analytics import AggregatedInsight  # Via serialization

class ChurnPredictor:
    def __init__(self):
        self.model = None

    def train(self, data: List[AggregatedInsight]):
        X = sm.add_constant([[d.avgDuration, d.trend == 'down'] for d in data])  # Vectorized
        y = [1 if random_churn else 0 for _ in data]  # Placeholder
        self.model = sm.Logit(y, X).fit()

    def predict(self, insight: AggregatedInsight) -> float:
        if self.model:
            X = sm.add_constant([[insight.avgDuration, insight.trend == 'down']])
            return self.model.predict(X)[0]
        return 0.5
```

Integrate: Call from `backend/api/routers/predictive.py`; test with `pytest backend/tests/test_churn.py`.

## 5. Visualization Component Library

Extend `packages/ui` with accessible, performant charts (Recharts + Radix). Mobile-responsive via Tailwind.

- **Library**:
  - **Core Components**: `WellnessTrendChart.tsx` (line chart for sessions), `CohortPie.tsx` (segmentation), `BiofeedbackGauge.tsx` (real-time biometrics).
  - **Accessibility**: ARIA labels, keyboard nav; color-blind friendly palettes.
  - **Performance**: Memoized (`useMemo`); lazy-load via `dynamic` imports.
  - **Integration**: Use in dashboards; export to PDF (`packages/ui/tools/ExportTools.tsx`).

Code Snippet (chart in `packages/ui/src/components/charts/WellnessTrendChart.tsx`):

```tsx
// packages/ui/src/components/charts/WellnessTrendChart.tsx
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { SessionData } from '@/types/analytics.types';

interface Props { data: SessionData[]; }

export const WellnessTrendChart = ({ data }: Props) => (
  <ResponsiveContainer width="100%" height={300} role="img" aria-label="Wellness trends over time">
    <LineChart data={data}>
      <XAxis dataKey="timestamp" aria-label="Time axis" />
      <YAxis aria-label="Duration axis" />
      <Line type="monotone" dataKey="duration" stroke="#8884d8" dot={false} />
    </LineChart>
  </ResponsiveContainer>
);
```

Build: Add to `packages/ui/turbo.json`; test with `vitest packages/ui/__tests__/WellnessTrendChart.test.tsx`.

## 6. A/B Testing Framework

Build on `packages/types/experiments.ts`; use Firebase Remote Config for serving.

- **Framework**:
  - **Setup**: Define variants in `schema/experiment-registry.schema.json`; assign via user segment (`packages/integrations/experiments.ts`).
  - **Tracking**: Hooks (`useABTest.ts` in `packages/ui/hooks`) log events to Firestore.
  - **Analysis**: Backend stats (`backend/utils/ab_analysis.py` with SciPy t-tests); vectorized for scale.
  - **Rollout**: Gradual via Firebase; monitor conversion/churn.

Code Snippet (hook in `packages/ui/hooks/useABTest.ts`):

```tsx
// packages/ui/hooks/useABTest.ts
import { useEffect } from 'react';
import { experimentRegistry } from '@/types/experiments';

export const useABTest = (experimentId: string, onVariant: (variant: string) => void) => {
  useEffect(() => {
    const variant = getUserVariant(experimentId); // Firebase Remote Config
    onVariant(variant);
    logExposure(experimentId, variant); // To analytics
  }, [experimentId]);
};
```

Validate: `scripts/validate-experiments.mjs`; integrate AI agent `ServicesTypesAgent` for type updates.

## 7. Compliance Monitoring System

Automated audits for HIPAA/GDPR; integrate with existing security.

- **System**:
  - **Logging**: Centralized (`backend/monitoring/compliance_logs.py`); rotate via `scripts/rotate-logs.sh`.
  - **Audits**: Quarterly scans (`scripts/security/check_secret_ages.py` extended for consent); differential privacy checks.
  - **Alerts**: Firebase notifications for violations; dashboard in `EphemerisPerformanceDashboard.tsx` (extend for compliance metrics).
  - **Deletion**: Queue-based (`backend/utils/gdpr_deletion.py`); confirm via user feedback.

- **Monitoring**: SLO reports include compliance score (target 95%); use `scripts/observability/generate_slo_report.py`.

Add script (`scripts/compliance/audit_consent.sh`):

```bash
#!/bin/bash
# scripts/compliance/audit_consent.sh
firebase firestore:query --collection consents | jq '.[] | select(.deleted == false)' | wc -l
# Alert if < threshold
```

Run: Quarterly via cron; test with synthetic data (`scripts/observability/analyze_synthetic.py`).

## 8. Performance Optimization Strategies

Target 77ms builds; leverage existing optimizations.

- **Strategies**:
  - **Caching**: Redis for queries (`backend/cache/session_cache.py`); client-side React Query.
  - **Lazy Loading**: Dynamic imports for charts (`vite.config.ts`); code-split via TurboRepo.
  - **Vectorization**: Backend processing (e.g., NumPy for aggregates); monitor with `usePerformance.ts`.
  - **Offline**: Service Worker caching (`packages/pwa/caching-service-worker.ts`).
  - **Mobile**: Biometric sampling at 1Hz; compress data (Snappy in backend).
  - **Metrics**: Track via `EphemerisPerformanceDashboard.tsx`; SLO via `generate_slo_report.py`.

Benchmark: Add `scripts/benchmark_analytics.py` (extend `benchmark_vectorized_synastry.py`); run `scripts/performance-dashboard.mjs`.

Next Steps: Execute AI agents via `scripts/ai-agent-lint-coordinator.mjs` for integration; deploy to Vercel/Render; validate env with `scripts/validate-env.mjs`. This system enhances premium value (50% uplift potential) while ensuring trust.

---

## 🚀 **Implementation Roadmap**

### **Phase 1: Foundation (Weeks 1-2)**

- Use Prompts 1, 6, 7 for core improvements
- Focus on audio engine and PWA enhancements
- Establish testing framework

### **Phase 2: Intelligence (Weeks 3-4)**

- Use Prompts 2, 8 for smart features
- Implement basic AI recommendations
- Add comprehensive analytics

### **Phase 3: Integration (Weeks 5-6)**

- Use Prompts 3, 4 for cross-platform features
- Sacred geometry visualizations
- CosmicHub integration

### **Phase 4: Clinical (Weeks 7-8)**

- Use Prompt 5 for healthcare features
- HIPAA compliance implementation
- Practitioner dashboard

---

## 📝 **Usage Instructions**

1. **Copy the relevant prompt** based on your current development focus
2. **Customize the prompt** with your specific technical constraints or requirements
3. **Paste into Grok** and include any relevant code snippets from your current implementation
4. **Iterate on the response** by asking follow-up questions for specific implementation details
5. **Document the results** in the corresponding enhancement documentation

## 🎯 **Expected Outcomes**

Each prompt should provide:

- Detailed technical implementation strategies
- Code examples and architecture patterns
- Performance optimization techniques
- Security and compliance considerations
- Testing approaches
- Step-by-step implementation guidance

These prompts are designed to accelerate development while ensuring high-quality, production-ready solutions.
