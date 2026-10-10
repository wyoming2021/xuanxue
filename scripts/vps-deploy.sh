#!/usr/bin/env bash
#
# 玄语站 VPS 一键部署脚本
#
# 自动完成：
#   1. 安装 Docker 与 docker compose 插件（如未安装）
#   2. 克隆/更新项目代码到 /opt/xuanyu
#   3. 生成 .env.local（环境变量优先，缺失项交互询问；自动生成 AUTH_SECRET）
#   4. 构建并启动容器（docker compose up -d --build）
#   5. 配置 Nginx 反向代理并自动签发 HTTPS 证书（提供域名时）
#
# 用法：
#   sudo bash -c "$(curl -fsSL https://raw.githubusercontent.com/wyoming2021/xuanxue/master/scripts/vps-deploy.sh)"
#   或本地：
#   sudo bash scripts/vps-deploy.sh
#
# 非交互模式（stdin 非终端时自动启用；也可显式设置 XUANYU_NONINTERACTIVE=1）：
#   所有配置通过环境变量提供，缺失必填项直接报错退出：
#   sudo XUANYU_DOMAIN=example.com \
#        XUANYU_SUPABASE_URL=https://xxx.supabase.co \
#        XUANYU_SERVICE_KEY=服务端密钥 \
#        XUANYU_SITE_NAME=我的玄学站 \
#        XUANYU_SUPPORT_EMAIL=hi@example.com \
#        XUANYU_QQ_EMAIL=myqq@qq.com \
#        XUANYU_QQ_CODE=SMTP授权码 \
#        XUANYU_HUPIJAO_APPID=appid \
#        XUANYU_HUPIJAO_SECRET=appsecret \
#        bash scripts/vps-deploy.sh
#
# 可选环境变量：
#   XUANYU_SKIP_HTTPS=1   跳过 Nginx/HTTPS 配置（只启动容器）
#   XUANYU_REPO=...      项目仓库地址（默认官方仓库）
#   XUANYU_DIR=...       部署目录（默认 /opt/xuanyu）

set -euo pipefail

REPO="${XUANYU_REPO:-https://github.com/wyoming2021/xuanxue.git}"
APP_DIR="${XUANYU_DIR:-/opt/xuanyu}"

