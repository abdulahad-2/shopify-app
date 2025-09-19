FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# 1️⃣ Build Remix
RUN npm run build

# 2️⃣ Prisma
RUN npx prisma generate
RUN npx prisma migrate deploy

# 3️⃣ Expose port
EXPOSE 3000

# 4️⃣ Start Remix server (Node adapter)
CMD ["node", "build/index.js"]
