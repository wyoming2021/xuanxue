// Types for Tarot feature
export interface TarotCard {
  id: number;
  name: string;
  position: 'upright' | 'reversed';
  positionName: string;
  keyword: string;
  uprightReading?: string;
  reversedReading?: string;
  uprightKeywords?: string[];
  reversedKeywords?: string[];
  element?: string;
  astrology?: string;
}
