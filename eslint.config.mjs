import nextConfig from 'eslint-config-next';

// 自定义规则注入到 next 配置（该配置已注册 react/react-hooks/import/jsx-a11y/@next/next
// 全部插件）。如果放在独立 config 对象里引用插件规则，ESLint 9 flat config
// 会因该对象未注册插件而报 "could not find plugin"。
const nextCfg = nextConfig.find((c) => c && typeof c === 'object' && c.rules);
if (nextCfg) {
  nextCfg.rules = {
    ...(nextCfg.rules || {}),
    // Prevent mutation
    'no-param-reassign': ['error', { props: false }],
    'prefer-const': 'error',
    'no-var': 'error',
    // Import ordering
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  };
}

const config = [
  ...nextConfig,
  {
    // 构建产物与 vendored 依赖不参与 lint
    ignores: ['packages/*/dist/**', 'skills/**/dist/**', 'skills/**/node_modules/**'],
  },
];

export default config;