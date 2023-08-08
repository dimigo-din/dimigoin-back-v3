FROM node:12-alpine

WORKDIR /usr/src/app

COPY yarn.lock ./
COPY package.json ./

RUN yarn install

RUN apk add tzdata  \
    && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime  \
    && echo "Asia/Seoul" > /etc/timezone

COPY . .

EXPOSE 5000

RUN yarn build

CMD ["yarn", "serve"]
