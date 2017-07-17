FROM nginx:alpine

COPY docker/nginx-dev/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx-dev/sites-available /etc/nginx/sites-available
RUN mkdir /etc/nginx/sites-enabled
RUN ln -s /etc/nginx/sites-available/modlogs.local /etc/nginx/sites-enabled/modlogs.local
RUN ln -s /etc/nginx/sites-available/login.modlogs.local /etc/nginx/sites-enabled/login.modlogs.local

RUN mkdir /etc/nginx/ssl
COPY docker/nginx-dev/modlogs.local.crt /etc/nginx/ssl/modlogs.local.crt
COPY docker/nginx-dev/modlogs.local.key /etc/nginx/ssl/modlogs.local.key
