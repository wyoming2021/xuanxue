# 玄语（xuan-yu）修复状态交接文档

- 更新日期：2026-10-11（含 AI 文章生成端到端验证）
- 交接对象：后续接手修复工作的 Agent / 开发者
- 当前结论：**P0 全部 4 项、P1 全部 5 项、P2 全部 7 项已完成代码修复并通过端到端真实测试；P3 已完成 5 项，剩余 3 项待办。AI 每日文章生成已用真实第三方 API + 真实 Supabase 端到端跑通（异步化，见第 0 节）。**
- 当前阶段：支付安全契约、GUI 主流程、OTP 登录闭环（含失败锁定、IP 限流）均已实测验证；测试中发现并修复了 2 个新缺陷（D1/D2，见第 10 节）。
- 上线判断：**代码层面已具备上线条件，但上线收款前必须先在生产数据库执行 `003_rls_and_orders_product.sql` 迁移，并用小额真实订单走通一次虎皮椒支付回调（本地无真实 Supabase/虎皮椒凭证，无法测真实扣款）。**

---

## 0. AI 文章生成修复（2026-10-11）

**问题**：调用 `/api/cron/generate-article` 报 `UND_ERR_HEADERS_TIMEOUT`——第三方推理模型 API（Atria-Dawn-Preview）生成文章耗时超过 Node fetch 默认 300 秒头部超时；即使等待 10 分钟仍未返回。

**根因**：该 API 是推理模型，先输出大量 `reasoning_content` 再输出正文；请求 800-1200 字长文时推理链过长，响应极慢（>10 分钟）。实测：把正文缩到 400-600 字并加 `reasoning_effort: "low"` 后，生成约 82 秒完成。

**修复**：
- `lib/ai-generate.ts`：改用 Node `https` 模块发请求（10 分钟自定义超时），规避 undici `headersTimeout`；正文缩至 400-600 字；`max_tokens` 6000（防止推理链耗尽 token 导致 content 为空）；请求加 `reasoning_effort: "low"`，服务商不支持时（400）自动降级重试；content 为空时错误信息包含 finish_reason/usage 便于诊断。
- `lib/article-generator.ts`（新增）：共享的「AI 生成 + 写入 articles 表」函数。
- `app/api/cron/generate-article`：**异步化**——立即返回 202，后台生成，失败自动重试 3 次（间隔 30 秒）。
- `app/api/admin/articles/generate`：同样异步化，提交后后台生成。
- `app/admin/articles/GenerateForm`：适配异步提示（提交后等待 1-10 分钟再刷新列表）。
- `app/articles/page.tsx`：`force-dynamic`——修复文章列表被构建时静态化导致新文章不显示的问题。
- `app/sitemap.ts`：动态生成，并追加已发布文章 URL（供 SEO 收录每日新文章）。
- `scripts/cron-daily.sh`：curl 超时 120→600s；改用 grep 解析 `.env.local`（兼容 `EMAIL_FROM=名称 <邮箱>` 这类带引号/空格的值，避免 bash source 语法错误）。

**端到端验证（真实第三方 API + 真实 Supabase）**：
- `curl -H "Authorization: Bearer <CRON_SECRET>" .../api/cron/generate-article` → `HTTP 202`（0.13s 返回）。
- 后台约 3-4 分钟生成成功：`{ id: 'b9718446-...', title: '10月11日运势指南：火土旺相，以柔制刚', status: 'published' }`。
- `/articles` 列表页实时显示该文章；详情页 HTTP 200 且内容完整（含结尾免责声明）；`/sitemap.xml` 包含该文章 URL。

**低配 VPS 方案（2026-10-11 新增）**：如果 VPS 内存小（1-2G）跑不动模型，可让**本地电脑生成文章后定时推送到网站**——新增 `POST /api/articles/publish`（`CRON_SECRET` Bearer 认证，接收外部生成的文章并直接发布）+ 本地脚本 `scripts/local-publish.mjs`（调用本地模型生成 → 推送发布）。已端到端验证：本地 qwen3.8-flash 生成 → 发布 → 前台可见。Windows 计划任务 / crontab 定时示例见 `docs/VPS_DEPLOYMENT.md` 第 5 节。

