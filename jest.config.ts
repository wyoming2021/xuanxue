import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // NodeNext 风格的相对导入带 .js 后缀，ts-jest 下映射回无后缀以解析 .ts 源码
    '^(\\.{1,2})/(.*)\\.js$': '$1/$2',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  testPathIgnorePatterns: ['/e2e/', '/node_modules/'],
  collectCoverage: true,
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/page.tsx',
    '!app/layout.tsx',
    '!app/not-found.tsx',
    '!app/error.tsx',
    '!app/robots.ts',
    '!app/sitemap.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};

export default config;
