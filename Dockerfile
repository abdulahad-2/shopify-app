FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# 0️⃣ Set Shopify + HOST env vars explicitly for build & runtime
ENV NODE_ENV=production
ENV HOST=https://shopify-app-2d2n.onrender.com
ENV SHOPIFY_API_KEY=<your_api_key>
ENV SHOPIFY_API_SECRET=<your_api_secret>
ENV SHOPIFY_ACCESS_TOKEN=<your_access_token>
ENV SHOPIFY_API_VERSION=2025-07

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
