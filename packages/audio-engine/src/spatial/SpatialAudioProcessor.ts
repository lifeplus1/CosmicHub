/**
 * Spatial Audio Processor
 * 
 * Based on Grok Response 1: Stereo panning and 3D audio positioning
 */

import { SpatialConfig } from '../types';
import { AUDIO_CONSTANTS } from '../constants';

export class SpatialAudioProcessor {
  private audioContext: AudioContext;
  private pannerNodes: Map<string, PannerNode> = new Map();
  private stereoPanners: Map<string, StereoPannerNode> = new Map();

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  /**
   * Create a 3D panner node
   */
  create3DPanner(id: string, config: SpatialConfig): PannerNode {
    const panner = this.audioContext.createPanner();
    
    // Configure 3D positioning
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = AUDIO_CONSTANTS.SPATIAL.REF_DISTANCE;
    panner.maxDistance = AUDIO_CONSTANTS.SPATIAL.MAX_DISTANCE;
    panner.rolloffFactor = AUDIO_CONSTANTS.SPATIAL.ROLLOFF_FACTOR;

    // Set position
    if (config.positionX !== undefined && config.positionY !== undefined && config.positionZ !== undefined) {
      panner.positionX.setValueAtTime(config.positionX, this.audioContext.currentTime);
      panner.positionY.setValueAtTime(config.positionY, this.audioContext.currentTime);
      panner.positionZ.setValueAtTime(config.positionZ, this.audioContext.currentTime);
    }

    this.pannerNodes.set(id, panner);
    return panner;
  }

  /**
   * Create a stereo panner (simpler than 3D)
   */
  createStereoPanner(id: string, pan: number = 0): StereoPannerNode {
    const panner = this.audioContext.createStereoPanner();
    panner.pan.setValueAtTime(pan, this.audioContext.currentTime);
    
    this.stereoPanners.set(id, panner);
    return panner;
  }

  /**
   * Update 3D position smoothly
   */
  updatePosition(id: string, x: number, y: number, z: number, transitionTime: number = 0.1): void {
    const panner = this.pannerNodes.get(id);
    if (!panner) return;

    const currentTime = this.audioContext.currentTime;
    panner.positionX.setTargetAtTime(x, currentTime, transitionTime);
    panner.positionY.setTargetAtTime(y, currentTime, transitionTime);
    panner.positionZ.setTargetAtTime(z, currentTime, transitionTime);
  }

  /**
   * Update stereo pan position
   */
  updateStereoPan(id: string, pan: number, transitionTime: number = 0.1): void {
    const panner = this.stereoPanners.get(id);
    if (!panner) return;

    panner.pan.setTargetAtTime(pan, this.audioContext.currentTime, transitionTime);
  }

  /**
   * Remove spatial processor
   */
  remove(id: string): void {
    this.pannerNodes.delete(id);
    this.stereoPanners.delete(id);
  }

  /**
   * Cleanup all processors
   */
  dispose(): void {
    this.pannerNodes.clear();
    this.stereoPanners.clear();
  }
}
