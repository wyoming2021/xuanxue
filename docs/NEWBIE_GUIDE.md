# 新手从零搭建玄学站 + 盈利保姆教程

> 适用对象：完全不懂代码的新人小白。
> 目标：用不到 **¥500/年** 的成本，搭一个能收费、能自动更新文章、能被谷歌收录的玄学网站。

---

## 一、这个站能赚什么钱

| 盈利方式 | 怎么赚钱 | 需要你做 |
|---|---|---|
| 工具付费 | 用户排八字/抽塔罗/看每日运势，付费解锁结果 | 只需开通收款 |
| 会员卡 | 日卡/月卡/年卡，付费解锁全部内容 | 只需开通收款 |
| 谷歌广告 | AI 每天自动写玄学文章 → 谷歌收录 → 有人看就有 AdSense 广告费 | 提交收录 + 挂广告 |
| 私域咨询 | 文章/工具吸引用户 → 加你微信 → 一对一算命/看盘/起名 | 自己接单（客单价高） |

**新手起步重点**：先开前两个（有现成功能），同时让 AI 每天写文章养 SEO，最后做私域。

---

## 二、要准备什么（成本清单）

| 项目 | 预算 | 在哪买 |
|---|---|---|
| 域名（如 myxuan.site） | ¥50-100/年 | 阿里云、腾讯云、Namesilo 等 |
| VPS 服务器（1核1G 起） | ¥30-100/月 | 阿里云、腾讯云、搬瓦工、RackNerd |
| Supabase 数据库 | 免费 | supabase.com |
| 虎皮椒收款 | 免费接入（每笔扣约 1.2%） | hupijiao.com |
| AI 写文章 | 免费 | siliconflow.cn（用免费模型） |
| **合计** | **约 ¥500/年** | |

---

## 三、7 步从零到上线

### 第 1 步：注册账号（约 20 分钟）

需要注册 4 个账号（都是免费的）：

1. **Supabase**（数据库）：打开 supabase.com → Sign up → 邮箱注册 → 创建项目（选新加坡区域），记下：
   - Project URL（形如 `https://xxx.supabase.co`）
   - 数据库密码（创建时设置）
   - service_role 密钥（Project Settings → API → service_role）
2. **硅基流动**（AI 写文章）：打开 siliconflow.cn → 注册实名 → 左侧「API 密钥」→ 创建密钥，复制 `sk-...`（选模型用免费的 `Qwen/Qwen2.5-7B-Instruct`）
3. **域名商**：买一个域名（如 `myxuan.site`，约 50 元/年）
4. **VPS 服务商**：买一台服务器（1核1G 够用，系统选 Ubuntu 22.04）

### 第 2 步：解析域名（约 5 分钟）

在你买域名的网站，把域名加一条 **A 记录**，指向你 VPS 的**公网 IP**。

### 第 3 步：一键部署到 VPS（约 10 分钟，全自动）

在 VPS 的终端（SSH 连上后）执行这一行命令：

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/wyoming2021/xuanxue/master/scripts/vps-deploy.sh)"
```

按提示填写（直接回车可跳过可选项）：

```
① Supabase 项目 URL：填 https://xxx.supabase.co
② service_role 密钥：填你记下的密钥
③ 站点域名：填 myxuan.site
④ 站点名称：我的玄学站
⑤ 联系邮箱：你的邮箱
⑥⑦ QQ 邮箱 + SMTP 授权码（发验证码用，可先跳过）
⑧⑨ 虎皮椒 APP_ID / APP_SECRET（可先跳过，第 5 步再填）
⑩ 文章管理员邮箱（填你的邮箱，用于后台发文章）
⑪ AI_API_KEY：填硅基流动的 sk-...（填了地址和模型会自动用免费默认值）
```

脚本会自动完成：装 Docker → 拉代码 → 生成配置 → 启动网站 → 配 Nginx → 自动申请 HTTPS 证书。

完成后访问 `https://myxuan.site` 就能看到你的玄学站了！

> 如果域名还没解析好，脚本会跳过 HTTPS，等解析生效后再访问。

### 第 4 步：登录后台发文章（约 2 分钟）

1. 打开你的网站 → 右上角用你的 QQ 邮箱登录（会收到验证码，如果第 ⑥⑦ 没填，先跳过）
2. 用**文章管理员邮箱**登录后，访问 `https://myxuan.site/admin/articles`
3. 点「✨ AI 写文章」→ 选「直接发布」→ 开始生成，等 1-2 分钟刷新列表就能看到文章

