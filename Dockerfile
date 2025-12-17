# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN node tools/generate-env.js && npm run build

# Nginx runtime
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Optional: custom nginx config for SPA
RUN rm -f /etc/nginx/conf.d/default.conf
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
EOF
EXPOSE 80
