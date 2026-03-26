# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Prisma config is loaded during build, so provide a fallback DATABASE_URL.
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bookstore?schema=public
ENV DATABASE_URL=${DATABASE_URL}

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./prisma.config.ts

RUN npm ci --omit=dev
RUN npm install prisma@7.5.0 --no-save

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