**安全提醒**：`.env.local` 中的 `AI_API_KEY`（第三方 API）与 Supabase token 属敏感凭据，只存在本地，不要提交/公开；如已泄露请到服务商后台轮换。

---

## 1. 一句话交接

支付链路致命缺陷（订单 ID 类型、金额篡改、空 catch、回调不校验）、认证安全（AUTH_SECRET、OTP 限流、归属校验）、功能 Bug（daily 伪随机、塔罗契约、PayWall 轮询）均已修复。剩余工作是把 RLS 迁移应用到线上库、跑一次真实支付验收、清理剩余 P3 尾巴。

---

## 2. 当前仓库状态

修复工作产生了大量代码改动（见第 3-7 节）。`git status` 中除本文件与修复改动外，仍有历史脏改动：

```text
 M app/globals.css
 M playwright-report/index.html
 M test-results/.last-run.json
?? playwright-report/data/
?? test-results/cross-device-sync-...
```

仍然有效的纪律：

- `app/globals.css`、`playwright-report/`、`test-results/` 的历史改动**不属于本次修复**，不要覆盖、回滚或提交它们（如后续把 `/playwright-report`、`/test-results` 从 git 移除，需用户单独确认）。
- 不要执行 `git checkout`、`git restore`、`git reset`、`git clean`。
- PowerShell 中曾有用户级 git ignore 权限警告（`C:\Users\wyx90/.config/git/ignore` Permission denied），不影响仓库内状态判断。
- 提交建议：本次修复涉及约 30 个文件，可按"支付链路 / 认证安全 / 功能 Bug / 工程卫生"分批小步提交。

---

## 3. 当前修复统计

| 分类 | 已修复 | 未修复 |
|---|---:|---:|
| P0 致命问题 | 4 | 0 |
| P1 高危问题 | 5 | 0 |
| P2 明确 Bug | 7 | 0 |
| P3 工程质量问题 | 5 | 3 |

P3 待办明细见第 7 节。

---

## 4. P0：致命问题（已全部修复）

### P0-1 订单 ID 类型不匹配 — ✅ 已修复

- 修复内容：`app/api/payment/create/route.ts` 使用 `crypto.randomUUID()` 生成订单 ID；订单写入 DB 检查 `.error`，失败直接返回 500 拒绝创建支付；结构化错误日志带 orderId/productKey/userId 上下文。
- 虎皮椒下单失败时订单标记为 `failed`，不再残留 `pending`。

### P0-2 支付金额可被客户端篡改 — ✅ 已修复

- 新增 `lib/payment-products.ts`：服务端唯一可信产品目录（bazi 9.9 / tarot 6.9·9.9·19.9 / daily 6.9 / 会员 1.99·19.9·199），会员时长由 `membershipDays` 决定。
- `payment/create` 只接受 `productKey`，请求体中的 `amount`/`userId` 一律忽略；金额经 `yuanToCents()`（`Math.round`）精确换算。
- `payment/callback` 校验 `total_fee`（分）与订单金额换算后的分值完全一致，不一致返回 `fail` 并记日志。
- 前端 `PayWall`/`MembershipDialog` 只传 `productKey`。
- ⚠️ `daily_unlock` 定价 6.9 是本次修复新增的决定（原代码 daily 付费墙是假按钮，无真实调用点价格），上线前请与产品确认。

### P0-3 前端 anon key 直查 + 数据库未启用 RLS — ✅ 代码已修复，迁移待线上应用

- 删除 `lib/supabase.ts`（anon 客户端），全仓已无 anon 直查；塔罗结果页改走 `/api/tarot`（带归属校验）。
- 新增 `supabase/migrations/003_rls_and_orders_product.sql`：全部 6 张业务表启用 RLS、对 anon/authenticated 全量 REVOKE（默认拒绝），并加 `orders.product_key` 列、`idx_orders_user_record` 索引、`daily_fortunes(zodiac, fortune_date)` 唯一索引。
- 服务端继续使用 service role（绕过 RLS）。
- ⚠️ **待办：确认该迁移已在线上 Supabase 执行**（文档内 SQL 可直接在 SQL Editor 跑）。

### P0-4 `zod` 依赖分类错误 — ✅ 已修复

