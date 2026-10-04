'use client';

import { Mail, LogOut, Loader2, ArrowLeft, Crown, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDeviceId } from '@/lib/device';

interface LoginDialogProps {
  user: {
    userId: string;
    email: string;
    isVip: boolean;
    remainingDays: number;
  } | null;
  onLogin: () => void;
  onLogout: () => void;
}

type Step = 'email' | 'otp' | 'success';

export function LoginDialog({ user, onLogin, onLogout }: LoginDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
        setCountdown(60);
        // Focus first OTP input
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || '发送失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, rawValue: string) => {
    const value = rawValue.length > 1 ? rawValue.slice(-1) : rawValue;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newOtp.every((d) => d !== '') && value) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, deviceId: getDeviceId() }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('success');
        setTimeout(() => {
          setOpen(false);
          resetForm();
          onLogin();
        }, 1500);
      } else {
        setError(data.error || '验证失败');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await onLogout();
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setOtp(['', '', '', '', '', '']);
    setError('');
    setCountdown(0);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  // Logged-in state
  if (user) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              className="gap-2 text-[#57534e] hover:bg-black/5 dark:text-[#a8a29e] dark:hover:bg-white/5"
            />
          }
        >
          <Mail size={16} />
          <span className="hidden sm:inline max-w-[100px] truncate">
            {user.email.split('@')[0]}
          </span>
          {user.isVip && <Crown size={14} className="text-amber-500" />}
        </DialogTrigger>
        <DialogContent className="max-w-sm border-black/10 bg-white dark:border-white/10 dark:bg-[#1a1a1a]">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">账号信息</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="rounded-xl bg-[#fafaf9] p-4 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                  <Mail size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="font-medium">{user.email}</div>
                  {user.isVip ? (
                    <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <Crown size={12} />
                      会员 · 剩余 {user.remainingDays} 天
                    </div>
                  ) : (
                    <div className="text-xs text-[#a3a3a3]">普通用户</div>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <LogOut size={16} />
              退出登录
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Login form
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            className="gap-2 text-[#57534e] hover:bg-black/5 dark:text-[#a8a29e] dark:hover:bg-white/5"
          />
        }
      >
        <Mail size={16} />
        <span className="hidden sm:inline">登录</span>
      </DialogTrigger>
      <DialogContent className="max-w-sm border-black/10 bg-white dark:border-white/10 dark:bg-[#1a1a1a]">
        {step === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle size={48} className="mx-auto text-green-500" />
            <h3 className="mt-4 font-serif text-lg font-bold">登录成功</h3>
            <p className="mt-1 text-sm text-[#737373]">欢迎回来！</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-serif text-lg">
                {step === 'otp' && (
                  <button
                    onClick={() => {
                      setStep('email');
                      setError('');
                    }}
                    className="rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                {step === 'email' ? '登录 / 注册' : '输入验证码'}
              </DialogTitle>
              <p className="text-sm text-[#737373] dark:text-[#78716c]">
                {step === 'email' ? '输入邮箱，我们将发送验证码' : `验证码已发送至 ${email}`}
              </p>
            </DialogHeader>

            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {step === 'email' ? (
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm">
                    邮箱地址
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                    className="mt-1.5"
                    autoFocus
                  />
                </div>
                <Button
                  onClick={handleSendOtp}
                  disabled={loading || !email}
                  className="w-full bg-[#1c1917] text-white hover:bg-[#292524] dark:bg-[#e7e5e4] dark:text-[#1c1917]"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '发送验证码'}
                </Button>
                <p className="text-center text-[10px] leading-relaxed text-[#a3a3a3]">
                  登录即表示同意
                  <a href="/terms" className="mx-0.5 underline hover:text-[#57534e]">
                    《用户协议》
                  </a>
                  与
                  <a href="/privacy" className="mx-0.5 underline hover:text-[#57534e]">
                    《隐私政策》
                  </a>
                  。验证码 5 分钟内有效。
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-12 w-10 rounded-lg border border-black/10 bg-[#fafaf9] text-center text-lg font-bold dark:border-white/10 dark:bg-white/[0.02]"
                      disabled={loading}
                    />
                  ))}
                </div>
                {loading && (
                  <div className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-[#a3a3a3]" />
                  </div>
                )}
                <div className="text-center">
                  {countdown > 0 ? (
                    <span className="text-sm text-[#a3a3a3]">{countdown}s 后可重新发送</span>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      重新发送验证码
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
