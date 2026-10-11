/**
 * 梅花易数引擎单测（P3-5 补全）。
 */
import { castMeihua } from '../lib/meihua-engine';

describe('meihua-engine', () => {
  describe('castMeihua', () => {
    it('返回上下卦与变卦', () => {
      const result = castMeihua('问事业发展', 'time');
      expect(result.upperGua.name).toBeTruthy();
      expect(result.lowerGua.name).toBeTruthy();
      expect(result.changedGua.name).toBeTruthy();
      expect(result.method).toBe('时间起卦');
    });

    it('返回体用关系', () => {
      const result = castMeihua('问合作', 'time');
      expect(result.tiYong.tiGua).toBeTruthy();
      expect(result.tiYong.yongGua).toBeTruthy();
      expect(result.tiYong.tiElement).toBeTruthy();
      expect(result.tiYong.yongElement).toBeTruthy();
      expect(result.relation.type).toBeTruthy();
      expect(result.relation.description).toBeTruthy();
      expect(result.relation.advice).toBeTruthy();
    });

    it('返回综合判断、应期、方位与简要解读', () => {
      const result = castMeihua('问近期运势', 'time');
      expect(result.judgement).toBeTruthy();
      expect(result.briefComment).toBeTruthy();
      expect(result.yingqi).toBeTruthy();
      expect(result.direction).toBeTruthy();
    });
  });
});
