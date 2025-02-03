import { useEffect, useState, useRef } from 'react';

interface TimerProps {
  startTime: number;
}

export function Timer({ startTime }: TimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const lastUpdateRef = useRef(Date.now());
  const accelerationFactorRef = useRef(1);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now(), diff = now - lastUpdateRef.current, factor = accelerationFactorRef.current;
      setElapsedTime(prev => prev + (diff * factor) / 1000);
      lastUpdateRef.current = now;
    };

    const updateFocus = (focused: boolean) => {
      setIsWindowFocused(focused);
      lastUpdateRef.current = Date.now();
      accelerationFactorRef.current = focused ? 1 : 10;
    };

    const handleVisibilityChange = () => updateFocus(!document.hidden);
    const handleFocus = () => updateFocus(true);
    const handleBlur = () => updateFocus(false);

    setElapsedTime((Date.now() - startTime) / 1000);
    const timerId = setInterval(updateTimer, 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [startTime]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="relative">
      <div className="flex items-center justify-center space-x-2">
        <div className={`text-sm font-medium transition-colors duration-300 ${isWindowFocused ? 'text-neutral-900' : 'text-red-600'}`}>
          Tiempo Transcurrido: {formatTime(elapsedTime)}
          {!isWindowFocused && <span className="ml-2 text-xs text-red-500">(10x más rápido)</span>}
        </div>
      </div>
    </div>
  );
}
