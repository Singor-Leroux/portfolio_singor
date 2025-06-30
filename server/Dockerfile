FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies after build
RUN npm prune --omit=dev

# Expose the port the app runs on
EXPOSE 10000

# Command to run the application
CMD ["npm", "start"]
