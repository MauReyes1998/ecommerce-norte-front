# ---- Build: Vite genera los estáticos ----
FROM node:22-alpine AS build
WORKDIR /app
# La URL del API se fija al compilar. Con nginx como proxy basta la ruta relativa /api/v1.
ARG VITE_API_URL=/api/v1
ARG VITE_WHATSAPP=
ENV VITE_API_URL=$VITE_API_URL VITE_WHATSAPP=$VITE_WHATSAPP
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# ---- Runtime: nginx sirve la SPA y pasa /api, /uploads y /sitemap.xml al backend ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
