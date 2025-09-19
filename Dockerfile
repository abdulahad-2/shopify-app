FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# 1️⃣ Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# 2️⃣ Copy all source
COPY . .

# 3️⃣ Build Remix app
RUN npm run build

# 4️⃣ Expose port
EXPOSE 3000

# 5️⃣ Start Shopify Remix server
CMD ["node", "build/server/index.js"]
