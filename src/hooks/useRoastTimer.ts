import { useState, useRef, useCallback, useEffect } from 'react';

interface UseRoastTimerReturn {
  elapsedTime: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  formatTime: (seconds: number) => string;
}

export const useRoastTimer = (): UseRoastTimerReturn => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    setElapsedTime(0);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current + pausedTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 100);
  }, [clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const pause = useCallback(() => {
    if (isRunning) {
      clearTimer();
      pausedTimeRef.current += Date.now() - startTimeRef.current;
      setIsRunning(false);
    }
  }, [isRunning, clearTimer]);

  const resume = useCallback(() => {
    if (!isRunning && pausedTimeRef.current > 0) {
      startTimeRef.current = Date.now();
      setIsRunning(true);

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current + pausedTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }, 100);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    clearTimer();
    setElapsedTime(0);
    setIsRunning(false);
    pausedTimeRef.current = 0;
  }, [clearTimer]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    elapsedTime,
    isRunning,
    start,
    stop,
    pause,
    resume,
    reset,
    formatTime,
  };
};
