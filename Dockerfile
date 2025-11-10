# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Accept build arguments for Supabase credentials
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Set as environment variables for the build (Vite will read these)
ENV SUPABASE_URL=${VITE_SUPABASE_URL}
ENV SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

COPY package*.json ./
RUN npm ci || npm install

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy your nginx config (it's in the same folder as Dockerfile)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8085
EXPOSE 8085

# Healthcheck updated too
HEALTHCHECK NONE