# ---- 颜色 ----
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info() { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()   { echo -e "${GREEN}[ OK ]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; exit 1; }

# stdin 不是终端时自动进入非交互模式，避免 read 卡死
if [[ ! -t 0 ]]; then
  XUANYU_NONINTERACTIVE=1
fi

# ---- 0. root 检查 ----
if [[ $EUID -ne 0 ]]; then
  echo -e "${RED}请使用 root 运行：${NC}"
  echo "  sudo bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/wyoming2021/xuanxue/master/scripts/vps-deploy.sh)\""
  exit 1
fi

# ---- 1. 安装 Docker（如未安装）----
if ! command -v docker >/dev/null 2>&1; then
  info "未检测到 Docker，开始安装..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker || true
else
  ok "Docker 已安装：$(docker --version)"
fi
if ! docker compose version >/dev/null 2>&1; then
  info "安装 docker compose 插件..."
  apt-get update -qq
  apt-get install -y -qq docker-compose-plugin
fi
systemctl enable --now docker >/dev/null 2>&1 || true

# ---- 2. 克隆 / 更新代码 ----
if [[ -d "$APP_DIR/.git" ]]; then
  info "更新已有代码 $APP_DIR ..."
  cd "$APP_DIR"
  git pull --ff-only || warn "git pull 失败，继续使用现有代码。"
else
  info "克隆项目到 $APP_DIR ..."
  mkdir -p "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ---- 3. 收集配置，生成 .env.local ----
ENV_FILE="$APP_DIR/.env.local"

# 已有 AUTH_SECRET 则保留，否则自动生成
if [[ -f "$ENV_FILE" ]] && grep -q '^AUTH_SECRET=' "$ENV_FILE"; then
  AUTH_SECRET="$(grep '^AUTH_SECRET=' "$ENV_FILE" | cut -d= -f2-)"
else
  AUTH_SECRET="$(openssl rand -hex 32)"
fi

# ask：$1=提示 $2=变量名 $3=是否必填(1/0)
ask() {
  local prompt="$1"
  local name="$2"
  local required="$3"
  local val="${!name:-}"
  if [[ -n "$val" ]]; then
    echo "$name=$val" >> "$ENV_FILE"
    return
  fi
  if [[ "${XUANYU_NONINTERACTIVE:-0}" == "1" ]]; then
    if [[ "$required" == "1" ]]; then
      fail "非交互模式缺少必填项 $name（请通过环境变量提供）"
    fi
    return
  fi
  local ans=""
  while :; do
    read -rp "  $prompt： " ans
    if [[ -n "$ans" ]]; then break; fi
    if [[ "$required" == "0" ]]; then break; fi
  done
  if [[ -n "$ans" ]]; then
    echo "$name=$ans" >> "$ENV_FILE"
    printf -v "$name" '%s' "$ans"   # 同步到 shell 变量，供后续派生使用
  fi
}

# 开始写 .env.local（覆盖旧文件，AUTH_SECRET 已保留）
> "$ENV_FILE"
echo "# 玄语站配置（由 vps-deploy.sh 自动生成）" >> "$ENV_FILE"
echo "AUTH_SECRET=$AUTH_SECRET" >> "$ENV_FILE"

echo -e "\n${CYAN}==== 填写站点配置（直接回车可跳过可选项目）====${NC}"
ask "① Supabase 项目 URL"            XUANYU_SUPABASE_URL 1
ask "② Supabase service_role 密钥"   XUANYU_SERVICE_KEY  1
ask "③ 站点域名（如 example.com）"    XUANYU_DOMAIN       0
ask "④ 站点名称"                      XUANYU_SITE_NAME   0
ask "⑤ 联系邮箱"                      XUANYU_SUPPORT_EMAIL 0
ask "⑥ QQ 邮箱（登录验证码）"         XUANYU_QQ_EMAIL     0
ask "⑦ QQ 邮箱 SMTP 授权码"          XUANYU_QQ_CODE      0
ask "⑧ 虎皮椒 APP_ID（支付可选）"     XUANYU_HUPIJAO_APPID 0
ask "⑨ 虎皮椒 APP_SECRET"            XUANYU_HUPIJAO_SECRET 0
ask "⑩ 文章管理员邮箱（ADMIN_EMAIL）"  XUANYU_ADMIN_EMAIL   0

# 派生项
DOMAIN="${XUANYU_DOMAIN:-}"
if [[ -n "$DOMAIN" ]]; then
  echo "NEXT_PUBLIC_SITE_URL=https://$DOMAIN" >> "$ENV_FILE"
  echo "HUPIJAO_NOTIFY_URL=https://$DOMAIN/api/payment/callback" >> "$ENV_FILE"
fi
[[ -n "${XUANYU_SITE_NAME:-}" ]] && echo "NEXT_PUBLIC_SITE_NAME=$XUANYU_SITE_NAME" >> "$ENV_FILE"
[[ -n "${XUANYU_SUPPORT_EMAIL:-}" ]] && echo "NEXT_PUBLIC_SUPPORT_EMAIL=$XUANYU_SUPPORT_EMAIL" >> "$ENV_FILE"
[[ -n "${XUANYU_QQ_EMAIL:-}" ]] && echo "QQ_EMAIL_USER=$XUANYU_QQ_EMAIL" >> "$ENV_FILE"
[[ -n "${XUANYU_QQ_CODE:-}" ]] && echo "QQ_EMAIL_AUTH_CODE=$XUANYU_QQ_CODE" >> "$ENV_FILE"
[[ -n "${XUANYU_HUPIJAO_APPID:-}" ]] && echo "HUPIJAO_APP_ID=$XUANYU_HUPIJAO_APPID" >> "$ENV_FILE"
[[ -n "${XUANYU_HUPIJAO_SECRET:-}" ]] && echo "HUPIJAO_APP_SECRET=$XUANYU_HUPIJAO_SECRET" >> "$ENV_FILE"
[[ -n "${XUANYU_ADMIN_EMAIL:-}" ]] && echo "ADMIN_EMAIL=$XUANYU_ADMIN_EMAIL" >> "$ENV_FILE"

# 校验必填
if ! grep -q '^NEXT_PUBLIC_SUPABASE_URL=.\+' "$ENV_FILE" || ! grep -q '^SUPABASE_SERVICE_ROLE_KEY=.\+' "$ENV_FILE"; then
  fail "缺少 Supabase 配置，请重新运行并填写 ①② 两项。"
fi

ok "已生成 $ENV_FILE"

# ---- 4. 构建并启动容器 ----
info "构建并启动容器（首次需几分钟）..."
cd "$APP_DIR"
docker compose up -d --build

sleep 2
if docker compose ps | grep -q "Up"; then
  ok "容器已启动"
else
  warn "容器状态异常，查看日志：docker compose logs -f"
fi

# ---- 5. Nginx 反代 + HTTPS ----
if [[ -n "$DOMAIN" && "${XUANYU_SKIP_HTTPS:-0}" != "1" ]]; then
  info "配置 Nginx 反向代理与 HTTPS ..."
  if ! command -v nginx >/dev/null 2>&1; then
    apt-get update -qq
    apt-get install -y -qq nginx certbot python3-certbot-nginx
  fi

  NGINX_CONF="/etc/nginx/sites-available/xuanyu"
  cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/xuanyu
  rm -f /etc/nginx/sites-enabled/default
  if nginx -t >/dev/null 2>&1; then
    systemctl reload nginx
  else
    warn "Nginx 配置测试失败，请手动检查 $NGINX_CONF"
  fi

  info "申请 HTTPS 证书（Let's Encrypt）..."
  EMAIL="${XUANYU_SUPPORT_EMAIL:-admin@$DOMAIN}"
  if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect >/tmp/certbot.log 2>&1; then
    ok "HTTPS 证书已签发并自动跳转 https"
  else
    warn "HTTPS 证书签发失败（可能是域名未解析到本机）。日志：/tmp/certbot.log"
    warn "解析域名后手动执行：sudo certbot --nginx -d $DOMAIN"
  fi
else
  info "跳过 Nginx/HTTPS（未提供域名或 XUANYU_SKIP_HTTPS=1）。"
fi

echo ""
ok "部署完成！"
if [[ -n "$DOMAIN" ]]; then
  echo "  访问： https://$DOMAIN"
else
  echo "  访问： http://<VPS-IP>:3000（生产请配置 Nginx/HTTPS，见 docs/VPS_DEPLOYMENT.md）"
fi
echo "  查看日志： docker compose -f $APP_DIR/docker-compose.yml logs -f"
echo "  升级：    cd $APP_DIR && git pull && sudo docker compose up -d --build"