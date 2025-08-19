# Simple production image
FROM node:20-alpine

# Prisma needs openssl on alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client (no migrations at build time)
RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
