'use client';
import { Eye, EyeOff, Volume2, VolumeX, Type, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

// Skip to main content link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="fixed left-4 top-4 z-[100] rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white opacity-0 focus:opacity-100 focus:outline-none"
    >
      跳转到主要内容
    </a>
  );
}

// High contrast mode toggle
export function HighContrastToggle() {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  return (
    <button
      onClick={() => setHighContrast(!highContrast)}
      className="rounded-lg p-2 text-[#57534e] transition-colors hover:bg-black/5 dark:text-[#a8a29e] dark:hover:bg-white/5"
      aria-label={highContrast ? '关闭高对比度模式' : '开启高对比度模式'}
      title={highContrast ? '关闭高对比度' : '高对比度'}
    >
      {highContrast ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

// Font size adjuster
export function FontSizeAdjuster() {
  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const decrease = () => setFontSize((s) => Math.max(80, s - 10));
  const increase = () => setFontSize((s) => Math.min(120, s + 10));
  const reset = () => setFontSize(100);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="字体大小调整">
      <button
        onClick={decrease}
        disabled={fontSize <= 80}
        className="rounded p-1 text-[#57534e] hover:bg-black/5 disabled:opacity-30 dark:text-[#a8a29e] dark:hover:bg-white/5"
        aria-label="减小字体"
      >
        <Minus size={14} />
      </button>
      <button
        onClick={reset}
        className="min-w-[40px] rounded px-1 py-0.5 text-xs text-[#737373] hover:bg-black/5 dark:text-[#78716c] dark:hover:bg-white/5"
        aria-label="重置字体大小"
      >
        {fontSize}%
      </button>
      <button
        onClick={increase}
        disabled={fontSize >= 120}
        className="rounded p-1 text-[#57534e] hover:bg-black/5 disabled:opacity-30 dark:text-[#a8a29e] dark:hover:bg-white/5"
        aria-label="增大字体"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

// Screen reader only text
export function SrOnly({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0"
      style={{ clip: 'rect(0, 0, 0, 0)' }}
    >
      {children}
    </span>
  );
}

// Focus trap for modals
export function FocusTrap({
  children,
  isActive,
}: {
  children: React.ReactNode;
  isActive: boolean;
}) {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = document.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [isActive]);

  return <>{children}</>;
}
