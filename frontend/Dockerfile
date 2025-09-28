FROM node:18

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"] # 또는 "npm run preview" (Vite일 경우)
