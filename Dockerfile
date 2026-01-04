# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 根據專案使用的套件管理員複製對應的 lock 檔案
COPY package.json pnpm-lock.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    else npm i; \
    fi

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 收集匿名遙測數據，這裡可以選擇禁用
ENV NEXT_TELEMETRY_DISABLED 1

RUN if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
    else npm run build; \
    fi

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製必要的檔案以運行 Next.js
COPY --from=builder /app/public ./public

# 這裡使用 Next.js 的 standalone 輸出功能（需要在 next.config.ts 中配置）
# 如果沒有配置 standalone，則需要複製整個 .next 和 node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
