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

# 读取配置（不输出到日志）
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

SITE_URL="${NEXT_PUBLIC_SITE_URL:-}"
CRON_URL="${SITE_URL}/api/cron/generate-article"

if [[ -z "$SITE_URL" || -z "${CRON_SECRET:-}" ]]; then
  echo "[cron-daily] 缺少 NEXT_PUBLIC_SITE_URL 或 CRON_SECRET，跳过。"
  exit 0
fi

echo "[cron-daily] 开始生成今日玄学文章..."
curl -fsS -m 120 \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "$CRON_URL" || echo "[cron-daily] 生成请求失败（可能未配置 AI_API_KEY）。"