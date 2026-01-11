FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY apps/api-gateway ./apps/api-gateway
COPY libs/shared ./libs/shared

RUN npm install
RUN npx nest build api-gateway

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/main"]
