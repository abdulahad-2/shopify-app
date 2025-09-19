FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files & install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Remix app
RUN npm run build

# Expose default port (Render uses dynamic PORT, not hardcoded)
EXPOSE 3000

# Start app (Render sets PORT env var)
CMD ["npm", "start"]

