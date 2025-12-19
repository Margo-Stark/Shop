FROM nginx:alpine

COPY frontend/ /usr/share/nginx/html/
COPY images/ /usr/share/nginx/html/images/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
