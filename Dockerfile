FROM node:12-alpine as builder

WORKDIR /app
COPY package.json /app/package.json
RUN apk --no-cache add --virtual builds-deps build-base python
RUN yarn 
COPY . /app
RUN yarn run build

FROM node:12-alpine
WORKDIR /app
COPY package.json /app/package.json
RUN yarn 
COPY --from=builder /app/build /app/build/
COPY /server /app
# RUN apk --no-cache add --virtual builds-deps build-base python
EXPOSE 3001
CMD ["node", "index.js"]