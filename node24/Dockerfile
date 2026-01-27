FROM node:24.13.0-slim

WORKDIR /app

COPY package.json tsconfig.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/test.js"]
