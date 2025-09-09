// apps/healwave/src/components/CymaticsVisualizer.tsx
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { isPositiveNumber, ErrorBoundary } from '@cosmichub/ui';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

// Local cn utility
const cn = (...inputs: (string | undefined | null | boolean | object)[]) => {
  return twMerge(clsx(inputs));
};

interface CymaticsVisualizerProps {
  frequency: number; // Current frequency in Hz (validated > 0)
  isPlaying: boolean; // Whether audio is active
  audioContext?: AudioContext; // Optional: Pass from useHealwave for analyser
}

const CymaticsVisualizer: React.FC<CymaticsVisualizerProps> = ({
  frequency,
  isPlaying,
  audioContext,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  // Simple performance tracking
  const trackPerformance = useCallback((_name: string) => {
    // Performance tracking disabled for production
  }, []);

  // Type guard for valid frequency
  const isValidFrequency = useCallback((freq: number): freq is number => isPositiveNumber(freq) && freq <= 20000, []);

  const canvasCtx = useMemo(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    return ctx;
  }, []);

  // Setup AnalyserNode for real-time frequency data
  useEffect(() => {
    if (!audioContext || !isValidFrequency(frequency)) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Balanced for performance
    analyserRef.current = analyser;

    // Connect to source (assume passed or created oscillator in parent)
    // In integration: Connect oscillator from useHealwave to this analyser

    return () => {
      analyserRef.current?.disconnect();
      analyserRef.current = null;
    };
  }, [audioContext, frequency, isValidFrequency]);

  // Render cymatics pattern: Simulate Chladni figures based on frequency
  const drawCymatics = useCallback(() => {
    if (!canvasCtx || !isPlaying || !analyserRef.current) return;

    trackPerformance('cymatics-render'); // Monitor FPS

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvasCtx;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    // Clear canvas with subtle gradient background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(0, 50, 100, 0.1)');
    gradient.addColorStop(1, 'rgba(100, 200, 255, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get frequency data for reactivity
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const avgFreq = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;

    // Simulate nodal lines: Parametric equations for patterns (e.g., circle, square waves modulated by freq)
    const time = Date.now() * 0.001; // Animate over time
    const waveSpeed = frequency / 100; // Scale animation to frequency
    const numLines = Math.floor(frequency / 50) % 20 + 10; // Dynamic based on freq (e.g., higher freq = more complex)

    ctx.strokeStyle = `hsl(${ (frequency / 20) % 360 }, 70%, 60%)`; // Color by frequency
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (let i = 0; i < numLines; i++) {
      ctx.beginPath();
      for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
        const r = radius * (0.5 + 0.5 * Math.sin(angle * numLines + time * waveSpeed + i));
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (angle === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // Modulate opacity with audio data
      ctx.globalAlpha = 0.3 + (avgFreq / 255) * 0.7;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    animationRef.current = requestAnimationFrame(drawCymatics);
  }, [canvasCtx, isPlaying, frequency, trackPerformance]);

  useEffect(() => {
    if (isPlaying && canvasCtx) {
      drawCymatics();
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [drawCymatics, isPlaying, canvasCtx]);

  // Resize handler for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isValidFrequency(frequency)) {
    return <div className={cn('text-center text-muted-foreground')}>Invalid frequency for visualization.</div>;
  }

  return (
    <ErrorBoundary fallback={<div>Visualization error: Failed to render cymatics.</div>}>
      <div className={cn('relative w-full h-64 md:h-96 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-lg overflow-hidden')}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          aria-label={`Cymatics visualization showing vibration patterns at ${frequency} Hz`}
          role="img"
          aria-describedby="cymatics-tooltip"
        />
        <div className="absolute bottom-2 right-2 text-xs text-white/60 bg-black/50 px-2 py-1 rounded">
          Cymatics: Sound made visible
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(CymaticsVisualizer); // Memoize for performance