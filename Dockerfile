# ---- Runner ----
FROM base AS runner

WORKDIR /app

# Создаем пользователя и группу
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Копируем node_modules.
COPY --from=deps /app/node_modules ./node_modules

# Копируем Prisma схему
COPY prisma ./prisma

# 🌟 ИСПРАВЛЕНИЕ: Изменяем владельца, чтобы пользователь nextjs мог писать в папку node_modules/prisma
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV NODE_ENV=production

# Запускаем генерацию и старт
CMD npx prisma generate && npm start