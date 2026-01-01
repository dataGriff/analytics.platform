# Dockerfile for Chat App
FROM nginx:alpine

# Copy chat app files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY analytics.js /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
