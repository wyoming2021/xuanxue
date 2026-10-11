# VPS 自托管部署手册

不想用 Vercel？完全可以用你自己的 VPS。本手册提供 **一条命令自动部署（推荐）**、**Docker 方式** 和 **裸机 Node 方式**。

> 数据库仍然使用 **Supabase 云数据库**（免费档）——VPS 上不需要跑 PostgreSQL，只需运行 Next.js 应用本体。这样安全、省心，也便于将来扩容。

---

## ⚡ 一条命令自动部署（推荐）

在 VPS 上执行（自动完成：装 Docker → 拉代码 → 生成配置 → 构建启动 → Nginx → HTTPS）：

```bash
sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/wyoming2021/xuanxue/master/scripts/vps-deploy.sh)"
```

脚本会交互式询问 Supabase 地址、密钥、域名等信息（可选项目直接回车跳过）；也可以**全自动非交互**——提前把配置放进环境变量：

```bash
sudo XUANYU_DOMAIN=example.com \
     XUANYU_SUPABASE_URL=https://xxx.supabase.co \
     XUANYU_SERVICE_KEY=你的service_role密钥 \
     XUANYU_SUPPORT_EMAIL=hi@example.com \
     XUANYU_QQ_EMAIL=myqq@qq.com \
     XUANYU_QQ_CODE=SMTP授权码 \
     bash -c "$(curl -fsSL https://raw.githubusercontent.com/wyoming2021/xuanxue/master/scripts/vps-deploy.sh)"
```

域名已解析到本机时，脚本会自动配置 Nginx 并签发 HTTPS 证书（Let's Encrypt），完成后直接访问 `https://你的域名` 即可。

> 想跳过 HTTPS 只先起服务：加 `XUANYU_SKIP_HTTPS=1`。

### 连 Supabase 数据库都自动建（只需一个 Token）

在 supabase.com → **Account → Access Tokens** 生成一个 Personal Access Token，然后加进环境变量，脚本会**自动创建 Supabase 项目、等待激活、执行 `init.sql`、把 URL 和密钥写进 `.env.local`**——SQL 都不用你粘贴：

```bash
sudo XUANYU_SUPABASE_TOKEN=你的PersonalAccessToken \
     XUANYU_DOMAIN=example.com \
     XUANYU_SITE_NAME=我的玄学站 \
     bash -c "$(curl -fsSL https://raw.githubusercontent.com/wyoming2021/xuanxue/master/scripts/vps-deploy.sh)"
```

自动建库后脚本会继续走交互/环境变量配置（此时 Supabase URL 和密钥已自动填入，只需回车确认域名、邮箱等即可）。**唯一仍须人工的一步：注册 Supabase 账号**（邮箱验证、账号归属），这是平台硬性要求。

> ⚠️ 该 Token 权限较高（可管理你的项目），部署完成后建议到 Supabase → Access Tokens 删除它。
> 可选：`XUANYU_SUPABASE_REGION=us-east-1` 指定区域（默认 `ap-southeast-1` 新加坡）。

---

## 1. 前置

| 需要 | 说明 |
|---|---|
| 一台 VPS | Ubuntu/Debian 22.04+，1 核 1G 即可跑动本应用 |
| 一个域名 | 解析 A 记录到 VPS 公网 IP |
| Supabase 项目 | 按 [DEPLOYMENT.md](DEPLOYMENT.md) 第 4 节创建，执行 `supabase/init.sql` |
| 配置好的 `.env.local` | 用 `npm run setup` 生成，或手动复制 `.env.example` 填写 |

---

## 2. Docker 方式（推荐）

### 2.1 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
```

### 2.2 拉取代码并配置

```bash
git clone https://github.com/wyoming2021/xuanxue.git
cd xuanxue
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase 等配置（或直接 npx next dev 前用 npm run setup）
```

### 2.3 构建并启动

```bash
sudo docker compose up -d --build
```

> 镜像只监听 `127.0.0.1:3000`，不直接暴露公网，由 Nginx 反代。

### 2.4 Nginx 反向代理 + HTTPS

安装 Nginx 与 certbot：

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

新建 `/etc/nginx/sites-available/xuanyu`：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用并申请证书：

```bash
sudo ln -s /etc/nginx/sites-available/xuanyu /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

访问 `https://yourdomain.com` 即完成。

### 2.5 查看日志 / 升级

```bash
sudo docker compose logs -f        # 查看日志
sudo docker compose pull && sudo docker compose up -d   # 升级（有更新时）
```

---

## 3. 裸机 Node 方式（不用 Docker）

### 3.1 安装 Node.js 20 + PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2
```

### 3.2 拉取代码并构建

```bash
git clone https://github.com/wyoming2021/xuanxue.git
cd xuanxue
cp .env.example .env.local   # 编辑填入配置
npm ci
npm run build
```

### 3.3 用 PM2 启动

```bash
pm2 start "npm run start" --name xuanyu
pm2 save
pm2 startup   # 按提示执行输出的命令，实现开机自启
```

### 3.4 Nginx 反代 + HTTPS

同上 2.4 的 Nginx 配置与 certbot。

### 3.5 查看日志 / 重启

```bash
pm2 logs xuanyu      # 日志
pm2 restart xuanyu   # 重启
```

---

## 4. 验证清单

- [ ] `https://你的域名` 打开首页
- [ ] 排盘后刷新记录仍在（数据库已通）
- [ ] 邮箱登录可用（若配置了 QQ SMTP）
- [ ] `https://你的域名/sitemap.xml` 指向你的域名
- [ ] 支付回调地址 `https://你的域名/api/payment/callback` 可访问（返回 fail 属正常，无真实回调请求时）