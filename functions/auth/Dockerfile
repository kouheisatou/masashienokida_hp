FROM node:20-slim

WORKDIR /function

# Install Oracle Instant Client dependencies
RUN apt-get update && apt-get install -y \
    libaio1 \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy shared module first
COPY ../shared /function/shared
WORKDIR /function/shared
RUN npm install && npm run build

# Copy function files
WORKDIR /function/app
COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

# Set environment variables
ENV NODE_ENV=production

# OCI Functions entry point
CMD ["node", "dist/index.js"]
