# ---- Base ----
FROM node:18-alpine AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci --no-audit --prefer-offline

# Копируем Prisma схемы и генерируем клиент уже здесь
COPY prisma ./prisma
RUN npx prisma generate

# ---- Builder ----
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---- Runner ----
FROM base AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# ВАЖНО — Копируем node_modules уже с готовым Prisma Client
COPY --from=deps /app/node_modules ./node_modules

# Копируем Prisma схему (не обязательно)
COPY prisma ./prisma

USER nextjs

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]