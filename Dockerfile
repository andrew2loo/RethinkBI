# Dockerfile for Linux Container (can build Windows apps via Electron Builder)
# Usage: docker build -t rethinkbi:build .

FROM node:20-slim

# Install dependencies needed for Electron and native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libx11-dev \
    libxext-dev \
    libxss1 \
    libgconf-2-4 \
    libxtst6 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install wine for Windows builds (optional, for cross-platform building)
# RUN apt-get update && apt-get install -y wine64 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
# Copy lock file if it exists, otherwise generate it
COPY package-lock.json* ./

# Install dependencies (use install if lock file is missing/out of sync)
RUN npm install || npm ci

# Copy source code
COPY . .

# Default command - build the app
CMD ["npm", "run", "build"]


