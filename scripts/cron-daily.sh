#!/usr/bin/env bash
#
# 每日自动生成一篇玄学文章（由 crontab 调用，无需登录）
# 读取 /opt/xuanyu/.env.local 中的 CRON_SECRET 与站点地址，
# 调用 /api/cron/generate-article 让服务端生成并发布一篇文章。
set -euo pipefail

ENV_FILE="${XUANYU_DIR:-/opt/xuanyu}/.env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "[cron-daily] 未找到 $ENV_FILE，跳过。"
  exit 0
fi

# 从 .env.local 读取变量（兼容 KEY=value 和 KEY="value 带空格" 两种格式，
# 避免 bash source 遇到带尖括号/空格的发件人地址时报语法错误）。
get_env() {
  local key="$1"
  grep -E "^${key}=" "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'"
}

SITE_URL="$(get_env NEXT_PUBLIC_SITE_URL)"
CRON_SECRET="$(get_env CRON_SECRET)"
CRON_URL="${SITE_URL}/api/cron/generate-article"

if [[ -z "$SITE_URL" || -z "${CRON_SECRET:-}" ]]; then
  echo "[cron-daily] 缺少 NEXT_PUBLIC_SITE_URL 或 CRON_SECRET，跳过。"
  exit 0
fi

echo "[cron-daily] 开始生成今日玄学文章..."
curl -fsS -m 600 \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "$CRON_URL" || echo "[cron-daily] 生成请求失败（可能未配置 AI_API_KEY）。"