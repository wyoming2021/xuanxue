'use client';
import { ArrowLeft, Loader2, CreditCard, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Breadcrumb, BREADCRUMBS } from '@/components/Breadcrumb';
import { QuestionSuggestions } from '@/components/QuestionSuggestions';
import { ShuffleAnimation } from '@/components/ShuffleAnimation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getDeviceId } from '@/lib/device';
import { SPREAD_CONFIGS, TAROT_CARDS } from '@/lib/tarot-data';

import TarotContainer from './TarotContainer';
import { LoadingSpinner } from '../components/ui/loading-spinner';

export default function TarotPage() {
  return <TarotContainer />;
}
