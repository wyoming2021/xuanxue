# ---------- 构建阶段 ----------
FROM node:20-alpine AS builder
WORKDIR /app

ENV HUSKY=0
# 复制依赖清单（利用 Docker 层缓存）
COPY package.json package-lock.json ./
# sharp 需要 postinstall；husky 被 HUSKY=0 跳过
RUN npm ci

# 复制源码并构建（output: standalone）
COPY . .
RUN npm run build

# ---------- 运行阶段 ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 非 root 运行
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# standalone 产物（含 server.js 与运行时 node_modules）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 静态资源与 public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]