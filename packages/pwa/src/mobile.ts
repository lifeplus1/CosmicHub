import { detectRuntimeCapabilities } from './capabilities';

export interface MobileUXController {
  dispose(): void;
}

export function initMobileUX(): MobileUXController {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return { dispose: () => undefined };
  }
  const caps = detectRuntimeCapabilities();
  if (!caps.hasTouch) return { dispose: () => undefined };
  const disposers: Array<() => void> = [];

  document.documentElement.classList.toggle('has-touch', caps.hasTouch);
  document.documentElement.classList.toggle('is-standalone', caps.isStandalone);
  document.documentElement.classList.add(`platform-${caps.platform}`);

  const setVH = () => {
    document.documentElement.style.setProperty(
      '--vh',
      `${window.innerHeight * 0.01}px`
    );
  };
  setVH();
  window.addEventListener('resize', setVH);
  disposers.push(() => window.removeEventListener('resize', setVH));
  window.addEventListener('orientationchange', () => setTimeout(setVH, 100));

  if (caps.hasVibration) {
    const click = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.matches('button, .btn, [role="button"]')) navigator.vibrate?.([10]);
    };
    document.addEventListener('click', click, { passive: true });
    disposers.push(() => document.removeEventListener('click', click));
  }

  return {
    dispose: () =>
      disposers.forEach(d => {
        try {
          d();
        } catch {
          /* ignore */
        }
      }),
  };
}
