FROM nginx:alpine

# Copy website files
COPY index.html /usr/share/nginx/html/
COPY page2.html /usr/share/nginx/html/
COPY analytics.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
