FROM nginx:alpine

# nginx ayarı (cache kapalı + utf-8)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Site dosyaları (.dockerignore'da olmayanlar)
COPY . /usr/share/nginx/html

# Webroot'tan Docker/meta dosyalarını temizle (gerek yok, servis edilmesin)
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/docker-compose.yml \
          /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/.dockerignore

EXPOSE 80