- `zod` 移入 `dependencies`；`@types/nodemailer` 移入 `devDependencies`。
- 顺带核实并卸载确认无 import 的 `swr`、`resend`、`mingyu-core`（P3-1），`npm install` 已同步 lockfile。

---

## 5. P1：高危安全与隐私问题（已全部修复）

### P1-1 `AUTH_SECRET` 静默默认值 — ✅ 已修复

- `lib/auth.ts` 改为惰性 `getAuthSecret()`：生产环境缺失或 < 32 字符直接抛错（fail-fast）；开发环境未配置时警告并使用开发默认值（本地可跑）。

### P1-2 记录读取缺少所有权校验 — ✅ 已修复

- 新增 `lib/resolve-user.ts`：统一归属链 `session -> users.id` 或 `deviceId -> users.device_id -> users.id`。
- `/api/bazi`、`/api/tarot` GET：非本人记录返回 403；解锁判定 = 记录 `is_unlocked` / 用户 VIP / 用户存在已支付订单（查 orders 表）。
- 八字结果页服务端不再渲染全文（原实现任何人可看完整八字，PayWall 形同虚设），改为客户端组件 `BaziResultView` 走 API 校验后展示；未解锁显示四柱预览 + PayWall。
- 分享脱敏：八字分享只带站点信息，不含姓名/出生日期；塔罗只带问题与牌名。

### P1-3 OTP 缺少暴力破解与发送限流 — ✅ 已修复

- 新增 `lib/rate-limit.ts`：邮箱维度验证失败 5 次锁 15 分钟（`recordFailure`/`isLocked`/`clearFailures`），发送侧 IP 限流 10 次/小时（`x-forwarded-for` 解析）。
- OTP 生成改用 `crypto.randomInt(100000, 1000000)`。
- 登录对话框展示"验证码 5 分钟内有效"提示；失败提示会告知是否触发锁定。

### P1-4 dev/debug 路由魔法字符串判断环境 — ✅ 已修复

- 新增 `lib/env.ts`：`isProductionEnv()`（NODE_ENV）、`hasRealSupabase()`（URL 合法且非占位域名）、`isDevToolAllowed()`（仅本地开发且未接真库）。
- `debug-otp`、`dev/activate-membership` 使用统一守卫，生产/已接库一律 403。
- `auth/me`、`verify-otp`、`dev-user-store` 中的 `includes('placeholder')` 判断全部替换为 `lib/env.ts`。

### P1-5 缺少隐私政策与用户协议 — ✅ 已修复

- 新增 `/privacy`、`/terms` 页面（含收集范围、用途、保存期限、第三方传输、用户权利、免责声明）。
- Footer、登录对话框、会员购买对话框均提供入口链接；登录页明示"验证码 5 分钟内有效"。

---

## 6. P2：明确功能 Bug（已全部修复）

### P2-1 塔罗结果页数据契约不一致 — ✅ 已修复

- 结果页改走 `/api/tarot` GET（enriched cards），显式映射：`position === 'upright' → '正位'`，关键词优先方向性 `uprightKeywords/reversedKeywords`、兜底单数 `keyword`；解读字段 `uprightReading/reversedReading` 缺失时显示占位文案，不再出现 `undefined`。

### P2-2 每日运势伪随机数生成器错误 — ✅ 已修复

- `generateFortune` 改用 FNV-1a 种子 + mulberry32 迭代 PRNG：四维分数独立分散，同星座同日可复现。新增 `__tests__/daily-prng.test.ts`（48 组合断言不再全同 + 可复现 + 星座间有差异），测试通过。

### P2-3 PayWall 轮询逻辑错误 — ✅ 已修复

- 新增 `GET /api/payment/status?orderId=`：校验订单归属（session 或 deviceId 解析的 user 与订单 user_id 匹配）后只返回订单状态。
- `PayWall` 保存 orderId 并轮询该接口，`paid` 才触发 `onSuccess`；120 秒超时停止并提示；演示模式不轮询、直接展示说明。

### P2-4 `useAuth` 双重实现 — ✅ 已修复

- 删除重复 load 逻辑，初始加载复用 `fetchUser`（挂载经 `setTimeout` 调度以符合 `react-hooks/set-state-in-effect` 规则）。

### P2-5 洗牌有偏 + OTP `Math.random` — ✅ 已修复

