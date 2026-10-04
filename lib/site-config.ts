/**
 * 站点级可配置项：部署者通过环境变量切换为自己的域名/品牌，
 * 不再硬编码到 robots/sitemap/JSON-LD 等文件里。
 *
 * - NEXT_PUBLIC_SITE_URL：部署域名（如 https://example.com），用于 sitemap、
 *   robots、结构化数据、支付回跳
 * - NEXT_PUBLIC_SITE_NAME：站点名（默认保留"玄语"作为模板品牌）
 * - NEXT_PUBLIC_SUPPORT_EMAIL：错误页联系邮箱
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://xuanyu.app').replace(
  /\/$/,
  '',
);

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || '玄语';

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@xuanyu.app';
