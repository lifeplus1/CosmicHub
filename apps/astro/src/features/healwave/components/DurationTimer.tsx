/**
 * DurationTimer component for Healwave sessions
 * Displays and manages countdown timer for audio frequency sessions
 */

import React, { useState, useEffect, useRef } from 'react';

interface DurationTimerProps {
    duration: number; // in seconds
    isRunning: boolean;
    onComplete?: () => void;
    onTick?: (remaining: number) => void;
    className?: string;
}

export const DurationTimer: React.FC<DurationTimerProps> = ({
    duration,
    isRunning,
    onComplete,
    onTick,
    className = ''
}) => {
    const [remaining, setRemaining] = useState(duration);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setRemaining(duration);
    }, [duration]);

    useEffect(() => {
        if (isRunning && remaining > 0) {
            intervalRef.current = setInterval(() => {
                setRemaining(prev => {
                    const next = prev - 1;
                    if (onTick !== undefined) onTick(next);
                    if (next <= 0) {
                        if (intervalRef.current !== null) clearInterval(intervalRef.current);
                        if (onComplete !== undefined) onComplete();
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        } else if (!isRunning && intervalRef.current !== null) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current !== null) clearInterval(intervalRef.current);
        };
    }, [isRunning, remaining, onComplete, onTick]);

    // Format seconds to mm:ss
    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <span className="font-mono text-lg">{formatTime(remaining)}</span>
            {isRunning && <span className="text-green-500 animate-pulse">●</span>}
        </div>
    );
};

export default DurationTimer;