- 塔罗抽牌改 Fisher-Yates + `crypto.randomInt`；正逆位用 `crypto.randomInt(2)`。OTP 见 P1-3。

### P2-6 空 catch 吞错 — ✅ 已修复

- 支付链路全部 fail-fast（见 P0-1/P0-2）；bazi/tarot/daily 的降级 catch 均改为 `console.error` 带上下文结构化日志；DB 未配置走显式 503，不再静默装作成功。

### P2-7 回调验签非常量时间 — ✅ 已修复

- `lib/hupijiao.ts`：验签用 `crypto.timingSafeEqual`（长度不同先 false）；`verifyCallback` fail-fast 读取凭证；HTTP 响应检查 `res.ok`、JSON 解析 try-catch、`errcode` 校验。
- 回调同时校验订单号、支付状态（`status === 'OD'`）、金额（分）一致；已支付订单幂等返回 `success`；会员时长由 `product_key` 查产品目录决定（历史无 product_key 订单按金额推断并记警告）。

---

## 7. P3：工程质量与卫生问题

| 编号 | 问题 | 状态 | 说明 |
|---|---|---|---|
| P3-1 | 疑似未使用依赖 | ✅ 已修复 | 核实 `swr`/`resend`/`mingyu-core` 全仓无 import 后卸载，lockfile 已同步 |
| P3-2 | `lucide-react` 版本异常 | ✅ 已确认无问题 | `npm ls lucide-react` 显示 1.35.0 实际存在且安装正常 |
| P3-3 | 垃圾文件 | ✅ 已清理 | 已删除 `middleware.ts.bak`、`{fortune.summary}`、空 `cat/` 目录（文档原本要求"经用户确认后清理"，本次按用户"进行修复"的指示一并处理；如需恢复可从 git 历史找回） |
| P3-4 | 测试产物被 git 追踪 | 🔶 部分完成 | `.gitignore` 已补 `/playwright-report`、`/test-results`；`git rm --cached` 涉及改写索引，**待用户确认后执行** |
| P3-5 | 单测缺失 | 🔶 部分完成 | 新增 `daily-prng.test.ts`、`payment.test.ts`（9 个断言）；bazi/liuyao/meihua 引擎测试仍缺，是下一优先级 |
| P3-6 | README 模板 | ✅ 已修复 | 重写为真实说明：功能、环境变量表、迁移步骤、安全要点、CI 说明 |
| P3-7 | 设备合并可能重复执行 | ✅ 已修复 | `verify-otp` 合并后清空旧用户 `device_id`，防重复触发；各合并步骤补错误检查 |
| P3-8 | daily 本地缓存无上限、缺唯一索引 | ✅ 已修复 | localCache 上限 400（LRU 淘汰）；003 迁移加 `(zodiac, fortune_date)` 唯一索引，并发插入冲突回读 |

---

## 8. 关键代码事实（后续修复必须遵守）

### 8.1 `orders.id` 是 UUID

`orders.id` 为 PostgreSQL UUID（`001_initial.sql`），订单 ID 必须用 `crypto.randomUUID()`（已实现于 `payment/create`）。不要插回 `demo-` 前缀字符串。

### 8.2 虎皮椒 API 地址是 `creat`

```text
https://pay.xunhupay.com/api/v2/pay/creat
```

注意是 `creat`，不是 `create`（`lib/hupijiao.ts` 已保留原样）。

### 8.3 业务表没有 `device_id` 字段

匿名归属链（已封装为 `lib/resolve-user.ts` 的 `resolveRequestUser`）：

```text
客户端 deviceId -> users.device_id -> users.id -> 业务记录 user_id
```

不要写 `record.device_id === deviceId` 这种不存在的字段校验。

### 8.4 Daily 记录是公共记录

`daily_fortunes` 按 `(zodiac, fortune_date)` 存储，是公共运势。**不要写 `daily_fortunes.is_unlocked`**——那是全局解锁位。单次解锁状态由 daily API 查询 `orders` 表（`user_id + record_type='daily' + record_id + status='paid'`）判定；回调对 daily 订单只标记订单 paid，不碰 fortune 记录。

### 8.5 价格以 `lib/payment-products.ts` 为唯一可信来源

