FROM nginx:alpine

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/sites-available /etc/nginx/sites-available
RUN mkdir /etc/nginx/sites-enabled
RUN ln -s /etc/nginx/sites-available/modlogs.fyi /etc/nginx/sites-enabled/modlogs.fyi
RUN ln -s /etc/nginx/sites-available/login.modlogs.fyi /etc/nginx/sites-enabled/login.modlogs.fyi
