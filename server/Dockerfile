FROM node:18-alpine

WORKDIR /usr/src/app

# Install Python and build tools for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Clean up build tools to reduce image size
RUN apk del python3 make g++

# Expose the port the app runs on
EXPOSE $PORT

# Command to run the application
CMD ["npm", "start"]
