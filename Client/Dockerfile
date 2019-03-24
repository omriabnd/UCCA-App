# Builds the Webserver Docker file.
# In two stages. First - generate the frontend files
FROM node:8-jessie as builder
COPY . src
WORKDIR src
RUN npm install
RUN ./node_modules/.bin/bower install --allow-root
RUN ./node_modules/.bin/gulp inject
RUN ./node_modules/.bin/gulp serve:dist

FROM nginx
COPY --from=builder /src/release www
COPY ucca.conf /etc/nginx/conf.d/default.conf
