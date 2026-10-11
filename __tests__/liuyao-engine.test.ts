/**
 * 六爻引擎单测（P3-5 补全）。
 */
import { castLiuyao } from '../lib/liuyao-engine';

describe('liuyao-engine', () => {
  describe('castLiuyao', () => {
    it('返回 6 条爻，且爻位 1-6 连续', () => {
      const result = castLiuyao('问近期工作运势');
      expect(result.hexagram.lines).toHaveLength(6);
      result.hexagram.lines.forEach((line, i) => {
        expect(line.position).toBe(i + 1);
        expect(['老阴', '少阴', '少阳', '老阳']).toContain(line.nature);
        expect([6, 7, 8, 9]).toContain(line.coinSum);
      });
    });

    it('返回主卦信息（卦名/卦辞/卦象）', () => {
      const result = castLiuyao('问近期工作运势');
      expect(result.hexagram.name).toBeTruthy();
      expect(result.hexagram.judgement).toBeTruthy();
      expect(result.hexagram.image).toBeTruthy();
      expect(result.hexagram.meaning).toBeTruthy();
      expect(result.hexagram.advice).toBeTruthy();
      expect(result.hexagram.upperGua).toBeTruthy();
      expect(result.hexagram.lowerGua).toBeTruthy();
    });

    it('返回综合判断和简要解读', () => {
      const result = castLiuyao('问感情');
      expect(result.judgement).toBeTruthy();
      expect(result.briefComment).toBeTruthy();
    });

    it('变卦可选：无动爻时 changingHexagram 为 undefined 或对象', () => {
      const result = castLiuyao('问出行');
      if (result.hexagram.lines.some((l) => l.moving)) {
        expect(result.changingHexagram).toBeDefined();
        if (result.changingHexagram) {
          expect(result.changingHexagram.name).toBeTruthy();
        }
      } else {
        expect(result.changingHexagram).toBeUndefined();
      }
    });
  });
});
