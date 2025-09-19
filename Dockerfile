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

# Expose default port (Render will override anyway)
EXPOSE 3000

# Start app
CMD ["npm", "start"]
