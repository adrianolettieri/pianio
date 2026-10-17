FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@10.18.3

# Cache dependencies independently of source and content changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/content-schema/package.json ./packages/content-schema/package.json
COPY packages/core-engine/package.json ./packages/core-engine/package.json
COPY packages/midi-web/package.json ./packages/midi-web/package.json
COPY packages/notation/package.json ./packages/notation/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:stable-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist/ /usr/share/nginx/html/
COPY LICENSE /usr/share/nginx/html/LICENSE
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
