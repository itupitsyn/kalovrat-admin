ARG bun_image=oven/bun:alpine

FROM $bun_image AS builder
WORKDIR /gift-list
COPY . .
RUN bun i --frozen-lockfile
RUN bunx prisma generate
RUN bun run build

FROM $bun_image AS runner
WORKDIR /gift-list
ENV NODE_ENV=production

COPY --from=builder /gift-list/.next/standalone .
COPY --from=builder /gift-list/public ./public
COPY --from=builder /gift-list/.next/static ./.next/static

EXPOSE 3000
CMD ["bun", "server.js"]