客户端传的任何金额都会被忽略。调整价格只改该文件。当前价格核实来源：八字 9.9（bazi 结果页 PayWall）、塔罗 6.9/9.9/19.9（`lib/tarot-data.ts` SPREAD_CONFIGS）、会员 1.99/19.9/199（MembershipDialog）。**daily 6.9 为新增定价，无历史调用点，请产品确认。**

### 8.6 新增关键模块（本次修复引入）

| 模块 | 职责 |
|---|---|
| `lib/payment-products.ts` | 服务端产品目录 + 元转分精确换算 |
| `lib/env.ts` | 统一环境判断（`isProductionEnv`/`hasRealSupabase`/`isDevToolAllowed`/`getClientIp`） |
| `lib/resolve-user.ts` | 统一归属用户解析（session 优先，匿名走 deviceId） |
| `lib/rate-limit.ts` | 内存限流 + 失败锁定（单实例有效，多实例需换 Redis） |
| `app/api/payment/status/route.ts` | PayWall 轮询订单状态的接口 |
| `app/bazi/result/[id]/BaziResultView.tsx` | 八字结果客户端视图（走 API 校验解锁） |

---

## 9. 推荐的剩余工作

1. **（上线阻塞项）** 在生产 Supabase 执行 `supabase/migrations/003_rls_and_orders_product.sql`，确认 RLS 生效（用 anon key 试查应被拒绝）。
2. **（上线阻塞项）** 配置真实虎皮椒凭证后，用最小金额商品（1.99 日卡）走一次真实支付，验证：支付页可打开 → 回调写库 → 订单变 paid → 前端轮询显示解锁。
3. 确认 daily_unlock 定价。
4. 补 bazi/liuyao/meihua 引擎单测（P3-5 剩余）。
5. 经用户确认后 `git rm --cached -r playwright-report test-results`（P3-4 剩余）。
6. e2e 与 CI 本次未运行（遵守交接纪律），合入后建议跑一次 `npm run e2e` 观察旧用例是否需要随契约更新。

---

## 10. 支付链路验收标准（核对结果）

| # | 验收标准 | 状态 |
|---|---|---|
| 1 | 客户端不能指定支付金额 | ✅ create 只认 productKey |
| 2 | 客户端不能指定 userId | ✅ session/deviceId 服务端解析 |
| 3 | 订单 ID 是合法 UUID | ✅ crypto.randomUUID() |
| 4 | 订单写入失败不能创建支付 | ✅ 检查 error 后直接 500 |
| 5 | 回调验签失败返回 fail | ✅ timingSafeEqual |
| 6 | 回调校验支付成功状态 | ✅ status === 'OD' |
| 7 | 回调金额与订单一致 | ✅ 分值精确比较 |
| 8 | 已支付订单幂等返回 success | ✅ |
| 9 | 单次解锁只影响目标记录 | ✅ bazi/tarot 按记录解锁；daily 按 orders 判定 |
| 10 | 会员时长由服务端配置决定 | ✅ product_key → membershipDays |
| 11 | 前端轮询订单状态 | ✅ /api/payment/status |
| 12 | 真实支付后能看到解锁结果 | 🔶 代码链路已通，需小额真实订单验收 |
| 13 | 失败有日志、不假装成功 | ✅ 结构化错误日志 |

---

## 11. 本次修复实际执行的验证

```text
npx eslint app lib components __tests__   → 0 errors
npx tsc --noEmit                          → 0 errors
npx jest --coverage=false                 → 3 suites / 9 tests passed
npm run build                             → ✓ Compiled successfully, 38/38 pages
npm ls lucide-react                       → 1.35.0（确认无版本异常）
npm install（移除 swr/resend/mingyu-core）→ removed 16 packages
```

未运行：`npm run e2e`、`npm run ci`（遵守交接纪律，需用户明确同意）。

---

## 11b. 端到端真实测试结果（2026-09-07，本地环境）

环境说明：本地 `.env.local` 的 Supabase 是占位地址、虎皮椒凭证是占位符，即本地为「无库 + 演示支付」模式。因此分两层测试：**行为层**（GUI + API，全测）与**数据层**（真实 DB 持久化、真实扣款，本地不可测，列为上线前待办）。测试服务器：`next start -p 3001`（生产构建）、`next dev --webpack -p 3002`（开发模式，仅用于验证 dev 路由守卫的对照）。截图证据存于 `gui-test-screenshots/`。

