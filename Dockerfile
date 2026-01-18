ARG bun_image=oven/bun:slim

FROM $bun_image AS builder
WORKDIR /kalovrat-admin
COPY . .
RUN bun i --frozen-lockfile
RUN bunx prisma generate
RUN bun run build

FROM $bun_image AS runner
WORKDIR /kalovrat-admin
ENV NODE_ENV=production

COPY --from=builder /kalovrat-admin/.next/standalone .
COPY --from=builder /kalovrat-admin/.next/static ./.next/static

EXPOSE 3000
CMD ["bun", "server.js"]