> 也可以设置**每日自动更新**：VPS 部署脚本已经自动配置了每天 08:00 的定时任务，每天自动生成一篇并发布。

### 第 5 步：接入收款（约 10 分钟，盈利关键）

1. 打开 hupijiao.com 注册商户，实名认证后拿到 `APP_ID` 和 `APP_SECRET`
2. 在 VPS 上编辑配置文件：
   ```bash
   sudo nano /opt/xuanyu/.env.local
   ```
3. 找到并修改这三行：
   ```
   HUPIJAO_APP_ID=你的APP_ID
   HUPIJAO_APP_SECRET=你的APP_SECRET
   HUPIJAO_NOTIFY_URL=https://myxuan.site/api/payment/callback
   ```
4. 保存（Ctrl+O，回车，Ctrl+X），重启容器：
   ```bash
   cd /opt/xuanyu && sudo docker compose restart
   ```

现在用户付费后就能自动解锁了。**先自己用 1.99 元日卡真实付一单测试**，确认能解锁再上线。

### 第 6 步：提交谷歌收录（约 10 分钟）

1. 打开 `https://search.google.com/search-console`，用 Google 账号登录
2. 添加资源 → 输入 `myxuan.site` → 按提示验证（选 DNS 记录最省事）
3. 左侧「Sitemap」→ 提交 `https://myxuan.site/sitemap.xml`
4. 完成。之后 AI 每天写的文章会自动出现在 sitemap 里，等谷歌收录（几天到几周）

### 第 7 步：开始盈利

- **短期**：把支付链接/会员入口放到工具页和文章底部，引导付费解锁；
- **中期**：等谷歌收录文章后，申请 **Google AdSense**（`adsense.google.com`），文章有流量就有广告费；
- **长期**：在文章底部/关于页留你的微信，做**一对一咨询**（看盘、合婚、起名），一单几十到几百元。

---

## 四、给新手的避坑提醒

1. **先测支付再上线**：用 1.99 元自己买一单，确认能解锁，别让第一个用户当小白鼠；
2. **不要做虚假宣传**：玄学内容要标注「仅供娱乐参考」，避免纠纷（模板已内置免责声明）；
3. **谷歌收录需要时间**：新站一般 1-4 周才开始有收录，别急，坚持让 AI 每天更新文章；
4. **VPS 内存小也没关系**：如果服务器只有 1-2G 内存，AI 文章可以改成本地电脑生成再推送（见 `docs/VPS_DEPLOYMENT.md` 第 6 节），或者直接用硅基流动云端免费模型，不占 VPS 内存；
5. **不懂技术也不用怕**：整条部署路径只有上面那一条命令是必执行的，其余都是填表。

---

## 五、常见问题

**Q：我不会 SSH 连 VPS 怎么办？**
A：VPS 服务商网页控制台一般自带「网页终端」，点击就能进，把命令粘贴进去回车即可。

**Q：Supabase 密钥是什么？**
A：登录 supabase.com → 你的项目 → 左侧 Project Settings → API → 里面有 `service_role` 密钥（很长一串）。

**Q：没有 QQ 邮箱能登录吗？**
A：可以跳过登录功能，但建议配一个 QQ 邮箱（免费），用于收验证码和发文章。

**Q：能不能先不买 VPS，用免费托管？**
A：可以先用 Vercel 免费部署（见 `docs/DEPLOYMENT.md`），但免费版不适合长期跑定时任务；有预算还是建议 VPS，一年几百块。

---

教程配套资源：

- 技术部署细节：`docs/DEPLOYMENT.md`（Vercel）、`docs/VPS_DEPLOYMENT.md`（VPS）
- 源码仓库：`https://github.com/wyoming2021/xuanxue`
- 一键部署脚本：`scripts/vps-deploy.sh`（已自动完成 90% 工作）
- **自动生成视频教程**：
  - 基础版（文字卡片 + 中文配音）：`bash scripts/make-tutorial-video.sh`
  - 专业版（**真实界面录屏 + 点击高亮 + 中文字幕 + 配音**）：先启动本地站点（`PORT=3014 node .next/standalone/server.js`），再运行 `node scripts/make-tutorial-video-pro.mjs`
  - 搭建教程版（**高清 1920x1080 步骤卡片 + 男声配音 + 中文字幕**，教新人从零搭建）：`node scripts/make-build-video.mjs`
  - 真实浏览器版（**弹出真实浏览器 + 真实网站界面 + 模拟地址栏 + 男声配音 + 中文字幕**）：先启动本地站点（`PORT=3014 node .next/standalone/server.js`），再运行 `node scripts/make-build-video-real.mjs`