FROM node:12

WORKDIR /usr/src/app

COPY yarn.lock ./
COPY package.json ./

RUN yarn install

COPY . .

EXPOSE 5000

RUN yarn build

CMD ["yarn", "serve"]
