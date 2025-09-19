FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 3000
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# 1️⃣ Build Remix first
RUN npm run build

# 2️⃣ Prisma setup
RUN npx prisma generate
RUN npx prisma migrate deploy

# 3️⃣ Start Remix server (auto-detects build folder)
CMD ["npx", "remix-serve", "build"]
