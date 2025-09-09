/**
 * Session Manager
 * 
 * Based on Grok Response 1: Multi-phase Session Management
 * Handles frequency transitions and sequence management
 */

import { SessionConfig, SessionPhase, FrequencyTransition } from '../types';
import { AUDIO_CONSTANTS } from '../constants';

export class SessionManager extends EventTarget {
  private currentSession: SessionConfig | null = null;
  private currentPhaseIndex = 0;
  private phaseStartTime = 0;
  private sessionStartTime = 0;
  private isActive = false;
  private transitionTimer: number | null = null;
  private progressTimer: number | null = null;

  constructor() {
    super();
  }

  /**
   * Start a new session
   */
  startSession(config: SessionConfig): void {
    if (this.isActive) {
      this.stopSession();
    }

    this.currentSession = config;
    this.currentPhaseIndex = 0;
    this.sessionStartTime = Date.now();
    this.phaseStartTime = this.sessionStartTime;
    this.isActive = true;

    // Start progress monitoring
    this.startProgressMonitoring();

    // Begin first phase
    this.startPhase(0);

    this.emit('sessionStarted', { session: config });
  }

  /**
   * Stop the current session
   */
  stopSession(): void {
    if (!this.isActive) return;

    this.isActive = false;
    this.clearTimers();

    this.emit('sessionStopped', {
      totalDuration: Date.now() - this.sessionStartTime,
      phasesCompleted: this.currentPhaseIndex,
    });

    this.currentSession = null;
    this.currentPhaseIndex = 0;
  }

  /**
   * Get current session progress (0-1)
   */
  getProgress(): number {
    if (!this.currentSession || !this.isActive) return 0;

    const elapsed = Date.now() - this.sessionStartTime;
    const totalDuration = this.currentSession.duration * 1000;
    
    return Math.min(elapsed / totalDuration, 1);
  }

  /**
   * Get current phase information
   */
  getCurrentPhase(): SessionPhase | null {
    if (!this.currentSession?.phases || this.currentPhaseIndex >= this.currentSession.phases.length) {
      return null;
    }

    return this.currentSession.phases[this.currentPhaseIndex] ?? null;
  }

  /**
   * Get current frequency (considering transitions)
   */
  getCurrentFrequency(): number {
    if (!this.currentSession) return AUDIO_CONSTANTS.FREQUENCY.DEFAULT;

    const currentPhase = this.getCurrentPhase();
    if (!currentPhase) return this.currentSession.baseFrequency;

    // Check if we're in a transition
    const nextPhase = this.getNextPhase();
    if (nextPhase && currentPhase.transition) {
      return this.calculateTransitionFrequency(currentPhase, nextPhase);
    }

    return currentPhase.frequency;
  }

  /**
   * Skip to next phase
   */
  nextPhase(): void {
    if (!this.currentSession?.phases) return;
    
    if (this.currentPhaseIndex < this.currentSession.phases.length - 1) {
      this.currentPhaseIndex++;
      this.startPhase(this.currentPhaseIndex);
    } else {
      this.stopSession();
    }
  }

  /**
   * Jump to specific phase
   */
  jumpToPhase(phaseIndex: number): void {
    if (!this.currentSession?.phases || 
        phaseIndex < 0 || 
        phaseIndex >= this.currentSession.phases.length) {
      return;
    }

    this.currentPhaseIndex = phaseIndex;
    this.startPhase(phaseIndex);
  }

  // Private methods

  private startPhase(phaseIndex: number): void {
    const phase = this.currentSession?.phases?.[phaseIndex];
    if (!phase) return;

    this.phaseStartTime = Date.now();
    this.clearTimers();

    // Schedule next phase transition
    this.transitionTimer = window.setTimeout(() => {
      this.nextPhase();
    }, phase.duration * 1000);

    this.emit('phaseStarted', { 
      phase, 
      phaseIndex,
      totalPhases: this.currentSession?.phases?.length ?? 1 
    });
  }

  private getNextPhase(): SessionPhase | null {
    if (!this.currentSession?.phases) return null;
    
    const nextIndex = this.currentPhaseIndex + 1;
    if (nextIndex >= this.currentSession.phases.length) return null;
    
    return this.currentSession.phases[nextIndex] ?? null;
  }

  private calculateTransitionFrequency(currentPhase: SessionPhase, nextPhase: SessionPhase): number {
    if (!currentPhase.transition) return currentPhase.frequency;

    const phaseElapsed = Date.now() - this.phaseStartTime;
    const phaseDuration = currentPhase.duration * 1000;
    const transitionDuration = currentPhase.transition.duration * 1000;
    
    // Check if we're in transition period (end of phase)
    const transitionStart = phaseDuration - transitionDuration;
    if (phaseElapsed < transitionStart) {
      return currentPhase.frequency;
    }

    // Calculate transition progress (0-1)
    const transitionProgress = (phaseElapsed - transitionStart) / transitionDuration;
    const clampedProgress = Math.min(Math.max(transitionProgress, 0), 1);

    // Apply easing function
    const easedProgress = this.applyEasing(clampedProgress, currentPhase.transition.easing);

    // Calculate frequency based on transition type
    return this.interpolateFrequency(
      currentPhase.frequency,
      nextPhase.frequency,
      easedProgress,
      currentPhase.transition.type
    );
  }

  private applyEasing(progress: number, easing?: string): number {
    switch (easing) {
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return 1 - (1 - progress) * (1 - progress);
      case 'ease-in-out':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - 2 * (1 - progress) * (1 - progress);
      default:
        return progress;
    }
  }

  private interpolateFrequency(
    from: number, 
    to: number, 
    progress: number, 
    type: FrequencyTransition['type']
  ): number {
    switch (type) {
      case 'linear':
        return from + (to - from) * progress;
      
      case 'exponential': {
        // Exponential interpolation in frequency domain
        const logFrom = Math.log(from);
        const logTo = Math.log(to);
        return Math.exp(logFrom + (logTo - logFrom) * progress);
      }
      
      case 'logarithmic': {
        // Logarithmic interpolation
        const factor = Math.pow(to / from, progress);
        return from * factor;
      }
      
      case 'instant':
        return progress >= 1 ? to : from;
      
      default:
        return from + (to - from) * progress;
    }
  }

  private startProgressMonitoring(): void {
    this.progressTimer = window.setInterval(() => {
      if (!this.isActive) return;

      const progress = this.getProgress();
      this.emit('progressUpdate', { 
        progress,
        currentPhase: this.currentPhaseIndex,
        currentFrequency: this.getCurrentFrequency(),
      });

      // Check if session should end
      if (progress >= 1) {
        this.stopSession();
      }
    }, 100); // Update every 100ms
  }

  private clearTimers(): void {
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = null;
    }

    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private emit(type: string, data: unknown): void {
    this.dispatchEvent(new CustomEvent(type, { detail: data }));
  }
}
