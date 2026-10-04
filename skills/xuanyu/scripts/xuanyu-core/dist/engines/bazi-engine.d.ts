import type { BaziResult } from '../types.js';
export declare function timeToHourIndex(timeStr: string): number;
export declare function calculateBazi(params: {
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
}): BaziResult;
