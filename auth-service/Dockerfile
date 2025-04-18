FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && \
    apt-get install -y netcat-openbsd postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm install
RUN npx prisma generate

# Copy the rest of the files
COPY . .

# Make entrypoint executable
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "start:dev"]