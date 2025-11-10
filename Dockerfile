# ---- Build stage: compile the Vite app to static assets ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
# Use npm ci if you have a package-lock.json, otherwise npm install
RUN npm ci

# Copy source and build
COPY . .
# If your build script is `vite build`, this just works
RUN npm run build

# ---- Runtime stage: serve static files with nginx ----
FROM nginx:1.27-alpine

# Copy SPA build output to Nginx public dir
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default site config with SPA-friendly fallback
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# Optional: keep image small and secure
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q -O- http://localhost/ || exit 1
