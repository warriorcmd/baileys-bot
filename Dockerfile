FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p session uploads
RUN chmod -R 777 session uploads

EXPOSE 3000

CMD ["npm", "start"]
