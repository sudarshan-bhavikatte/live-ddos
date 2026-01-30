FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

# Using node directly since node 23+ supports stripping types for .ts files
CMD ["node", "server.ts"]
