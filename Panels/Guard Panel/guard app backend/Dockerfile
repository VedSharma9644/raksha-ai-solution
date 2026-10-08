# Build from monorepo root (paths with spaces are staged into /app/backend):
#   docker build -f "Panels/Guard Panel/guard app backend/Dockerfile" -t raskha-guard-app-api .
FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY core ./core
COPY shared ./shared
COPY modules ./modules
COPY ["Panels/Guard Panel/guard app backend/docker-package.json", "./backend/package.json"]
COPY ["Panels/Guard Panel/guard app backend/scripts", "./backend/scripts"]
COPY ["Panels/Guard Panel/guard app backend/src", "./backend/src"]

WORKDIR /app/backend
ENV MONOREPO_ROOT=/app

RUN npm install --no-save --no-audit --no-fund \
      esbuild@0.25.0 express dotenv firebase firebase-admin \
    && node scripts/build.mjs

FROM node:20-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=build /app/backend/dist ./dist

RUN npm init -y >/dev/null \
    && npm install --omit=dev --no-audit --no-fund express dotenv firebase firebase-admin \
    && npm cache clean --force

EXPOSE 8080
CMD ["node", "dist/server.js"]
