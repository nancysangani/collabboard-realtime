# Step 1: Build frontend
FROM node:20 AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

# Step 2: Setup backend
FROM node:20

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install

COPY server ./server

# Copy frontend build into server
COPY --from=client-build /app/client/dist ./client/dist

WORKDIR /app/server

EXPOSE 5000

CMD ["npm", "start"]
