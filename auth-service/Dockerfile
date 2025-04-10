FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
CMD ["npx", "prisma", "generate"]
CMD ["npm", "run", "migrate:dev"]
CMD ["npm", "run", "seed"]