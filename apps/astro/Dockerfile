# Astro Frontend Dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy entire workspace structure
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages/
COPY apps/astro ./apps/astro/
COPY shared ./shared/

# Install root dependencies
RUN npm install --legacy-peer-deps

# Install all workspace packages
RUN npm run build:packages || echo "No build:packages script"

# Install astro app dependencies
WORKDIR /app/apps/astro
RUN npm install --legacy-peer-deps

# Fix TypeScript config for Docker (remove extend to avoid path issues)
RUN sed -i '2d' tsconfig.json 2>/dev/null || echo "No extend line to remove"

EXPOSE 5174
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]
