FROM node:12

WORKDIR /usr/src/app

COPY yarn.lock ./
COPY package.json ./

RUN yarn install

COPY . .

RUN echo "${DOTENV_CONTENT}" >> .env

EXPOSE 5000

RUN yarn build

CMD ["node", "dist/index.js"]
