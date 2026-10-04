# 从零部署一个玄学网站（部署手册）

本仓库是一个完整可部署的玄学工具站模板：八字排盘、紫微斗数、星盘、六爻、梅花易数、合婚、塔罗、每日运势 + 邮箱登录 + 会员/单次付费。按本手册操作，约 30 分钟可得到一个属于你自己的站点。

> 所有命理内容仅供娱乐与文化参考。站点已内置免责声明、隐私政策与用户协议页面，上线前请阅读第 8 节合规提醒。

---

## 1. 前置条件

| 需要 | 用途 | 是否免费 |
|---|---|---|
| Node.js ≥ 18 | 本地开发/构建 | ✅ |
| Git + 一个代码托管账号 | 存放代码 | ✅ |
| [Supabase](https://supabase.com) 账号 | 数据库（用户/订单/记录） | ✅ 免费档够用 |
| [Vercel](https://vercel.com) 账号（或其他 Node 主机） | 部署 | ✅ 免费档够用 |
| QQ 邮箱 | 登录验证码邮件 | ✅ |
| 虎皮椒商户账号 | 收款（可选，不配则支付为演示模式） | 按其费率 |

## 2. 获取代码并安装

```bash
git clone <本仓库地址> my-fortune-site
cd my-fortune-site
npm install
```

## 3. 先跑起来（无数据库模式）

不配置数据库也可以先看界面：

```bash
cp .env.example .env.local   # 若无 .env.example，手动创建空文件即可
npm run dev
```

打开 http://localhost:3000 —— 所有排盘功能可用（记录保存在浏览器本地）。此模式下登录、支付、跨设备同步不可用。

## 4. 配置数据库（Supabase）

1. 登录 Supabase → **New project**，记下数据库密码
2. 进入项目 → **SQL Editor**，依次粘贴执行以下三个文件的内容（都在仓库 `supabase/migrations/` 目录）：
   1. `001_initial.sql` —— 基础表（用户/订单/排盘记录等）
   2. `002_add_otp_and_auth.sql` —— 邮箱验证码登录
   3. `003_rls_and_orders_product.sql` —— **行级安全（必须执行）**，防止数据库被匿名读写
3. 进入 **Project Settings → API**，拿到：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` 密钥 → `SUPABASE_SERVICE_ROLE_KEY`（**绝不泄露、绝不放进前端代码**）

自检：配置完成后，用 anon key 直接查 `users` 表应当被拒绝——被拒绝说明 RLS 生效。

## 5. 环境变量

写入 `.env.local`（本地）与 Vercel 项目设置（线上）：

| 变量 | 必填 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | 第 4 步的 Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | 第 4 步的 service_role 密钥 |
| `AUTH_SECRET` | ✅ | 随机字符串 ≥32 位，会话签名密钥。生成：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | ✅ 上线 | 你的域名，如 `https://mysite.com`（用于 sitemap/SEO/支付回跳） |
| `QQ_EMAIL_USER` | 登录必填 | 发验证码的 QQ 邮箱 |
| `QQ_EMAIL_AUTH_CODE` | 登录必填 | QQ 邮箱 SMTP 授权码（QQ邮箱→设置→账户→开启SMTP→生成授权码） |
| `HUPIJAO_APP_ID` / `HUPIJAO_APP_SECRET` | 收款必填 | 虎皮椒商户凭证（不配则支付按钮进入演示模式） |
| `HUPIJAO_NOTIFY_URL` | 可选 | 支付回调地址，默认 `{SITE_URL}/api/payment/callback` |
| `NEXT_PUBLIC_SITE_NAME` | 可选 | 站点名（默认"玄语"，见第 7 节品牌替换） |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | 可选 | 错误页联系邮箱 |

## 6. 部署上线（Vercel 为例）

1. 把代码推到 GitHub/Gitee
2. Vercel → **Add New Project** → 导入仓库
3. Framework 选 Next.js，构建命令默认；把第 5 节变量配到 **Environment Variables**
4. Deploy，绑定你的域名
5. 上线验收清单：
   - [ ] 首页/各排盘页能打开
   - [ ] 邮箱能收到验证码并能登录
   - [ ] 排盘记录刷新后仍在（说明数据库写入成功）
   - [ ] `https://你的域名/sitemap.xml` 内容是你的域名
   - [ ] 若配了支付：用最低价商品真实支付一单，确认回调后内容解锁（见 `HANDOFF_FIX_STATUS.md` 第 10 节验收标准）

## 7. 品牌替换清单

把站点变成"你的"：

| 位置 | 改什么 |
|---|---|
| 环境变量 | `NEXT_PUBLIC_SITE_NAME`（站点名）、`NEXT_PUBLIC_SITE_URL`（域名）、`NEXT_PUBLIC_SUPPORT_EMAIL` |
| `app/layout.tsx` | 网站标题、描述、icon |
| `components/Header.tsx` / `components/Footer.tsx` | Logo 文案、导航 |
| `public/` | favicon、logo 图片 |
| `app/privacy/page.tsx`、`app/terms/page.tsx` | 把运营主体、联系方式改成你的真实信息 |
| `app/page.tsx` | 首页文案（注意：用户评价区块是示例文案，建议删除或替换为真实内容，勿作虚假宣传） |
| `lib/payment-products.ts` | 商品与价格（改这里即可，客户端报价会自动跟随） |

## 8. 合规提醒（重要）

- 站点内容定位为"传统文化/娱乐参考"，免责声明已内置在每页 Footer，**不要删除**
- 在中国大陆经营付费玄学类服务存在监管不确定性（封建迷信相关内容限制、支付通道风控）。上线收费前建议：了解支付服务商对此类内容的政策、必要时咨询当地监管或法律专业人士。本手册不构成法律意见
- 不要在站点收集与功能无关的个人信息；隐私政策页请按你的实际数据实践修改

## 9. 常见问题

**Q: `npm install` 报 `UNABLE_TO_VERIFY_LEAF_SIGNATURE`**
你的网络环境有 TLS 代理/证书拦截。换网络、配置 npm 镜像或 `npm config set strict-ssl false`（用完改回）。

**Q: 支付按钮显示"演示模式"**
未配置虎皮椒凭证，属预期行为。配置后即接入真实支付。

**Q: 登录验证码收不到**
检查 QQ 邮箱 SMTP 授权码是否正确；服务器日志搜 `[send-otp]`；同一邮箱 60 秒内只能发一次，同 IP 每小时限 10 封。

**Q: 想只要计算引擎，不要整个网站**
用 `packages/xuanyu-core`（纯 TypeScript 库 + CLI），见该目录 README；`skills/xuanyu/` 是给 AI 助手用的离线版本。

**Q: 数据库结构要改？**
在 `supabase/migrations/` 新增 `004_xxx.sql`，同样在 SQL Editor 执行，保持迁移可追溯。
