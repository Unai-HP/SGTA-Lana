FROM node:13-alpine as build
WORKDIR /app
COPY package*.json /app/
RUN npm install -g ionic
RUN npm install
COPY ./ /app/
RUN npm run-script build

FROM nginx:alpine
WORKDIR /app
COPY --from=build /app/build .
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/build /usr/share/nginx/html/
EXPOSE 80

FROM build
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE 8080
CMD [ "node", "--experimental-modules", "./src/scrappingScripts/app.js" ]