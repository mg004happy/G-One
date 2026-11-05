# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies using clean install
COPY package*.json ./
RUN npm ci

# Copy source code and build the bundle
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
