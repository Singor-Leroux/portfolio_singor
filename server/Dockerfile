FROM node:18-alpine

WORKDIR /usr/src/app

# Install Python, build tools and dependencies needed for building
RUN apk add --no-cache --virtual .gyp python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies for building
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies and build tools
RUN npm prune --production
RUN apk del .gyp

# Expose the port the app runs on
EXPOSE $PORT

# Command to run the application
CMD ["npm", "start"]
