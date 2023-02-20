# syntax=docker/dockerfile:1
FROM node:19.6.0-alpine 
RUN apk update && apk add bash

ENV NODE_ENV=test

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY dist dist

CMD node dist/app.js