# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN node tools/generate-env.js && npm run build

# Nginx runtime
FROM nginx:alpine
COPY --from=build /app/dist/clear-songs-front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
