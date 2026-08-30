'use client';
import { Share2, Copy, Check, ExternalLink, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  description: string;
  url?: string;
}

export function ShareButton({ title, description, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title} - ${description}`);
    const urlEncoded = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${urlEncoded}`, '_blank');
    setShowMenu(false);
  };

  const shareToWechat = () => {
    // 复制链接，用户可以粘贴到微信
    handleCopy();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#57534e] transition-all hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-[#a8a29e] dark:hover:bg-white/10"
      >
        <Share2 size={16} />
        分享
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-black/10 bg-white p-2 shadow-lg dark:border-white/10 dark:bg-[#1a1a1a]">
          <button
            onClick={handleCopy}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#57534e] transition-colors hover:bg-black/5 dark:text-[#a8a29e] dark:hover:bg-white/5"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? '已复制' : '复制链接'}
          </button>
          <button
            onClick={shareToTwitter}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#57534e] transition-colors hover:bg-black/5 dark:text-[#a8a29e] dark:hover:bg-white/5"
          >
            <ExternalLink size={16} className="text-blue-400" />
            分享到 Twitter
          </button>
          <button
            onClick={shareToWechat}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#57534e] transition-colors hover:bg-black/5 dark:text-[#a8a29e] dark:hover:bg-white/5"
          >
            <MessageCircle size={16} className="text-green-500" />
            复制到微信
          </button>
        </div>
      )}
    </div>
  );
}
