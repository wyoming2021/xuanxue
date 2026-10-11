# 玄学站一键部署向导

**面向用户：** 有一个域名 + 一台 VPS，想最快把玄学站上线的人。

**用户只需填写：**
1. 域名（已解析到 VPS）
2. VPS 服务器信息（IP、SSH 端口、用户名、密码或私钥）
3. Supabase Token（自动建库）或已有项目的 URL 与密钥

向导自动完成：SSH 连接 → 装 Docker → 拉代码 → 自动创建/初始化 Supabase 数据库 → 构建启动网站 → 配置 Nginx → 签发 HTTPS 证书。

## 使用方法

```bash
cd deploy-wizard
npm install
npm start
```

按提示逐项填写即可。完成后访问 `https://你的域名` 就是成品站。

## 非交互模式（自动化/脚本）

```bash
cd deploy-wizard
WIZ_DOMAIN=example.com \
WIZ_HOST=1.2.3.4 \
WIZ_SSH_USER=root \
WIZ_SSH_PASSWORD=你的SSH密码 \
WIZ_SUPABASE_TOKEN=sbp_xxx \
node index.mjs
```

可用环境变量：

| 变量 | 说明 |
|---|---|
| `WIZ_DOMAIN` | 域名（必填） |
| `WIZ_HOST` | VPS IP（必填） |
| `WIZ_PORT` | SSH 端口，默认 22 |
| `WIZ_SSH_USER` | SSH 用户名，默认 root |
| `WIZ_SSH_PASSWORD` | SSH 密码 |
| `WIZ_SSH_KEY_PATH` | SSH 私钥路径（与密码二选一） |
| `WIZ_SUPABASE_TOKEN` | Supabase Personal Access Token（自动建库） |
| `WIZ_SUPABASE_URL` + `WIZ_SERVICE_KEY` | 已有 Supabase 项目的 URL 与 service_role 密钥（与 token 二选一） |
| `WIZ_SITE_NAME` | 站点名称，默认「玄语站」 |
| `WIZ_ADMIN_EMAIL` | 文章管理员邮箱（可选） |
| `WIZ_SUPABASE_REGION` | 自动建库区域，默认 ap-southeast-1 |

## 远程执行了什么

VPS 上实际执行的是仓库里的 `scripts/vps-deploy.sh`（通过 curl 拉取），完整逻辑见 `../docs/VPS_DEPLOYMENT.md`。

## 安全说明

- 脚本**不保存**任何密码/Token/私钥，仅本次运行内存中使用
- SSH 连接走标准加密通道；远程命令中的值已做 shell 转义
- 使用 Supabase Token 自动建库后，建议到 supabase.com/dashboard/account/tokens 删除该 Token
- 域名需提前把 A 记录解析到 VPS 的公网 IP，否则 HTTPS 证书签发会自动跳过（可之后手动 `certbot --nginx -d 域名`）