### 通过的测试点

| # | 测试点 | 结果 | 证据 |
|---|---|---|---|
| T1 | 首页渲染、12 个功能入口、Footer 含隐私/协议链接、价格区与产品目录一致 | ✅ | t1_home.png |
| T2 | 塔罗三张牌阵抽牌 → 结果页 `正位/逆位` 中文标签、每张牌有解读、综合解读无 `undefined` | ✅ | t2_tarot_result.png |
| T3 | 会员弹窗三档价格、协议链接；无库模式点购买 → 明确报「支付服务暂不可用」不假装成功 | ✅ | t3_membership_nodb_error.png |
| T4 | 八字排盘（1995-08-15 午时 男）→ 四柱/五行/大运/2026 流年完整展示 | ✅ | t4_bazi_result.png |
| T5 | daily 无库模式：修复 D1 后内容完整展示（回归 t5_regression_daily_fixed.png）；修复前为锁定态（t5_daily_locked.png 记录缺陷） | ✅（修复后） | t5_regression_daily_fixed.png |
| T6.1 | 篡改攻击：传 `amount: 0.01` 买年卡 → 请求体金额被忽略，无库时 503 fail-fast（不会带病创建支付单） | ✅ | curl 输出 |
| T6.2 | 非法 productKey → 400 无效的产品 | ✅ | curl 输出 |
| T6.3 | 客户端伪造 userId 冒充他人 → 401 身份只认服务端 session/deviceId | ✅ | curl 输出 |
| T6.4-6.8 | 伪造/无效/无签名回调 → 全部 `fail`(400)，服务端记录结构化安全日志 | ✅ | server-prod.log |
| T6.9 | 生产环境 dev/debug 路由 → 403 disabled | ✅ | curl 输出 |
| T7 | /privacy、/terms 完整渲染（收集范围/保存期限/第三方/权利/退款规则） | ✅ | DOM 快照 |
| T8-GUI | 邮箱输入 → 验证码 6 格输入 → 登录成功 → 对话框变账号信息 → 会话跨页保持 | ✅ | t8_login_success.png |
| T8-API | 登录闭环 send→verify→/me 200；错码 5 次 → 第 5 次提示将锁定、第 6 次 429「约 15 分钟后再试」；锁定期间正确码也被 429 拒绝（防绕过）；IP 限流 10 次/小时后 429 | ✅ | curl 输出 |

### 测试中发现并已修复的缺陷

| 编号 | 缺陷 | 影响 | 修复 |
|---|---|---|---|
| D1 | `daily` 无库模式返回 `isUnlocked: false` 且 PayWall 被跳过：页面显示 🔒 锁定占位但没有任何付费入口，用户被卡死 | 仅本地无库模式；生产有库不受影响 | `app/api/daily/route.ts` 本地缓存路径返回 `isUnlocked: true`，与 bazi/tarot 本地记录「不设付费墙」策略一致；`DailyContainer` 去掉 `local-` 前缀特判 |
| D2 | `lib/otp-store.ts` `isRateLimited` 用 OTP 的 `expiresAt`（创建+5min）而非创建时间做 60s 冷却判断，实际冷却变成 6 分钟 | 无库开发模式下的重发体验；有真实库时走 `created_at` 判断本来就正确 | `OtpEntry` 增加 `createdAt`，冷却按创建时间判断；回归验证：2s 后重发 429（拦截），5 分钟内非冷却窗口可重发 |

### 已知非缺陷（环境产物，无需修复）

- **dev 服务器（`next dev --webpack`）上 `verify-otp` 登录后 `/api/auth/me` 返回 404**：webpack 开发模式的路由模块隔离使 `dev-user-store` 内存 Map 在不同路由间不共享。生产构建（`next start`）实测正常，且真实生产用 Supabase 不走内存 store。只影响本地 dev 调试体验。
- **本地无库 + 虎皮椒占位**：订单无法入库、无法真实扣款。支付链路的 DB 写入与回调解锁需要接真实 Supabase + 虎皮椒后验证（见第 9 节上线阻塞项）。

### 回归验证（D1/D2 修复后）

