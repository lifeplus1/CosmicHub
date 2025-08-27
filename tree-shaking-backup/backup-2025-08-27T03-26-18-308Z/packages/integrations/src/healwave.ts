interface ExtendedWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export interface BasicChartData {
  sun?: { sign?: string };
}

export class HealwaveIntegration {
  private audioContext: AudioContext | null = null;

  createAudioContext(): AudioContext {
    if (!this.audioContext) {
      const win = window as ExtendedWindow;
      const Ctx = window.AudioContext ?? win.webkitAudioContext;
      if (!Ctx) throw new Error('Web Audio API not supported');
      this.audioContext = new Ctx();
    }
    return this.audioContext;
  }

  generateFrequencies(chartData: BasicChartData | null | undefined): number[] {
    // Generate healing frequencies based on astrological chart data
    const baseFrequencies = [528, 396, 417, 639, 741, 852, 963]; // Solfeggio frequencies

    // Customize based on chart data
    const sign = chartData?.sun?.sign?.toLowerCase();
    if (sign) {
      const signIndex = [
        'aries',
        'taurus',
        'gemini',
        'cancer',
        'leo',
        'virgo',
        'libra',
        'scorpio',
        'sagittarius',
        'capricorn',
        'aquarius',
        'pisces',
      ].indexOf(sign);
      if (signIndex >= 0) {
        return baseFrequencies.map(freq => freq + signIndex * 5);
      }
    }

    return baseFrequencies;
  }

  async playFrequency(
    frequency: number,
    duration: number = 1000
  ): Promise<void> {
    const context = this.createAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      context.currentTime + duration / 1000
    );

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);

    return new Promise(resolve => {
      oscillator.onended = () => resolve();
    });
  }
}
