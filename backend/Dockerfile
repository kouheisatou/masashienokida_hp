FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN apk add --no-cache openssl

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
