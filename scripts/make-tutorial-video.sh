#!/usr/bin/env bash
#
# 自动生成「玄学站新手教程」视频：
#   每步：PowerShell TTS 中文配音（wav） → ffmpeg 生成文字卡片视频（1280x720）→ 拼接为 mp4
#
# 用法：bash scripts/make-tutorial-video.sh [输出路径]
# 依赖：Windows PowerShell（自带中文语音）、ffmpeg
set -euo pipefail

# ---- 配置 ----
WORKDIR="/tmp/xuanyu-video"
OUT="${1:-$PWD/tutorial-video.mp4}"
FONT="C:/Windows/Fonts/msyh.ttc"
W=1280
H=720
# Windows 程序统一用正斜杠路径（cygpath -m），避免反斜杠被当作转义符
WIN="$(cygpath -m "$WORKDIR")"

# 步骤定义：标题|配音文案（显示标题 + 语音讲解）
STEPS=(
  "第一步：注册账号|搭建玄学站需要四个免费账号：Supabase 数据库、硅基流动 AI 写作、域名，还有一台 VPS 服务器。"
  "第二步：解析域名|在域名商后台，把域名加一条 A 记录，指向你 VPS 的公网 IP，几分钟就能生效。"
  "第三步：一键部署|在 VPS 终端执行一条命令，脚本会自动完成网站安装、环境配置和 HTTPS 证书。"
  "第四步：发布文章|用管理员邮箱登录后台，点击 AI 写文章，选直接发布，一分钟就能自动生成一篇玄学文章。"
  "第五步：接入收款|在虎皮椒注册商户，把 APP 密钥填进配置，用户就能付费解锁排盘和会员了。"
  "第六步：谷歌收录|在谷歌搜索控制台验证你的域名，提交网站地图，让 AI 每天写的文章被谷歌收录。"
  "第七步：开始盈利|工具付费加会员卡，再结合谷歌广告和一对一咨询，你的玄学网站就能持续赚钱。"
  "玄语站长计划|低成本搭建，AI 自动更新，让每个人都能拥有自己的玄学网站。"
)

# ---- 清理并准备 ----
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR/clips"

# ---- 主循环：每步生成配音 + 文字卡片 ----
i=1
for step in "${STEPS[@]}"; do
  title="${step%%|*}"
  speech="${step#*|}"
  printf '%s' "$speech" > "$WORKDIR/speech.txt"
  printf '%s' "$title" > "$WORKDIR/title.txt"

  echo "[$i] 生成配音：$title"
  powershell -NoProfile -ExecutionPolicy Bypass -File "scripts/video-tts.ps1" \
    -TextPath "$WIN/speech.txt" \
    -WavPath "$WIN/audio$i.wav"

  dur="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$WIN/audio$i.wav")"
  echo "[$i] 音频时长 ${dur}s，生成视频片段..."

  # drawtext 中路径含冒号（C:/...）：用单引号包裹值，且冒号用 \: 转义（经实验验证可行）
  FONT_F="'${FONT//:/\\:}'"
  TITLE_F="'${WIN//:/\\:}/title.txt'"

  ffmpeg -y -v error \
    -f lavfi -i "color=c=0x1c1917:s=${W}x${H}:d=${dur}" \
    -i "$WIN/audio$i.wav" \
    -vf "drawtext=fontfile=${FONT_F}:textfile=${TITLE_F}:fontcolor=white:fontsize=56:x=(w-text_w)/2:y=h*0.35" \
    -c:v libx264 -preset veryfast -pix_fmt yuv420p \
    -c:a aac -b:a 128k \
    -shortest \
    "$WIN/clips/step$i.mp4"

  i=$((i + 1))
done

# ---- 拼接 ----
echo "拼接所有片段..."
: > "$WORKDIR/list.txt"
for f in "$WORKDIR/clips"/step*.mp4; do
  printf "file '%s'\n" "$(cygpath -m "$f")" >> "$WORKDIR/list.txt"
done

ffmpeg -y -v error -f concat -safe 0 -i "$WORKDIR/list.txt" -c copy "$OUT"

echo "✅ 视频生成成功：$OUT"
echo "总时长：$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT") 秒"