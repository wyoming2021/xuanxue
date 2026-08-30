'use client';
import { useState, useEffect } from 'react';

interface ShuffleAnimationProps {
  onComplete: () => void;
  duration?: number;
}

export function ShuffleAnimation({ onComplete, duration = 2000 }: ShuffleAnimationProps) {
  const [stage, setStage] = useState<'shuffling' | 'dealing' | 'revealing'>('shuffling');

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('dealing'), duration * 0.5);
    const timer2 = setTimeout(() => setStage('revealing'), duration * 0.8);
    const timer3 = setTimeout(() => onComplete(), duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [duration, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Card stack animation */}
        <div className="relative mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`absolute left-1/2 h-32 w-20 -translate-x-1/2 rounded-xl border-2 border-indigo-400 bg-gradient-to-br from-indigo-600 to-purple-700 shadow-xl transition-all duration-300 ${
                stage === 'shuffling'
                  ? `rotate-${i * 10 - 20} translate-y-${i * 2}`
                  : stage === 'dealing'
                    ? `rotate-0 translate-y-0 scale-110`
                    : 'rotate-0 translate-y-0 scale-100 opacity-0'
              }`}
              style={{
                animationDelay: `${i * 100}ms`,
                transform:
                  stage === 'shuffling'
                    ? `translateX(-50%) rotate(${(i - 2) * 15}deg) translateY(${i * 4}px)`
                    : stage === 'dealing'
                      ? 'translateX(-50%) rotate(0) translateY(-20px) scale(1.1)'
                      : 'translateX(-50%) rotate(0) translateY(0) scale(1)',
              }}
            >
              <div className="flex h-full items-center justify-center text-2xl">✨</div>
            </div>
          ))}
        </div>

        {/* Text */}
        <div className="mt-16 text-white">
          {stage === 'shuffling' && <p className="animate-pulse text-lg font-medium">洗牌中...</p>}
          {stage === 'dealing' && <p className="text-lg font-medium">发牌中...</p>}
          {stage === 'revealing' && <p className="text-lg font-medium">揭示命运...</p>}
        </div>

        {/* Loading dots */}
        <div className="mt-4 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
