FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install && npm rebuild bcrypt --build-from-source

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
