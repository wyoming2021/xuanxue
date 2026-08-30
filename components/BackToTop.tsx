'use client';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#1c1917] text-white shadow-lg transition-all hover:bg-[#292524] hover:shadow-xl dark:bg-[#e7e5e4] dark:text-[#1c1917] dark:hover:bg-white"
      aria-label="返回顶部"
    >
      <ArrowUp size={20} />
    </button>
  );
}
