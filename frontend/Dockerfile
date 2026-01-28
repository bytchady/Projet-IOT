FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx ng build --configuration production

# Étape 2 : Nginx
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# Copier le contenu du dossier browser (le vrai build Angular)
COPY --from=build /app/dist/IOT/browser/. /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
