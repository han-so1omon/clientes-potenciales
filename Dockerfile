# Production image for the web app (used by Railway; works on any Docker host).
# Official Node image via the AWS public mirror (avoids Docker Hub pull rate limits).
FROM public.ecr.aws/docker/library/node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3000
CMD ["sh", "scripts/start.sh"]
