# backend/Dockerfile
FROM node:18

# Ajout de wait-for-it pour attendre MySQL
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Attendre que MySQL soit dispo avant de lancer npm start
CMD ["/wait-for-it.sh", "petsitting-db:3306", "--", "npm", "start"]