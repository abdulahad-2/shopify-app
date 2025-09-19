FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# 1️⃣ Install all dependencies (dev + prod)
COPY package*.json ./
RUN npm ci

# 2️⃣ Copy all source
COPY . .

# 3️⃣ Generate Prisma client + deploy migrations
RUN npx prisma generate
RUN npx prisma migrate deploy

# 4️⃣ Build Remix app
RUN npm run build

# 5️⃣ Expose port
EXPOSE 3000

# 6️⃣ Start Shopify Remix server
CMD ["node", "build/server/index.js"]
