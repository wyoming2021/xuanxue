declare module 'lunar-javascript' {
  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar;
    getLunar(): Lunar;
  }
  export class Lunar {
    getEightChar(): EightChar;
  }
  export class EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getHiddenStems(): string[];
    getYearNaYin(): string;
    getMonthNaYin(): string;
  }
  export class LunarYear {
    static fromYear(year: number): LunarYear;
  }
  export class LunarMonth {
    static fromYm(year: number, month: number): LunarMonth;
  }
  export class LunarDay {
    static fromYmd(year: number, month: number, day: number): LunarDay;
  }
}