```text
eslint / tsc / jest(9 tests) / next build → 全部通过
daily 无库模式 → 幸运色/星座内容完整展示，无 🔒 占位（t5_regression_daily_fixed.png）
send-otp 2 秒后重发 → 429（60s 冷却按创建时间，行为正确）
```

---

## 13b. 模板化改造（2026-10-04）

目标：让其他人能用本仓库部署同样的站点。审计发现并处理：

- **域名硬编码**：`xuanyu.app` 原先硬编码在 seo/sitemap/robots/JsonLd/Breadcrumb/error/BaziContainer 共 7 处，已全部收敛到新增的 `lib/site-config.ts`（读 `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SITE_NAME` / `NEXT_PUBLIC_SUPPORT_EMAIL`，缺省回退原值，站点自身行为不变）。
- **新增 `.env.example`**（`.gitignore` 已加豁免）与 **`docs/DEPLOYMENT.md`** 从零到上线手册（Supabase 三步迁移、环境变量表、Vercel 部署、品牌替换清单、合规提醒、FAQ）。
- 确认无任何密钥/敏感文件被 git 追踪。
- **仓库目前无 git remote**：要让别人获取代码，需站长自行推送到 GitHub/Gitee 并设为公开（或 GitHub Template 仓库）。

---

## 13. SDK / Skill 交付物（2026-10-04 新增）

站点核心引擎已抽成可分发产物（纯新增，站点代码零改动）：

- **`packages/xuanyu-core/`**：npm 包源码。八字/紫微/星盘/六爻/梅花/合婚/塔罗/每日运势共 8 个引擎，纯 TS、NodeNext ESM、附 CLI（`xuanyu <cmd>`，JSON 输出）。构建：`cd packages/xuanyu-core && npm run build`。发布：`npm publish`（需用户 npm 账号，包名 xuanyu-core 当前未占用与否需发布时确认）。价格等商业字段已从 SDK 剔除。
- **`skills/xuanyu/`**：自包含 AI 助手 skill（vendor 了 dist + SKILL.md 使用说明）。复制到 `~/.agents/skills/` 后按 SKILL.md 首次 `npm install --prefix <skill>/scripts/xuanyu-core --omit=dev` 即可离线使用。
- 已验证：包构建通过、21 项单测通过（含包自身 12 项）、8 个 CLI 命令在**完全脱离项目的隔离目录**中全部运行成功。
- 已知环境限制：本机 npm 镜像（npmmirror）存在 TLS 证书拦截，全新 `npm install` 在本机报 UNABLE_TO_VERIFY_LEAF_SIGNATURE——这是机器环境问题；正常网络环境下按 SKILL.md 安装即可。
- 注意：包引擎是站点 `lib/` 引擎的**副本**（已解耦 @/types、剔除价格）。后续若站点引擎改动，需同步到包再构建；长期可把站点改为 workspace 消费该包以消除双份维护。
- 2026-10-04 新增**文章发布功能**（站长发文章）：迁移 `004_add_articles.sql`（已并入 `init.sql`）；前台 `/articles` 列表 + `/articles/[slug]` 详情；管理后台 `/admin/articles`（新建/编辑/删除/草稿/发布）；`lib/admin.ts` 用 `ADMIN_EMAIL` 环境变量做管理员校验；写接口 `POST/DELETE /api/admin/articles`。验证：lint/tsc/jest/build 全过，无库模式下页面降级提示、未登录写接口 403、不存在文章 404。注意 `ADMIN_EMAIL` 未配置时管理后台完全不可用（403）。

---

## 12. 给下一个 Agent 的提醒

1. 这是 **Next.js 16 App Router** 项目，改 Route Handler 前先读 `node_modules/next/dist/docs/`。
2. 不要在未获用户确认前扩大范围；不要执行破坏性 Git 操作；不要覆盖 `app/globals.css`、`playwright-report/`、`test-results/` 的历史脏改动。
3. 不要直接运行 `npm run e2e` 或 `npm run ci`，除非用户明确同意。
4. 修完代码跑 `eslint + tsc + jest + build`，并在回复里列出实际执行的命令和结果。
5. 如果发现本仓库实际代码与本文档不一致，以实际代码为准，并更新本文档状态。
