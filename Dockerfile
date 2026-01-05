# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.19.0
FROM node:${NODE_VERSION}-slim AS base

LABEL andasy_launch_runtime="Node.js"

WORKDIR /app

# -------------------------
# BUILD STAGE (DEV DEPS)
# -------------------------
FROM base AS build

# Install tools for building
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Copy dependency files
COPY package.json package-lock.json ./

# Install all dependencies including dev
RUN npm ci

# Copy project
COPY . .

# Build frontend for production
RUN npm run build

# -------------------------
# PRODUCTION STAGE
# -------------------------
FROM node:${NODE_VERSION}-slim AS production

WORKDIR /app
ENV NODE_ENV=production

# Copy build artifacts and node_modules
COPY --from=build /app /app

# Expose port for Andasy
EXPOSE 3000

# Use IPv6 binding for Andasy internal proxy
CMD ["npm", "run", "start"]
