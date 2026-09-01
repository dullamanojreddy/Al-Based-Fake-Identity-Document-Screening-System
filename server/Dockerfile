# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and compile TypeScript
COPY . ./
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy compiled JavaScript output
COPY --from=build /app/dist ./dist

# Create upload and log directories
RUN mkdir -p uploads logs

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/index.js"]
