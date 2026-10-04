import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    // 构建产物与 vendored 依赖不参与 lint
    ignores: ['packages/*/dist/**', 'skills/**/dist/**', 'skills/**/node_modules/**'],
  },
  {
    rules: {
      // Prevent mutation
      'no-param-reassign': ['error', { props: false }],
      'prefer-const': 'error',
      'no-var': 'error',
      // React hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Import ordering
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
];

export default config;