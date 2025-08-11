# Astro Frontend Dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy workspace package.json and install root dependencies
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages/
COPY apps/astro/package*.json ./apps/astro/
RUN npm install --workspaces=false

# Install app dependencies
WORKDIR /app/apps/astro
RUN npm install

# Copy source code
COPY apps/astro ./

# Fix TypeScript config for Docker (remove extend to avoid path issues)
RUN sed -i '2d' tsconfig.json

EXPOSE 5174
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]
