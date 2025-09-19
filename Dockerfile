FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# ❌ REMOVE this line
# RUN shopify app dev

# ✅ Instead, just start your Remix app
CMD ["npm", "run", "docker-start"]
