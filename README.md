# 玄语 XuanYu

传统文化命理工具站（八字排盘、紫微斗数、塔罗占卜、六爻、梅花易数、每日运势、合婚配对等），基于 Next.js 16 App Router 构建。

## 一键部署到你的站点

**点这个按钮**，按提示填 2 个 Supabase 密钥即可完成代码部署（约 3 分钟；数据库初始化见下方"② 初始化数据库"）：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwyoming2021%2Fxuanxue&env=NEXT_PUBLIC_SUPABASE_URL%2CSUPABASE_SERVICE_ROLE_KEY%2CAUTH_SECRET%2CNEXT_PUBLIC_SITE_URL)

三步建站（Vercel 零配置托管）：

1. **点上面的按钮** → 登录 Vercel → 填 `NEXT_PUBLIC_SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`，`AUTH_SECRET` 用 Vercel 的 Generate 按钮生成一个（或任意 ≥32 位随机串）→ Deploy
2. **初始化数据库**：打开 https://supabase.com → SQL Editor → 整段粘贴执行 [`supabase/init.sql`](supabase/init.sql)（已合并，一次完成）
3. **绑定你自己的域名**：Vercel → Project → Settings → Domains

**有自己的 VPS？** 一条命令自动部署（装 Docker → 拉代码 → 构建 → Nginx → HTTPS）。提供 Supabase Token 还能**自动创建数据库并执行 SQL**：

```bash
sudo XUANYU_SUPABASE_TOKEN=你的PersonalAccessToken \
     XUANYU_DOMAIN=example.com \
     bash -c "$(curl -fsSL https://raw.githubusercontent.com/wyoming2021/xuanxue/master/scripts/vps-deploy.sh)"
```

**更省事**：用可视化向导，只填域名 + VPS 信息 + Supabase Token 即可自动部署：

```bash
cd deploy-wizard && npm install && npm start
```

详见 [`docs/VPS_DEPLOYMENT.md`](docs/VPS_DEPLOYMENT.md) 与 [`deploy-wizard/README.md`](deploy-wizard/README.md)。

本地体验：`npm install` → `npm run setup`（交互式生成 `.env.local`）→ `npm run dev`。

只要计算引擎的话直接用 [`packages/xuanyu-core`](packages/xuanyu-core)。详细步骤见 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

## 功能

- **八字排盘**：四柱、五行、大运流年分析，付费解锁详细报告
- **紫微斗数 / 星盘 / 六爻 / 梅花易数 / 雷诺曼 / 灵签 / 合婚 / 择日**
- **塔罗占卜**：单张 / 三张 / 凯尔特十字牌阵，付费解锁详细解读
- **每日运势**：12 星座每日四维运势
- **会员体系**：邮箱验证码登录，日 / 月 / 年卡会员，跨设备同步
- **支付**：虎皮椒（xunhupay）网关，服务端产品目录定价
- **文章发布**：站长后台写文章（`/admin/articles`），前台列表/详情展示（`/articles`），配置 `ADMIN_EMAIL` 启用

## 技术栈

- Next.js 16（App Router，webpack 模式）+ React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui 风格组件
- Supabase（PostgreSQL）+ service role 服务端访问（业务表已启用 RLS）
- jose（JWT 会话）+ nodemailer（QQ 邮箱 SMTP 验证码）
- Jest 单测 + Playwright e2e

## 快速开始

```bash
npm install
# 配置 .env.local（见下表）
npm run dev                 # http://localhost:3000
```

## 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 是 | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 是 | service role 密钥（仅服务端使用，勿泄露） |
| `AUTH_SECRET` | 生产必填 | JWT 会话签名密钥，≥32 字符，缺失时生产环境 fail-fast |
| `HUPIJAO_APP_ID` / `HUPIJAO_APP_SECRET` | 上线必填 | 虎皮椒支付凭证，未配置时支付走演示模式 |
| `HUPIJAO_NOTIFY_URL` | 否 | 支付回调地址，默认 `{SITE_URL}/api/payment/callback` |
| `QQ_EMAIL_USER` / `QQ_EMAIL_AUTH_CODE` | 是 | QQ 邮箱 SMTP，用于发送登录验证码 |
| `NEXT_PUBLIC_SITE_URL` | 否 | 站点地址，用于支付回跳与回调 |

## 数据库迁移

```bash
# 在 Supabase SQL Editor 中依次执行
supabase/migrations/001_initial.sql                  # 基础表
supabase/migrations/002_add_otp_and_auth.sql         # OTP 登录
supabase/migrations/003_rls_and_orders_product.sql   # RLS + orders.product_key + 唯一索引
```

> ⚠️ 上线收款前必须确认 003 已在生产库执行：所有业务表启用 RLS 且对 anon/authenticated 全量拒绝，业务读写一律走服务端 service role。

## 常用命令

```bash
npm run lint        # ESLint
npm run type-check  # tsc --noEmit
npm run test        # Jest 单测
npm run build       # 生产构建
npm run e2e         # Playwright（需本地服务运行，谨慎执行）
```

## 安全要点（修改支付相关代码前必读）

- 客户端只能传 `productKey`，金额一律由 `lib/payment-products.ts` 服务端目录决定
- `orders.id` 是 PostgreSQL UUID，订单 ID 用 `crypto.randomUUID()`
- 虎皮椒接口路径是 `creat`（官方拼写，勿"修正"为 create）
- 回调验签用 `crypto.timingSafeEqual`，且回调金额（分）必须与订单金额一致
- 匿名归属链：`deviceId → users.device_id → users.id → record.user_id`（业务表没有 `device_id` 字段）
- `daily_fortunes` 是 `(zodiac, fortune_date)` 公共记录，单次解锁状态查 `orders` 表，不要写 `daily_fortunes.is_unlocked`

## 作为 SDK / Skill 使用

本项目核心计算引擎已抽成独立包，两种安装使用方式：

**npm 包（面向开发者）**——`packages/xuanyu-core`，纯 TypeScript、无框架依赖：

```bash
cd packages/xuanyu-core && npm run build
npm publish   # 需要 npm 账号；或直接 npm i <本地路径> 试用
```

```js
import { calculateBazi, drawTarot } from 'xuanyu-core';
calculateBazi({ birthDate: '1995-08-15', birthTime: '午时', gender: 'male' });
```

**AI 助手 Skill（面向 ZCode / Claude Code 用户）**——`skills/xuanyu/`，自包含（内嵌编译产物 + CLI）。把 `skills/xuanyu/` 文件夹复制到助手的 skills 目录（ZCode 为 `~/.agents/skills/`），按 SKILL.md 首次 `npm install --prefix <skill>/scripts/xuanyu-core --omit=dev` 一次即可，之后助手就能响应"帮我排个八字/抽张塔罗牌"等请求，完全离线计算。

## CI/CD

GitHub Actions workflow（`.github/workflows/ci.yml`）在每次 PR 和 push 到 `main` 时运行：
lint → type-check → Jest（含覆盖率）→ Playwright e2e → `npm audit --audit-level=high`。

部署到 Vercel 需配置 Secrets：`VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID`。
