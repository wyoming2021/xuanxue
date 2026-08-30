// Constants for the Xuanyu Tools site
export const IMAGE_SIZES = {
  // Next.js image optimizer breakpoints
  thumbnail: 320,
  small: 640,
  medium: 768,
  large: 1024,
  xlarge: 1280,
} as const;

export const CACHE_DURATIONS = {
  // SWR revalidate intervals (in seconds)
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
} as const;

export const TAROT_SPREAD_TYPES = ['single', 'three', 'celtic'] as const;
export type TarotSpreadType = (typeof TAROT_SPREAD_TYPES)[number];

export const API_ENDPOINTS = {
  tarot: '/api/tarot',
  bazI: '/api/bazi',
  // add others as needed
} as const;
